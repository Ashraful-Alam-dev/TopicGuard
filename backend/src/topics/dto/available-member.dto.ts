import { User } from '@prisma/client';

/**
 * Lightweight user shape for the team-member picker. Deliberately smaller
 * than UserResponseDto — the frontend only needs enough to render a
 * selectable list.
 */
export class AvailableMemberDto {
  id!: string;
  name!: string;
  email!: string;
  avatarUrl!: string | null;

  private constructor(user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.avatarUrl = user.avatarUrl;
  }

  static fromEntity(
    user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>,
  ): AvailableMemberDto {
    return new AvailableMemberDto(user);
  }
}
