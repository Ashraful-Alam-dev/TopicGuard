import { ConflictException, Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Prisma, Topic } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { SubmissionService } from '../submission/submission.service';
import { TopicDto } from './dto/topic.dto';
import { normalizeTitle } from '../common/utils/normalize-title.util';
import { EmbeddingService } from '../embedding/embedding.service';
import { TopicVectorRepository } from './topic-vector.repository';
import { SimilarityCheckResponseDto } from './dto/similarity-check-response.dto';
import { AvailableMemberDto } from './dto/available-member.dto';
import { TopicMemberSummary } from './dto/topic-response.dto';
import { RateLimiterService } from '../common/rate-limit/rate-limiter.service';
import {
  TOPIC_WRITE_LIMIT,
  TOPIC_WRITE_LIMIT_MESSAGE,
  TOPIC_WRITE_WINDOW_MS,
} from './topic.constants';

/** Number of matches returned by the semantic similarity check. */
const SIMILAR_TOPICS_LIMIT = 5;

/** Any Prisma client capable of running queries — the real client or a $transaction callback client. */
type PrismaExecutor = PrismaService | Prisma.TransactionClient;

const MEMBER_SELECT = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

/** tx.topic.create()/update() only return the raw Topic row (no relations), but register/update responses need leader+members to reflect the team that was just saved. */
type TopicWithTeam = Topic & {
  leader: TopicMemberSummary;
  members: TopicMemberSummary[];
};

