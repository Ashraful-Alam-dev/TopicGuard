import { ConflictException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Topic } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { SubmissionService } from '../submission/submission.service';
import { TopicDto } from './dto/topic.dto';
import { normalizeTitle } from '../common/utils/normalize-title.util';
import { EmbeddingService } from '../embedding/embedding.service';
import { TopicVectorRepository } from './topic-vector.repository';
import { SimilarityCheckResponseDto } from './dto/similarity-check-response.dto';

/** Number of matches returned by the semantic similarity check. */
const SIMILAR_TOPICS_LIMIT = 5;

@Injectable()
export class TopicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly submissionService: SubmissionService,
    private readonly embeddingService: EmbeddingService,
    private readonly topicVectorRepository: TopicVectorRepository,
  ) { }

  async registerTopic(
    submissionId: string,
    studentId: string,
    dto: TopicDto,
  ): Promise<Topic> {
    await this.submissionService.assertCanRegisterTopic(
      submissionId,
      studentId,
    );

    const existing = await this.findOwnTopic(submissionId, studentId);
    if (existing) {
      throw new ConflictException(
        'You have already registered a topic for this submission. Edit it instead.',
      );
    }

    const normalizedTitle = normalizeTitle(dto.title);

    await this.assertNoDuplicateTitle(
      submissionId,
      normalizedTitle,
    );

    const embedding =
      await this.embeddingService.generateEmbedding(dto.title.trim());

    return this.prisma.$transaction(async (tx) => {
      const topic = await tx.topic.create({
        data: {
          submissionId,
          studentId,
          originalTitle: dto.title,
          normalizedTitle,
        },
      });

      await this.topicVectorRepository.upsertEmbedding(
        tx,
        topic.id,
        embedding,
      );

      return topic;
    });
  }

  async updateOwnTopic(
    submissionId: string,
    studentId: string,
    dto: TopicDto,
  ): Promise<Topic> {
    await this.submissionService.assertCanRegisterTopic(
      submissionId,
      studentId,
    );

    const topic = await this.findOwnTopic(
      submissionId,
      studentId,
    );

    if (!topic) {
      throw new NotFoundException(
        'You have not registered a topic for this submission',
      );
    }

    const normalizedTitle = normalizeTitle(dto.title);

    await this.assertNoDuplicateTitle(
      submissionId,
      normalizedTitle,
      topic.id,
    );

    const embedding =
      await this.embeddingService.generateEmbedding(
        dto.title.trim(),
      );

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.topic.update({
        where: {
          id: topic.id,
        },
        data: {
          originalTitle: dto.title,
          normalizedTitle,
        },
      });

      await this.topicVectorRepository.upsertEmbedding(
        tx,
        updated.id,
        embedding,
      );

      return updated;
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

    const topic = await this.findOwnTopic(
      submissionId,
      studentId,
    );

    if (!topic) {
      throw new NotFoundException(
        'You have not registered a topic for this submission',
      );
    }

    await this.prisma.topic.delete({
      where: {
        id: topic.id,
      },
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

  private async findOwnTopic(
    submissionId: string,
    studentId: string,
  ): Promise<Topic | null> {
    return this.prisma.topic.findUnique({
      where: {
        uq_submission_student: { submissionId, studentId },
      },
    });
  }

  private async getOwnTopicOrThrow(
    submissionId: string,
    studentId: string,
  ) {
    const topic = await this.findOwnTopic(
      submissionId,
      studentId,
    );

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

    return {
      ...topic,
      highestSimilarity:
        similarTopics.length > 0
          ? similarTopics[0].similarityScore
          : null,
      similarTopics,
    };
  }

  private async assertNoDuplicateTitle(
    submissionId: string,
    normalizedTitle: string,
    excludeTopicId?: string,
  ) {
    const duplicate = await this.prisma.topic.findFirst({
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

        return {
          ...topic,
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
        studentId: { not: userId },
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
