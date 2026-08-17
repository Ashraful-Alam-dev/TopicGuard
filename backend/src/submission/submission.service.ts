import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Submission } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ClassroomService } from '../classroom/classroom.service';
import { EmailService } from '../email/email.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

@Injectable()
export class SubmissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly classroomService: ClassroomService,
    private readonly emailService: EmailService,
  ) {}

  async create(
    classroomId: string,
    monitorId: string,
    dto: CreateSubmissionDto,
  ): Promise<Submission> {
    const classroom = await this.classroomService.assertMonitor(
      classroomId,
      monitorId,
    );
    this.assertNotArchived(classroom.isArchived);
    this.assertValidDateRange(dto.openDate, dto.closeDate);

    const submission = await this.prisma.submission.create({
      data: {
        classroomId,
        title: dto.title,
        description: dto.description,
        openDate: new Date(dto.openDate),
        closeDate: new Date(dto.closeDate),
      },
    });

    await this.notifySubmissionOpen(classroom.id, classroom.name, submission.title);

    return submission;
  }

  async findAllForClassroom(
    classroomId: string,
    userId: string,
  ): Promise<Submission[]> {
    await this.classroomService.assertMembership(classroomId, userId);
    return this.prisma.submission.findMany({
      where: { classroomId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdOrThrow(id: string, userId: string): Promise<Submission> {
    return this.assertMemberAccess(id, userId);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateSubmissionDto,
  ): Promise<Submission> {
    const submission = await this.getForMutation(id, userId);

    const nextOpenDate = dto.openDate
      ? new Date(dto.openDate)
      : submission.openDate;
    const nextCloseDate = dto.closeDate
      ? new Date(dto.closeDate)
      : submission.closeDate;
    if (dto.openDate || dto.closeDate) {
      this.assertValidDateRange(
        nextOpenDate.toISOString(),
        nextCloseDate.toISOString(),
      );
    }

    return this.prisma.submission.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        openDate: dto.openDate ? nextOpenDate : undefined,
        closeDate: dto.closeDate ? nextCloseDate : undefined,
      },
    });
  }

  async open(id: string, userId: string): Promise<Submission> {
    const submission = await this.getForMutation(id, userId);

    if (submission.isOpen) {
      throw new BadRequestException('Submission is already open');
    }

    const updated = await this.prisma.submission.update({
      where: { id },
      data: { isOpen: true },
    });

    const classroom = await this.classroomService.getRawById(
      submission.classroomId,
    );
    await this.notifySubmissionOpen(classroom.id, classroom.name, updated.title);

    return updated;
  }

  async close(id: string, userId: string): Promise<Submission> {
    const submission = await this.getForMutation(id, userId);

    if (!submission.isOpen) {
      throw new BadRequestException('Submission is already closed');
    }

    return this.prisma.submission.update({
      where: { id },
      data: { isOpen: false },
    });
  }

  // Reusable access-control helpers for TopicService.

  /**
   * Asserts the user can read this submission (any classroom member).
   * Used for viewing submission details and, by TopicService, for viewing
   * one's own topic even after the submission has closed.
   */
  async assertMemberAccess(
    submissionId: string,
    userId: string,
  ): Promise<Submission> {
    const submission = await this.getRawById(submissionId);
    await this.classroomService.assertMembership(
      submission.classroomId,
      userId,
    );
    return submission;
  }

  /**
   * Asserts the user may create/edit/delete a topic on this submission:
   * must be a classroom member, the classroom must not be archived, and
   * the submission must currently be open.
   */
  async assertCanRegisterTopic(
    submissionId: string,
    userId: string,
  ): Promise<Submission> {
    const submission = await this.getRawById(submissionId);
    const classroom = await this.classroomService.assertMembership(
      submission.classroomId,
      userId,
    );

    if (classroom.isArchived) {
      throw new ForbiddenException(
        'This classroom is archived and cannot accept topics',
      );
    }

    if (!submission.isOpen) {
      throw new ForbiddenException(
        'This submission is closed and no longer accepts topic changes',
      );
    }

    return submission;
  }

  /**
   * Best-effort: EmailService swallows individual delivery failures, so
   * this never blocks or fails the submission create/open action itself.
   */
  private async notifySubmissionOpen(
    classroomId: string,
    classroomName: string,
    submissionTitle: string,
  ): Promise<void> {
    const recipients = await this.classroomService.getRecipients(classroomId);
    await this.emailService.sendSubmissionOpenNotification(
      recipients,
      classroomName,
      submissionTitle,
    );
  }

  private async getRawById(id: string): Promise<Submission> {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return submission;
  }

  /**
   * Fetches a submission and asserts the requesting user is the monitor of
   * its classroom, and that the classroom isn't archived. Used by every
   * mutation endpoint (edit/open/close).
   */
  private async getForMutation(
    id: string,
    userId: string,
  ): Promise<Submission> {
    const submission = await this.getRawById(id);
    const classroom = await this.classroomService.assertMonitor(
      submission.classroomId,
      userId,
    );
    this.assertNotArchived(classroom.isArchived);
    return submission;
  }

  private assertNotArchived(isArchived: boolean) {
    if (isArchived) {
      throw new ForbiddenException(
        'This classroom is archived and is read-only. Unarchive it first.',
      );
    }
  }

  private assertValidDateRange(openDate: string, closeDate: string) {
    if (new Date(closeDate).getTime() <= new Date(openDate).getTime()) {
      throw new BadRequestException('closeDate must be after openDate');
    }
  }
}
