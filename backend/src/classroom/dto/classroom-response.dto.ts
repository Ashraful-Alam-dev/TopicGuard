import { Classroom, ClassroomMember, User } from '@prisma/client';
import { UserResponseDto } from '../../users/dto/user-response.dto';

type ClassroomWithRelations = Classroom & {
  monitor: User;
  members?: (ClassroomMember & { user: User })[];
  _count?: { members: number };
};

export class ClassroomResponseDto {
  id!: string;
  name!: string;
  courseCode!: string;
  description!: string | null;
  joinCode!: string;
  isArchived!: boolean;
  monitor!: UserResponseDto;
  memberCount!: number;
  isMonitor!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  members?: UserResponseDto[];

  private constructor(
    classroom: ClassroomWithRelations,
    currentUserId: string,
  ) {
    this.id = classroom.id;
    this.name = classroom.name;
    this.courseCode = classroom.courseCode;
    this.description = classroom.description;
    this.joinCode = classroom.joinCode;
    this.isArchived = classroom.isArchived;
    this.monitor = UserResponseDto.fromEntity(classroom.monitor);
    this.memberCount = classroom._count?.members ?? classroom.members?.length ?? 0;
    this.isMonitor = classroom.monitorId === currentUserId;
    this.createdAt = classroom.createdAt;
    this.updatedAt = classroom.updatedAt;
    if (classroom.members) {
      this.members = classroom.members.map((m) =>
        UserResponseDto.fromEntity(m.user),
      );
    }
  }

  static fromEntity(
    classroom: ClassroomWithRelations,
    currentUserId: string,
  ): ClassroomResponseDto {
    return new ClassroomResponseDto(classroom, currentUserId);
  }
}
