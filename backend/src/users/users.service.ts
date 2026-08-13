import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { hashSecret, compareSecret } from '../common/utils/password.util';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    return this.prisma.user.create({ data });
  }

  /**
   * Builds the profile view: basic identity plus classroom counts.
   * "As student" counts ClassroomMember rows, excluding classrooms the
   * user monitors - every monitor is auto-added as a member of their own
   * classroom (see ClassroomService.create), so without this exclusion a
   * monitor's own classroom would be double-counted.
   */
  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.findByIdOrThrow(userId);

    const [classroomsAsMonitor, classroomsAsStudent] = await Promise.all([
      this.prisma.classroom.count({ where: { monitorId: userId } }),
      this.prisma.classroomMember.count({
        where: { userId, classroom: { monitorId: { not: userId } } },
      }),
    ]);

    return ProfileResponseDto.fromEntity(
      user,
      classroomsAsMonitor,
      classroomsAsStudent,
    );
  }

  /**
   * Authenticated password change: requires the current password (no
   * OTP), unlike the forgot-password flow.
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.findByIdOrThrow(userId);

    const isCurrentPasswordValid = await compareSecret(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await hashSecret(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}
