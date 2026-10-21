import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MemberMessageService } from './member-message.service';
import { CreateMemberMessageDto } from './dto/create-member-message.dto';
import { ReplyMemberMessageDto } from './dto/reply-member-message.dto';
import { MemberMessageResponseDto } from './dto/member-message-response.dto';

@Controller()
export class MemberMessageController {
  constructor(private readonly memberMessageService: MemberMessageService) {}

  @Post('classrooms/:classroomId/member-messages')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: User,
    @Param('classroomId', ParseUUIDPipe) classroomId: string,
    @Body() dto: CreateMemberMessageDto,
  ): Promise<MemberMessageResponseDto> {
    const message = await this.memberMessageService.create(
      classroomId,
      user.id,
      dto,
    );
    return MemberMessageResponseDto.fromEntity(message);
  }

  @Get('classrooms/:classroomId/member-messages/mine')
  async findMine(
    @CurrentUser() user: User,
    @Param('classroomId', ParseUUIDPipe) classroomId: string,
  ): Promise<MemberMessageResponseDto[]> {
    const messages = await this.memberMessageService.findMine(
      classroomId,
      user.id,
    );
    return messages.map((m) => MemberMessageResponseDto.fromEntity(m));
  }

  @Get('classrooms/:classroomId/member-messages/inbox')
  async findInbox(
    @CurrentUser() user: User,
    @Param('classroomId', ParseUUIDPipe) classroomId: string,
  ): Promise<MemberMessageResponseDto[]> {
    const messages = await this.memberMessageService.findInbox(
      classroomId,
      user.id,
    );
    return messages.map((m) => MemberMessageResponseDto.fromEntity(m));
  }

  @Get('member-messages/mine')
  async findMineAcrossClassrooms(
    @CurrentUser() user: User,
  ): Promise<MemberMessageResponseDto[]> {
    const messages = await this.memberMessageService.findMineAcrossClassrooms(
      user.id,
    );
    return messages.map((m) => MemberMessageResponseDto.fromEntity(m));
  }

  @Get('member-messages/pending')
  async findPending(
    @CurrentUser() user: User,
  ): Promise<{ total: number; messages: MemberMessageResponseDto[] }> {
    const { total, messages } =
      await this.memberMessageService.findPendingForMonitor(user.id);
    return {
      total,
      messages: messages.map((m) => MemberMessageResponseDto.fromEntity(m)),
    };
  }

  @Post('member-messages/:id/reply')
  @HttpCode(HttpStatus.OK)
  async reply(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplyMemberMessageDto,
  ): Promise<MemberMessageResponseDto> {
    const message = await this.memberMessageService.reply(id, user.id, dto);
    return MemberMessageResponseDto.fromEntity(message);
  }

  @Delete('member-messages/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.memberMessageService.remove(id, user.id);
  }
}
