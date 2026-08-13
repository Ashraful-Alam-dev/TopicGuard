import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(1)
  currentPassword!: string;

  @IsString()
  @MinLength(6, {
    message: 'Password must be at least 6 characters long',
  })
  @MaxLength(72)
  @Matches(/[A-Za-z]/, {
    message: 'Password must contain at least one letter',
  })
  @Matches(/[0-9]/, {
    message: 'Password must contain at least one number',
  })
  newPassword!: string;
}
