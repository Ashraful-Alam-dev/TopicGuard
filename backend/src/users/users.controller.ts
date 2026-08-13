import { Body, Controller, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser() user: User): Promise<ProfileResponseDto> {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.usersService.changePassword(user.id, dto);
    return { message: 'Password updated successfully' };
  }
}
