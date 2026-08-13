import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(
    @Body() dto: RegisterDto,
  ): Promise<{ message: string; email: string }> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('register/verify-otp')
  @HttpCode(HttpStatus.CREATED)
  async verifyRegistrationOtp(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const user = await this.authService.verifyRegistrationOtp(dto);
    return this.buildAuthResponse(user, res);
  }

  @Public()
  @Post('register/resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendRegistrationOtp(
    @Body() dto: ResendOtpDto,
  ): Promise<{ message: string }> {
    return this.authService.resendRegistrationOtp(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const user = await this.authService.validateCredentials(dto);
    return this.buildAuthResponse(user, res);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('forgot-password/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyForgotPasswordOtp(
    @Body() dto: VerifyOtpDto,
  ): Promise<{ verified: boolean }> {
    return this.authService.verifyResetOtp(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response): { message: string } {
    res.clearCookie('access_token', { path: '/' });
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  getCurrentUser(@CurrentUser() user: User): UserResponseDto {
    return UserResponseDto.fromEntity(user);
  }

  private buildAuthResponse(user: User, res: Response): AuthResponseDto {
    const accessToken = this.authService.issueAccessToken(user);
    res.cookie('access_token', accessToken, this.authService.getCookieOptions());
    return new AuthResponseDto(accessToken, UserResponseDto.fromEntity(user));
  }
}
