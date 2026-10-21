import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MemberMessage, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ClassroomService } from '../classroom/classroom.service';
import { RateLimiterService } from '../common/rate-limit/rate-limiter.service';
import { CreateMemberMessageDto } from './dto/create-member-message.dto';
import { ReplyMemberMessageDto } from './dto/reply-member-message.dto';
import { MemberMessageWithRelations } from './dto/member-message-response.dto';
import {
  DASHBOARD_MESSAGE_LIMIT,
  MEMBER_MESSAGE_LIMIT,
  MEMBER_MESSAGE_LIMIT_MESSAGE,
  MEMBER_MESSAGE_WINDOW_MS,
} from './member-message.constants';

const SENDER_SELECT = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

const CLASSROOM_SELECT = {
  id: true,
  name: true,
} satisfies Prisma.ClassroomSelect;

@Injectable()
export class MemberMessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly classroomService: ClassroomService,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  /** A member writes to the classroom monitor. */
  async create(
    classroomId: string,
    senderId: string,
    dto: CreateMemberMessageDto,
  ): Promise<MemberMessage> {
    const classroom = await this.classroomService.assertMembership(
      classroomId,
      senderId,
    );

    if (classroom.monitorId === senderId) {
      throw new BadRequestException(
        'You are the monitor of this classroom. Members message you, not the other way around.',
      );
    }
    this.assertNotArchived(classroom.isArchived);

    this.rateLimiter.consume(`member-message:${senderId}`, {
      limit: MEMBER_MESSAGE_LIMIT,
      windowMs: MEMBER_MESSAGE_WINDOW_MS,
      message: MEMBER_MESSAGE_LIMIT_MESSAGE,
    });

    return this.prisma.memberMessage.create({
      data: { classroomId, senderId, content: dto.content },
    });
  }

  /** Messages the user sent in one classroom (members only see their own). */
  async findMine(
    classroomId: string,
    userId: string,
  ): Promise<MemberMessageWithRelations[]> {
    await this.classroomService.assertMembership(classroomId, userId);
    return this.prisma.memberMessage.findMany({
      where: { classroomId, senderId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Everything members sent to the monitor of this classroom. */
  async findInbox(
    classroomId: string,
    monitorId: string,
  ): Promise<MemberMessageWithRelations[]> {
    await this.classroomService.assertMonitor(classroomId, monitorId);
    return this.prisma.memberMessage.findMany({
      where: { classroomId },
      include: { sender: { select: SENDER_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Dashboard: the user's latest sent messages across all classrooms. */
  async findMineAcrossClassrooms(
    userId: string,
  ): Promise<MemberMessageWithRelations[]> {
    return this.prisma.memberMessage.findMany({
      where: { senderId: userId },
      include: { classroom: { select: CLASSROOM_SELECT } },
      orderBy: { createdAt: 'desc' },
      take: DASHBOARD_MESSAGE_LIMIT,
    });
  }

  /** Dashboard: unanswered messages in classrooms the user monitors. */
  async findPendingForMonitor(
    monitorId: string,
  ): Promise<{ total: number; messages: MemberMessageWithRelations[] }> {
    const where: Prisma.MemberMessageWhereInput = {
      replyContent: null,
      classroom: { monitorId },
    };

    const [total, messages] = await Promise.all([
      this.prisma.memberMessage.count({ where }),
      this.prisma.memberMessage.findMany({
        where,
        include: {
          sender: { select: SENDER_SELECT },
          classroom: { select: CLASSROOM_SELECT },
        },
        orderBy: { createdAt: 'asc' },
        take: DASHBOARD_MESSAGE_LIMIT,
      }),
    ]);

    return { total, messages };
  }

  /** The monitor answers once. Replies are final so members never see an answer change. */
  async reply(
    id: string,
    monitorId: string,
    dto: ReplyMemberMessageDto,
  ): Promise<MemberMessageWithRelations> {
    const message = await this.getRawById(id);
    const classroom = await this.classroomService.assertMonitor(
      message.classroomId,
      monitorId,
    );
    this.assertNotArchived(classroom.isArchived);

    // Conditional update keeps "reply once" true even for double-clicks.
    const result = await this.prisma.memberMessage.updateMany({
      where: { id, replyContent: null },
      data: { replyContent: dto.content, repliedAt: new Date() },
    });

    if (result.count === 0) {
      throw new ConflictException('You have already replied to this message');
    }

    return this.prisma.memberMessage.findUniqueOrThrow({
      where: { id },
      include: { sender: { select: SENDER_SELECT } },
    });
  }

  /** The sender can delete their own message; the monitor can delete any in their classroom. */
  async remove(id: string, userId: string): Promise<void> {
    const message = await this.getRawById(id);
    const classroom = await this.classroomService.getRawById(
      message.classroomId,
    );

    if (message.senderId !== userId && classroom.monitorId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own messages',
      );
    }
    this.assertNotArchived(classroom.isArchived);

    await this.prisma.memberMessage.delete({ where: { id } });
  }

  private async getRawById(id: string): Promise<MemberMessage> {
    const message = await this.prisma.memberMessage.findUnique({
      where: { id },
    });
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
