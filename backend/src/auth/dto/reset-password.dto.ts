import {
  IsEmail,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be a 6-digit code' })
  otp!: string;

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
