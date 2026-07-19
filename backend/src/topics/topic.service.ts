import { ConflictException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Topic } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { SubmissionService } from '../submission/submission.service';
import { TopicDto } from './dto/topic.dto';
import { normalizeTitle } from '../common/utils/normalize-title.util';

@Injectable()
export class TopicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly submissionService: SubmissionService,
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
    await this.assertNoDuplicateTitle(submissionId, normalizedTitle);

    return this.prisma.topic.create({
      data: {
        submissionId,
        studentId,
        originalTitle: dto.title,
        normalizedTitle,
      },
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
    const topic = await this.getOwnTopicOrThrow(submissionId, studentId);

    const normalizedTitle = normalizeTitle(dto.title);
    await this.assertNoDuplicateTitle(submissionId, normalizedTitle, topic.id);

    return this.prisma.topic.update({
      where: { id: topic.id },
      data: {
        originalTitle: dto.title,
        normalizedTitle,
      },
    });
  }

  async deleteOwnTopic(submissionId: string, studentId: string): Promise<void> {
    await this.submissionService.assertCanRegisterTopic(
      submissionId,
      studentId,
    );
    const topic = await this.getOwnTopicOrThrow(submissionId, studentId);
    await this.prisma.topic.delete({ where: { id: topic.id } });
  }

  async getOwnTopic(submissionId: string, studentId: string): Promise<Topic> {
    // Viewing is allowed even after the submission closes — only
    // create/edit/delete require it to still be open.
    await this.submissionService.assertMemberAccess(submissionId, studentId);
    return this.getOwnTopicOrThrow(submissionId, studentId);
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
  ): Promise<Topic> {
    const topic = await this.findOwnTopic(submissionId, studentId);
    if (!topic) {
      throw new NotFoundException(
        'You have not registered a topic for this submission',
      );
    }
    return topic;
  }

  /**
   * Duplicate check is scoped to the submission only, per spec. excludeTopicId
   * lets an edit compare against every *other* topic without tripping on
   * its own unchanged title.
   */
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
      totalTopics: topics.length,
      topics,
    };
  }
}
