import { User } from '@prisma/client';

/**
 * Profile response shape. Deliberately excludes passwordHash and any
 * verification/OTP data - only what the product spec calls for.
 */
export class ProfileResponseDto {
  id!: string;
  name!: string;
  email!: string;
  classroomsAsMonitor!: number;
  classroomsAsStudent!: number;

  private constructor(
    user: User,
    classroomsAsMonitor: number,
    classroomsAsStudent: number,
  ) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.classroomsAsMonitor = classroomsAsMonitor;
    this.classroomsAsStudent = classroomsAsStudent;
  }

  static fromEntity(
    user: User,
    classroomsAsMonitor: number,
    classroomsAsStudent: number,
  ): ProfileResponseDto {
    return new ProfileResponseDto(user, classroomsAsMonitor, classroomsAsStudent);
  }
}