@Injectable()
export class TopicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly submissionService: SubmissionService,
    private readonly embeddingService: EmbeddingService,
    private readonly topicVectorRepository: TopicVectorRepository,
    private readonly rateLimiter: RateLimiterService,
  ) { }

  /** Shared by register/update — both trigger an embedding generation call. */
  private enforceWriteLimit(studentId: string): void {
    this.rateLimiter.consume(`topic-write:${studentId}`, {
      limit: TOPIC_WRITE_LIMIT,
      windowMs: TOPIC_WRITE_WINDOW_MS,
      message: TOPIC_WRITE_LIMIT_MESSAGE,
    });
  }

  async registerTopic(
    submissionId: string,
    studentId: string,
    dto: TopicDto,
  ): Promise<TopicWithTeam> {
    this.enforceWriteLimit(studentId);

    const submission = await this.submissionService.assertCanRegisterTopic(
      submissionId,
      studentId,
    );

    const memberIds = this.normalizeMemberIds(dto.memberIds, studentId);

    const normalizedTitle = normalizeTitle(dto.title);

    const embedding =
      await this.embeddingService.generateEmbedding(dto.title.trim());

    return this.prisma.$transaction(async (tx) => {
      // Serialize any concurrent request touching the same
      // (submission, student) pairs before re-checking availability. See
      // lockStudentsForSubmission for details/limitations.
      await this.lockStudentsForSubmission(tx, submissionId, [
        studentId,
        ...memberIds,
      ]);

      await this.assertSubmissionStillOpen(tx, submissionId);

      // Re-check leader + members are not already participating in a
      // topic under this submission, now that we hold the locks.
      await this.assertStudentsAvailable(tx, submissionId, [
        studentId,
        ...memberIds,
      ]);

      await this.assertNoDuplicateTitle(tx, submissionId, normalizedTitle);

      if (memberIds.length > 0) {
        await this.assertMembersBelongToClassroom(
          tx,
          submission.classroomId,
          memberIds,
        );
      }

      const topic = await tx.topic.create({
        data: {
          submissionId,
          studentId,
          originalTitle: dto.title,
          normalizedTitle,
        },
      });

      if (memberIds.length > 0) {
        await tx.topicMember.createMany({
          data: memberIds.map((memberId) => ({
            topicId: topic.id,
            submissionId,
            studentId: memberId,
          })),
        });
      }

      await this.topicVectorRepository.upsertEmbedding(
        tx,
        topic.id,
        embedding,
      );

      return this.attachTeamInfo(tx, topic, studentId, memberIds);
    });
  }

  async updateOwnTopic(
    submissionId: string,
    studentId: string,
    dto: TopicDto,
  ): Promise<TopicWithTeam> {
    this.enforceWriteLimit(studentId);

    await this.submissionService.assertCanRegisterTopic(
      submissionId,
      studentId,
    );

    const topic = await this.getLeaderTopicOrThrow(submissionId, studentId);

    const memberIds = this.normalizeMemberIds(dto.memberIds, studentId);

    const normalizedTitle = normalizeTitle(dto.title);
    const titleChanged = normalizedTitle !== topic.normalizedTitle;

    const embedding = titleChanged
      ? await this.embeddingService.generateEmbedding(dto.title.trim())
      : null;

    return this.prisma.$transaction(async (tx) => {
      await this.lockStudentsForSubmission(tx, submissionId, [
        studentId,
        ...memberIds,
      ]);

      const submission = await this.assertSubmissionStillOpen(
        tx,
        submissionId,
      );

      if (titleChanged) {
        await this.assertNoDuplicateTitle(
          tx,
          submissionId,
          normalizedTitle,
          topic.id,
        );
      }

      if (memberIds.length > 0) {
        await this.assertMembersBelongToClassroom(
          tx,
          submission.classroomId,
          memberIds,
        );
      }

      // Members already on THIS topic are allowed to stay — excludeTopicId
      // keeps the check scoped to conflicts with OTHER topics.
      await this.assertStudentsAvailable(
        tx,
        submissionId,
        memberIds,
        topic.id,
      );

      const updated = await tx.topic.update({
        where: { id: topic.id },
        data: {
          originalTitle: dto.title,
          normalizedTitle,
        },
      });

      // Simplest safe way to sync membership: replace the set. Cheap given
      // team sizes are small, and keeps this transactional.
      await tx.topicMember.deleteMany({ where: { topicId: topic.id } });
      if (memberIds.length > 0) {
        await tx.topicMember.createMany({
          data: memberIds.map((memberId) => ({
            topicId: topic.id,
            submissionId,
            studentId: memberId,
          })),
        });
      }

      if (titleChanged && embedding) {
        await this.topicVectorRepository.upsertEmbedding(
          tx,
          updated.id,
          embedding,
        );
      }

      return this.attachTeamInfo(tx, updated, studentId, memberIds);
    });
  }

  async deleteOwnTopic(
    submissionId: string,
    studentId: string,
  ): Promise<void> {
    await this.submissionService.assertCanRegisterTopic(
      submissionId,
      studentId,
    );

    const topic = await this.getLeaderTopicOrThrow(submissionId, studentId);

    // TopicMember.topic has onDelete: Cascade in schema.prisma, so deleting
    // the topic frees up all its members automatically. Deleting inside a
    // transaction anyway keeps this robust if that cascade is ever changed.
    await this.prisma.$transaction(async (tx) => {
      await tx.topicMember.deleteMany({ where: { topicId: topic.id } });
      await tx.topic.delete({ where: { id: topic.id } });
    });
  }

  async getOwnTopic(
    submissionId: string,
    studentId: string,
  ) {
    await this.submissionService.assertMemberAccess(
      submissionId,
      studentId,
    );

    return this.getOwnTopicOrThrow(
      submissionId,
      studentId,
    );
  }

  /** Returns classroom members eligible to be added as team members: they belong to the classroom, aren't already leading or participating in another topic under this submission, and aren't the requester themselves (who is, or would become, the leader — not a "member"). */
  async getAvailableMembers(
    submissionId: string,
    requesterId: string,
  ): Promise<AvailableMemberDto[]> {
    const submission = await this.submissionService.assertMemberAccess(
      submissionId,
      requesterId,
    );

    const [classroomMembers, leaderRows, memberRows] = await Promise.all([
      this.prisma.classroomMember.findMany({
        where: { classroomId: submission.classroomId },
        select: { user: { select: MEMBER_SELECT } },
      }),
      this.prisma.topic.findMany({
        where: { submissionId },
        select: { studentId: true },
      }),
      this.prisma.topicMember.findMany({
        where: { submissionId },
        select: { studentId: true },
      }),
    ]);

    const takenIds = new Set<string>([
      ...leaderRows.map((r) => r.studentId),
      ...memberRows.map((r) => r.studentId),
      requesterId,
    ]);

    return classroomMembers
      .map((cm) => cm.user)
      .filter((user) => !takenIds.has(user.id))
      .map((user) => AvailableMemberDto.fromEntity(user));
  }

  // Membership / availability helpers

  /** Leader including their own id in memberIds is a request error, not a silent no-op — the leader/member distinction matters elsewhere. */
  private normalizeMemberIds(
    memberIds: string[] | undefined,
    leaderId: string,
  ): string[] {
    const ids = memberIds ?? [];
    if (ids.includes(leaderId)) {
      throw new BadRequestException(
        'The topic leader cannot also be added as a team member',
      );
    }
    return ids;
  }

  /** Verifies none of the given students already participate (as leader or member) in a DIFFERENT topic under this submission. */
  private async assertStudentsAvailable(
    tx: Prisma.TransactionClient,
    submissionId: string,
    studentIds: string[],
    excludeTopicId?: string,
  ): Promise<void> {
    const uniqueIds = [...new Set(studentIds)];
    if (uniqueIds.length === 0) {
      return;
    }

    const [leaderConflict, memberConflict] = await Promise.all([
      tx.topic.findFirst({
        where: {
          submissionId,
          studentId: { in: uniqueIds },
          ...(excludeTopicId ? { id: { not: excludeTopicId } } : {}),
        },
        select: { student: { select: { name: true } } },
      }),
      tx.topicMember.findFirst({
        where: {
          submissionId,
          studentId: { in: uniqueIds },
          ...(excludeTopicId ? { topicId: { not: excludeTopicId } } : {}),
        },
        select: { student: { select: { name: true } } },
      }),
    ]);

    const conflict = leaderConflict ?? memberConflict;
    if (conflict) {
      throw new ConflictException(
        `${conflict.student.name} is already participating in another topic for this submission`,
      );
    }
  }

  private async assertMembersBelongToClassroom(
    tx: Prisma.TransactionClient,
    classroomId: string,
    memberIds: string[],
  ): Promise<void> {
    const memberships = await tx.classroomMember.findMany({
      where: { classroomId, userId: { in: memberIds } },
      select: { userId: true },
    });

    const validIds = new Set(memberships.map((m) => m.userId));
    const invalid = memberIds.filter((id) => !validIds.has(id));

    if (invalid.length > 0) {
      throw new BadRequestException(
        'One or more selected members do not belong to this classroom',
      );
    }
  }

  /** Race-condition guard: the "one topic per submission" rule spans two tables, so it can't be enforced with a single DB constraint — this re-checks it inside the transaction instead. */
  private async lockStudentsForSubmission(
    tx: Prisma.TransactionClient,
    submissionId: string,
    studentIds: string[],
  ): Promise<void> {
    const sortedUniqueIds = [...new Set(studentIds)].sort();
    for (const studentId of sortedUniqueIds) {
      const lockKey = `${submissionId}:${studentId}`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;
    }
  }

  /**
   * tx.topic.create()/update() return the bare Topic row. This fetches the
   * leader and current members (by id, within the same transaction) so
   * register/update responses reflect the team that was just saved.
   */
  private async attachTeamInfo(
    tx: Prisma.TransactionClient,
    topic: Topic,
    leaderId: string,
    memberIds: string[],
  ): Promise<TopicWithTeam> {
    const [leader, members] = await Promise.all([
      tx.user.findUniqueOrThrow({
        where: { id: leaderId },
        select: MEMBER_SELECT,
      }),
      memberIds.length > 0
        ? tx.user.findMany({
          where: { id: { in: memberIds } },
          select: MEMBER_SELECT,
        })
        : Promise.resolve([]),
    ]);

    return { ...topic, leader, members };
  }

  private async assertSubmissionStillOpen(
    tx: Prisma.TransactionClient,
    submissionId: string,
  ) {
    const submission = await tx.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (!submission.isOpen) {
      throw new ForbiddenException(
        'This submission is closed and no longer accepts topic changes',
      );
    }

    return submission;
  }

  // Lookups

  /** Leader-only lookup, used by update/delete which are leader-restricted. */
  private async getLeaderTopicOrThrow(
    submissionId: string,
    studentId: string,
  ): Promise<Topic> {
    const leaderTopic = await this.prisma.topic.findUnique({
      where: {
        uq_submission_student: { submissionId, studentId },
      },
    });

    if (leaderTopic) {
      return leaderTopic;
    }

    const asMember = await this.prisma.topicMember.findFirst({
      where: { submissionId, studentId },
    });

    if (asMember) {
      throw new ForbiddenException(
        'Only the topic leader can perform this action',
      );
    }

    throw new NotFoundException(
      'You have not registered a topic for this submission',
    );
  }

  /** Leader OR member lookup, used by getOwnTopic (everyone on the team views the same topic). */
  private async findParticipantTopic(
    submissionId: string,
    studentId: string,
  ) {
    return this.prisma.topic.findFirst({
      where: {
        submissionId,
        OR: [{ studentId }, { members: { some: { studentId } } }],
      },
      include: {
        student: { select: MEMBER_SELECT },
        members: { include: { student: { select: MEMBER_SELECT } } },
      },
    });
  }

  private async getOwnTopicOrThrow(
    submissionId: string,
    studentId: string,
  ) {
    const topic = await this.findParticipantTopic(submissionId, studentId);

    if (!topic) {
      throw new NotFoundException(
        'You have not registered a topic for this submission',
      );
    }

    const threshold =
      this.configService.get<number>(
        'embedding.similarityThreshold',
      ) ?? 0.5;

    const matches =
      await this.topicVectorRepository.findSimilarTopicsByTopicId(
        this.prisma,
        submissionId,
        topic.id,
        SIMILAR_TOPICS_LIMIT,
      );

    const similarTopics = matches
      .filter((m) => m.similarity >= threshold)
      .map((m) => ({
        title: m.title,
        studentName: m.studentName,
        similarityScore: m.similarity,
      }));

    const { student, members, ...rest } = topic;

    return {
      ...rest,
      leader: student as TopicMemberSummary,
      members: members.map((m) => m.student as TopicMemberSummary),
      highestSimilarity:
        similarTopics.length > 0
          ? similarTopics[0].similarityScore
          : null,
      similarTopics,
    };
  }

  private async assertNoDuplicateTitle(
    executor: PrismaExecutor,
    submissionId: string,
    normalizedTitle: string,
    excludeTopicId?: string,
  ) {
    const duplicate = await executor.topic.findFirst({
      where: {
        submissionId,
        normalizedTitle,
        ...(excludeTopicId ? { id: { not: excludeTopicId } } : {}),
      },
      include: {
        student: {
          select: {
            name: true,
          },
        },
      },
    });

    if (duplicate) {
      throw new ConflictException(
        `"${duplicate.originalTitle}" has already been registered by ${duplicate.student.name}. Please choose a different topic.`,
      );
    }
  }

  async checkTopicAvailability(
    submissionId: string,
    userId: string,
    title: string,
    topicId?: string,
  ) {
    await this.submissionService.assertMemberAccess(
      submissionId,
      userId,
    );

    const normalizedTitle = normalizeTitle(title);

    const duplicate = await this.prisma.topic.findFirst({
      where: {
        submissionId,
        normalizedTitle,
        ...(topicId ? { id: { not: topicId } } : {}),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!duplicate) {
      return {
        available: true,
      };
    }

    return {
      available: false,
      student: duplicate.student,
    };
  }



  async getSubmissionTopics(
    submissionId: string,
    monitorId: string,
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            monitorId: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.classroom.monitorId !== monitorId) {
      throw new ForbiddenException(
        'You are not allowed to view topics for the submission',
      );
    }

    const threshold =
      this.configService.get<number>(
        'embedding.similarityThreshold',
      ) ?? 0.3;

    // One row per Topic — teams are never split across rows, so the
    // monitor sees each topic (individual or team) exactly once.
    const topics = await this.prisma.topic.findMany({
      where: {
        submissionId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        members: {
          include: {
            student: {
              select: MEMBER_SELECT,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const enrichedTopics = await Promise.all(
      topics.map(async (topic) => {
        const matches =
          await this.topicVectorRepository.findSimilarTopicsByTopicId(
            this.prisma,
            submissionId,
            topic.id,
            SIMILAR_TOPICS_LIMIT,
          );

        const similarTopics = matches
          .filter((m) => m.similarity >= threshold)
          .map((m) => ({
            title: m.title,
            studentName: m.studentName,
            similarityScore: m.similarity,
          }));

        const { members, ...rest } = topic;

        return {
          ...rest,
          leader: topic.student,
          members: members.map((m) => m.student),
          highestSimilarity:
            similarTopics.length > 0
              ? similarTopics[0].similarityScore
              : null,
          similarTopics,
        };
      }),
    );

    return {
      submission: {
        id: submission.id,
        title: submission.title,
        description: submission.description,
        openDate: submission.openDate,
        closeDate: submission.closeDate,
        isOpen: submission.isOpen,
      },
      classroom: {
        id: submission.classroom.id,
        name: submission.classroom.name,
      },
      totalTopics: enrichedTopics.length,
      topics: enrichedTopics,
    };
  }

  async checkSemanticSimilarity(
    submissionId: string,
    userId: string,
    title: string,
    topicId?: string,
  ): Promise<SimilarityCheckResponseDto> {
    await this.submissionService.assertMemberAccess(
      submissionId,
      userId,
    );

    const normalizedTitle = normalizeTitle(title);

    const duplicate = await this.prisma.topic.findFirst({
      where: {
        submissionId,
        normalizedTitle,
        ...(topicId
          ? { id: { not: topicId } }
          : {}),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (duplicate) {
      return SimilarityCheckResponseDto.duplicateOf(duplicate);
    }

    const embedding =
      await this.embeddingService.generateEmbedding(title.trim());

    const matches =
      await this.topicVectorRepository.findSimilarTopics(
        this.prisma,
        submissionId,
        embedding,
        SIMILAR_TOPICS_LIMIT,
        undefined,
        userId,
      );

    const threshold =
      this.configService.get<number>(
        'embedding.similarityThreshold',
      ) ?? 0.30;

    const similarTopics = matches.filter(
      (topic) => topic.similarity >= threshold,
    );

    return SimilarityCheckResponseDto.withSimilarTopics(
      similarTopics,
    );
  }
}
