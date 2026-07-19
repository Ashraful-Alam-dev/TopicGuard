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
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * No class-level prefix: creation/listing are nested under their owning
 * classroom, while single-resource actions (get/delete) address the
 * message directly. Mirrors SubmissionController's route layout.
 */
@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('classrooms/:classroomId/messages')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: User,
    @Param('classroomId', ParseUUIDPipe) classroomId: string,
    @Body() dto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    const message = await this.messageService.create(
      classroomId,
      user.id,
      dto,
    );
    return MessageResponseDto.fromEntity(message);
  }

  @Get('classrooms/:classroomId/messages')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() user: User,
    @Param('classroomId', ParseUUIDPipe) classroomId: string,
  ): Promise<MessageResponseDto[]> {
    const messages = await this.messageService.findAllForClassroom(
      classroomId,
      user.id,
    );
    return messages.map(MessageResponseDto.fromEntity);
  }

  @Get('messages/:id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MessageResponseDto> {
    const message = await this.messageService.findByIdOrThrow(id, user.id);
    return MessageResponseDto.fromEntity(message);
  }

  @Delete('messages/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.messageService.remove(id, user.id);
  }
}
