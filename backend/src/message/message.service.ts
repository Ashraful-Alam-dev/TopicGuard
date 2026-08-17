import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Message } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ClassroomService } from '../classroom/classroom.service';
import { EmailService } from '../email/email.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly classroomService: ClassroomService,
    private readonly emailService: EmailService,
  ) {}

  /** Sends an announcement-style message to a classroom. */
  async create(
    classroomId: string,
    monitorId: string,
    dto: CreateMessageDto,
  ): Promise<Message> {
    const classroom = await this.classroomService.assertMonitor(
      classroomId,
      monitorId,
    );
    this.assertNotArchived(classroom.isArchived);

    const message = await this.prisma.message.create({
      data: {
        classroomId,
        senderId: monitorId,
        title: dto.title,
        content: dto.content,
      },
    });

    const recipients = await this.classroomService.getRecipients(classroomId);
    await this.emailService.sendAnnouncementNotification(
      recipients,
      classroom.name,
      message.title,
    );

    return message;
  }

  async findAllForClassroom(
    classroomId: string,
    userId: string,
  ): Promise<Message[]> {
    await this.classroomService.assertMembership(classroomId, userId);
    return this.prisma.message.findMany({
      where: { classroomId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdOrThrow(id: string, userId: string): Promise<Message> {
    const message = await this.getRawById(id);
    await this.classroomService.assertMembership(
      message.classroomId,
      userId,
    );
    return message;
  }

  /**
   * Deletes a message. Only the classroom's current monitor may do this
   * (e.g. to retract a mistaken announcement), same permission model as
   * every other mutation in SubmissionService/ClassroomService.
   */
  async remove(id: string, userId: string): Promise<void> {
    const message = await this.getRawById(id);
    const classroom = await this.classroomService.assertMonitor(
      message.classroomId,
      userId,
    );
    this.assertNotArchived(classroom.isArchived);

    await this.prisma.message.delete({ where: { id } });
  }

  private async getRawById(id: string): Promise<Message> {
    const message = await this.prisma.message.findUnique({ where: { id } });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  private assertNotArchived(isArchived: boolean) {
    if (isArchived) {
      throw new ForbiddenException(
        'This classroom is archived and is read-only. Unarchive it first.',
      );
    }
  }
}
