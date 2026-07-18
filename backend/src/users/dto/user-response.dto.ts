import { User } from '@prisma/client';

/**
 * Public-facing user shape. Ensures passwordHash never leaves the service layer.
 */
export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;

  private constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.avatarUrl = user.avatarUrl;
    this.createdAt = user.createdAt;
  }

  static fromEntity(user: User): UserResponseDto {
    return new UserResponseDto(user);
  }
}
