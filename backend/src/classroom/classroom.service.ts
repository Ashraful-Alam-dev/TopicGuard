import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Classroom, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { generateJoinCode } from '../common/utils/join-code.util';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { TransferMonitorDto } from './dto/transfer-monitor.dto';

const CLASSROOM_DETAIL_INCLUDE = {
  monitor: true,
  members: { include: { user: true } },
  _count: { select: { members: true } },
} satisfies Prisma.ClassroomInclude;

const CLASSROOM_LIST_INCLUDE = {
  monitor: true,
  _count: { select: { members: true } },
} satisfies Prisma.ClassroomInclude;

const MAX_JOIN_CODE_ATTEMPTS = 5;

@Injectable()
export class ClassroomService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a classroom, assigns the creator as monitor, and adds them as a
   * member so classroom listing/membership queries stay consistent (every
   * user, including monitors, is also a student per the product's business
   * rules).
   */
  async create(monitorId: string, dto: CreateClassroomDto) {
    const joinCode = await this.generateUniqueJoinCode();

    const classroom = await this.prisma.$transaction(async (tx) => {
      const created = await tx.classroom.create({
        data: {
          name: dto.name,
          courseCode: dto.courseCode,
          description: dto.description,
          joinCode,
          monitorId,
        },
      });

      await tx.classroomMember.create({
        data: { classroomId: created.id, userId: monitorId },
      });

      return created;
    });

    return this.findByIdOrThrow(classroom.id, monitorId);
  }

  async joinByCode(userId: string, joinCode: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { joinCode: joinCode.toUpperCase() },
    });

    if (!classroom) {
      throw new NotFoundException('Invalid join code');
    }

    if (classroom.isArchived) {
      throw new ForbiddenException(
        'This classroom is archived and no longer accepts new members',
      );
    }

    const existingMembership = await this.prisma.classroomMember.findUnique({
      where: {
        uq_classroom_member: {
          classroomId: classroom.id,
          userId,
        },
      },
    });

    if (existingMembership) {
      throw new ConflictException('You are already a member of this classroom');
    }

    await this.prisma.classroomMember.create({
      data: { classroomId: classroom.id, userId },
    });

    return this.findByIdOrThrow(classroom.id, userId);
  }

  async findJoinedByUser(userId: string) {
    return this.prisma.classroom.findMany({
      where: { members: { some: { userId } } },
      include: CLASSROOM_LIST_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdOrThrow(id: string, requestingUserId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id },
      include: CLASSROOM_DETAIL_INCLUDE,
    });

    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    await this.assertIsMember(classroom, requestingUserId);

    return classroom;
  }

  async update(id: string, userId: string, dto: UpdateClassroomDto) {
    const classroom = await this.getForMutation(id, userId);
    this.assertNotArchived(classroom);

    await this.prisma.classroom.update({
      where: { id },
      data: {
        name: dto.name,
        courseCode: dto.courseCode,
        description: dto.description,
      },
    });

    return this.findByIdOrThrow(id, userId);
  }

  async archive(id: string, userId: string) {
    const classroom = await this.getForMutation(id, userId);

    if (classroom.isArchived) {
      throw new BadRequestException('Classroom is already archived');
    }

    await this.prisma.classroom.update({
      where: { id },
      data: { isArchived: true },
    });

    return this.findByIdOrThrow(id, userId);
  }

  async unarchive(id: string, userId: string) {
    const classroom = await this.getForMutation(id, userId);

    if (!classroom.isArchived) {
      throw new BadRequestException('Classroom is not archived');
    }

    await this.prisma.classroom.update({
      where: { id },
      data: { isArchived: false },
    });

    return this.findByIdOrThrow(id, userId);
  }

  async transferMonitor(id: string, userId: string, dto: TransferMonitorDto) {
    const classroom = await this.getForMutation(id, userId);
    this.assertNotArchived(classroom);

    if (dto.newMonitorId === userId) {
      throw new BadRequestException(
        'You are already the monitor of this classroom',
      );
    }

    const targetMembership = await this.prisma.classroomMember.findUnique({
      where: {
        uq_classroom_member: {
          classroomId: id,
          userId: dto.newMonitorId,
        },
      },
    });

    if (!targetMembership) {
      throw new BadRequestException(
        'The new monitor must already be a member of this classroom',
      );
    }

    // Single monitorId column on Classroom guarantees exactly one monitor
    // at a time — no separate "unset old monitor" step is needed.
    await this.prisma.classroom.update({
      where: { id },
      data: { monitorId: dto.newMonitorId },
    });

    return this.findByIdOrThrow(id, userId);
  }

  /**
   * Fetches a classroom and asserts the requesting user is its monitor.
   * Used by every mutation endpoint (edit/archive/unarchive/transfer).
   */
  private async getForMutation(
    id: string,
    userId: string,
  ): Promise<Classroom> {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id },
    });

    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    if (classroom.monitorId !== userId) {
      throw new ForbiddenException(
        'Only the classroom monitor can perform this action',
      );
    }

    return classroom;
  }

  private assertNotArchived(classroom: Classroom) {
    if (classroom.isArchived) {
      throw new ForbiddenException(
        'This classroom is archived and is read-only. Unarchive it first.',
      );
    }
  }

  private async assertIsMember(classroom: Classroom, userId: string) {
    if (classroom.monitorId === userId) {
      return;
    }

    const membership = await this.prisma.classroomMember.findUnique({
      where: {
        uq_classroom_member: { classroomId: classroom.id, userId },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You do not have access to this classroom',
      );
    }
  }

  // ---------------------------------------------------------------------
  // Reusable access-control helpers for other modules (Submission, Topic).
  // These wrap the existing private checks below without changing them.
  // ---------------------------------------------------------------------

  /**
   * Lightweight fetch (no relations) for modules that only need to check
   * classroom state (e.g. isArchived) rather than render a full detail view.
   */
  async getRawById(id: string): Promise<Classroom> {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id },
    });

    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    return classroom;
  }

  /**
   * Asserts the user is the monitor or a joined member of the classroom.
   * Used by SubmissionService/TopicService to gate read access.
   */
  async assertMembership(
    classroomId: string,
    userId: string,
  ): Promise<Classroom> {
    const classroom = await this.getRawById(classroomId);
    await this.assertIsMember(classroom, userId);
    return classroom;
  }

  /**
   * Asserts the user is the classroom's monitor. Used by SubmissionService
   * to gate submission management actions.
   */
  async assertMonitor(classroomId: string, userId: string): Promise<Classroom> {
    return this.getForMutation(classroomId, userId);
  }

  private async generateUniqueJoinCode(): Promise<string> {
    for (let attempt = 0; attempt < MAX_JOIN_CODE_ATTEMPTS; attempt++) {
      const code = generateJoinCode();
      const existing = await this.prisma.classroom.findUnique({
        where: { joinCode: code },
      });
      if (!existing) {
        return code;
      }
    }
    throw new ConflictException(
      'Could not generate a unique join code, please try again',
    );
  }
}
