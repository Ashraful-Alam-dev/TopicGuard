import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { SubmissionResponseDto } from './dto/submission-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * No class-level prefix: creation/listing are nested under their owning
 * classroom, while single-resource actions (get/edit/open/close) address
 * the submission directly. Mirrors how the routes read in the API.
 */
@Controller()
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post('classrooms/:classroomId/submissions')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: User,
    @Param('classroomId', ParseUUIDPipe) classroomId: string,
    @Body() dto: CreateSubmissionDto,
  ): Promise<SubmissionResponseDto> {
    const submission = await this.submissionService.create(
      classroomId,
      user.id,
      dto,
    );
    return SubmissionResponseDto.fromEntity(submission);
  }

  @Get('classrooms/:classroomId/submissions')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() user: User,
    @Param('classroomId', ParseUUIDPipe) classroomId: string,
  ): Promise<SubmissionResponseDto[]> {
    const submissions = await this.submissionService.findAllForClassroom(
      classroomId,
      user.id,
    );
    return submissions.map(SubmissionResponseDto.fromEntity);
  }

  @Get('submissions/:id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SubmissionResponseDto> {
    const submission = await this.submissionService.findByIdOrThrow(
      id,
      user.id,
    );
    return SubmissionResponseDto.fromEntity(submission);
  }

  @Patch('submissions/:id')
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubmissionDto,
  ): Promise<SubmissionResponseDto> {
    const submission = await this.submissionService.update(
      id,
      user.id,
      dto,
    );
    return SubmissionResponseDto.fromEntity(submission);
  }

  @Patch('submissions/:id/open')
  @HttpCode(HttpStatus.OK)
  async open(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SubmissionResponseDto> {
    const submission = await this.submissionService.open(id, user.id);
    return SubmissionResponseDto.fromEntity(submission);
  }

  @Patch('submissions/:id/close')
  @HttpCode(HttpStatus.OK)
  async close(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SubmissionResponseDto> {
    const submission = await this.submissionService.close(id, user.id);
    return SubmissionResponseDto.fromEntity(submission);
  }
}
