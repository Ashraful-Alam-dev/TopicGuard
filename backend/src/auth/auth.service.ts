import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, VerificationToken } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { generateOtp } from '../common/utils/otp.util';
import { hashSecret, compareSecret } from '../common/utils/password.util';
import {
  MAX_OTP_ATTEMPTS,
  OTP_EXPIRATION_MINUTES,
  OTP_RESEND_COOLDOWN_MS,
  VerificationTokenType,
} from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  // Registration (email verification via OTP)

  /**
   * Starts registration: validates the email is free, stores a hashed
   * pending-registration record (never the plaintext password), and
   * emails an OTP. No User row is created until the OTP is verified.
   */
  async register(dto: RegisterDto): Promise<{ message: string; email: string }> {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await hashSecret(dto.password);

    // If a pending registration already exists for this email (e.g. the
    // user abandoned a previous sign-up attempt), issueVerificationToken's
    // upsert replaces it entirely with this newer request - no separate
    // "existing token" check needed here.
    const otp = await this.issueVerificationToken({
      email: dto.email,
      type: VerificationTokenType.REGISTRATION,
      name: dto.name,
      passwordHash,
    });

    await this.emailService.sendRegistrationOtp(
      dto.email,
      dto.name,
      otp,
      OTP_EXPIRATION_MINUTES,
    );

    return {
      message:
        'A verification code has been sent to your email. Verify it to complete registration.',
      email: dto.email,
    };
  }

  /**
   * Verifies the registration OTP. On success, creates the User and
   * deletes the pending record transactionally; on failure, neither
   * happens and the attempt counter is incremented.
   */
  async verifyRegistrationOtp(dto: VerifyOtpDto): Promise<User> {
    const token = await this.findVerificationToken(
      dto.email,
      VerificationTokenType.REGISTRATION,
    );
    if (!token) {
      throw new NotFoundException(
        'No pending registration found for this email',
      );
    }

    await this.assertOtpValid(token, dto.otp);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: token.name!,
          email: token.email,
          passwordHash: token.passwordHash!,
        },
      });

      await tx.verificationToken.delete({ where: { id: token.id } });

      return user;
    });
  }

  /** Replaces the pending registration's OTP and re-sends it. */
  async resendRegistrationOtp(dto: ResendOtpDto): Promise<{ message: string }> {
    const token = await this.findVerificationToken(
      dto.email,
      VerificationTokenType.REGISTRATION,
    );
    if (!token) {
      throw new NotFoundException(
        'No pending registration found for this email',
      );
    }
    this.assertResendAllowed(token);

    const otp = await this.issueVerificationToken({
      email: token.email,
      type: VerificationTokenType.REGISTRATION,
      name: token.name,
      passwordHash: token.passwordHash,
    });

    await this.emailService.sendRegistrationOtp(
      token.email,
      token.name ?? '',
      otp,
      OTP_EXPIRATION_MINUTES,
    );

    return { message: 'A new verification code has been sent to your email' };
  }

  // Forgot password (OTP)

  /**
   * Always returns the same generic message, whether or not the email
   * belongs to an account, so the endpoint can't be used to enumerate
   * registered users.
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const genericResponse = {
      message:
        'If an account with that email exists, a password reset code has been sent.',
    };

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      return genericResponse;
    }

    const existingToken = await this.findVerificationToken(
      dto.email,
      VerificationTokenType.PASSWORD_RESET,
    );
    if (
      existingToken &&
      Date.now() - existingToken.updatedAt.getTime() < OTP_RESEND_COOLDOWN_MS
    ) {
      // Stay silent about the cooldown too, to keep the response generic.
      return genericResponse;
    }

    const otp = await this.issueVerificationToken({
      email: dto.email,
      type: VerificationTokenType.PASSWORD_RESET,
    });

    await this.emailService.sendPasswordResetOtp(
      dto.email,
      user.name,
      otp,
      OTP_EXPIRATION_MINUTES,
    );

    return genericResponse;
  }

  /** Lets the client confirm an OTP before showing the "set new password" screen. */
  async verifyResetOtp(dto: VerifyOtpDto): Promise<{ verified: boolean }> {
    const token = await this.findVerificationToken(
      dto.email,
      VerificationTokenType.PASSWORD_RESET,
    );
    if (!token) {
      throw new BadRequestException('Invalid or expired code');
    }

    await this.assertOtpValid(token, dto.otp);

    return { verified: true };
  }

  /** Verifies the OTP again and, if valid, updates the password + deletes the token transactionally. */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const token = await this.findVerificationToken(
      dto.email,
      VerificationTokenType.PASSWORD_RESET,
    );
    if (!token) {
      throw new BadRequestException('Invalid or expired code');
    }

    await this.assertOtpValid(token, dto.otp);

    const passwordHash = await hashSecret(dto.newPassword);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: dto.email },
        data: { passwordHash },
      });

      await tx.verificationToken.delete({ where: { id: token.id } });
    });

    return { message: 'Your password has been reset successfully' };
  }

  // Login / session (unchanged)

  async validateCredentials(dto: LoginDto): Promise<User> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await compareSecret(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  issueAccessToken(user: User): string {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  getCookieOptions() {
    const isProduction = this.configService.get('nodeEnv') === 'production';
    const secure = this.configService.get<boolean>('cookie.secure');
    return {
      httpOnly: true,
      secure: secure ?? isProduction,
      sameSite: 'none' as const,
      maxAge: this.parseExpiryToMs(
        this.configService.get<string>('jwt.expiresIn') ?? '1d',
      ),
      path: '/',
    };
  }

  private parseExpiryToMs(expiresIn: string): number {
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (!match) {
      return 24 * 60 * 60 * 1000; // default 1 day
    }
    const value = parseInt(match[1], 10);
    const unitMs: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * unitMs[match[2]];
  }

  // VerificationToken helpers, shared by registration and password reset

  private async findVerificationToken(
    email: string,
    type: VerificationTokenType,
  ): Promise<VerificationToken | null> {
    return this.prisma.verificationToken.findUnique({
      where: { uq_verification_email_type: { email, type } },
    });
  }

  /** Generates a fresh OTP, stores only its hash, and creates or replaces the single VerificationToken row for this (email, type) pair - so we never accumulate unlimited OTP rows for the same email/purpose. */
  private async issueVerificationToken(params: {
    email: string;
    type: VerificationTokenType;
    name?: string | null;
    passwordHash?: string | null;
  }): Promise<string> {
    const otp = generateOtp();
    const otpHash = await hashSecret(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60_000);

    await this.prisma.verificationToken.upsert({
      where: {
        uq_verification_email_type: {
          email: params.email,
          type: params.type,
        },
      },
      update: {
        name: params.name ?? null,
        passwordHash: params.passwordHash ?? null,
        otpHash,
        expiresAt,
        attempts: 0,
      },
      create: {
        email: params.email,
        type: params.type,
        name: params.name ?? null,
        passwordHash: params.passwordHash ?? null,
        otpHash,
        expiresAt,
      },
    });

    return otp;
  }

  /**
   * Checks expiry, attempt count, and the OTP itself. Throws on any
   * failure (incrementing `attempts` first when the code is simply
   * wrong). Never deletes the token - callers decide when it's consumed.
   */
  private async assertOtpValid(
    token: VerificationToken,
    otp: string,
  ): Promise<void> {
    if (token.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException(
        'This code has expired. Please request a new one.',
      );
    }

    if (token.attempts >= MAX_OTP_ATTEMPTS) {
      throw new ForbiddenException(
        'Too many incorrect attempts. Please request a new code.',
      );
    }

    const isValid = await compareSecret(otp, token.otpHash);
    if (!isValid) {
      await this.prisma.verificationToken.update({
        where: { id: token.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid verification code');
    }
  }

  /** Simple abuse guard: one OTP send per (email, type) per cooldown window. */
  private assertResendAllowed(token: VerificationToken | null): void {
    if (!token) {
      return;
    }

    const elapsedMs = Date.now() - token.updatedAt.getTime();
    if (elapsedMs < OTP_RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsedMs) / 1000);
      throw new HttpException(
        `Please wait ${waitSeconds}s before requesting another code`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
