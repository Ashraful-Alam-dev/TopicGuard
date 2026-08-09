import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { User } from '@prisma/client';
import { TopicService } from './topic.service';
import { TopicDto } from './dto/topic.dto';
import { TopicResponseDto } from './dto/topic-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CheckTopicResponseDto } from './dto/check-topic-response.dto';
import { AvailableMemberDto } from './dto/available-member.dto';

@Controller('submissions/:submissionId/topics')
export class TopicController {
  constructor(private readonly topicService: TopicService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(
    @CurrentUser() user: User,
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() dto: TopicDto,
  ): Promise<TopicResponseDto> {
    const topic = await this.topicService.registerTopic(
      submissionId,
      user.id,
      dto,
    );
    return TopicResponseDto.fromEntity(topic);
  }

  @Get('check')
  @HttpCode(HttpStatus.OK)
  async checkAvailability(
    @CurrentUser() user: User,
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Query('title') title: string,
    @Query('topicId') topicId?: string,
  ): Promise<CheckTopicResponseDto> {
    return this.topicService.checkTopicAvailability(
      submissionId,
      user.id,
      title,
      topicId,
    );
  }

  @Get('available-members')
  @HttpCode(HttpStatus.OK)
  async getAvailableMembers(
    @CurrentUser() user: User,
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
  ): Promise<AvailableMemberDto[]> {
    return this.topicService.getAvailableMembers(submissionId, user.id);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getOwn(
    @CurrentUser() user: User,
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
  ): Promise<TopicResponseDto> {
    const topic = await this.topicService.getOwnTopic(submissionId, user.id);
    return TopicResponseDto.fromEntity(topic);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async updateOwn(
    @CurrentUser() user: User,
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() dto: TopicDto,
  ): Promise<TopicResponseDto> {
    const topic = await this.topicService.updateOwnTopic(
      submissionId,
      user.id,
      dto,
    );
    return TopicResponseDto.fromEntity(topic);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOwn(
    @CurrentUser() user: User,
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
  ): Promise<void> {
    await this.topicService.deleteOwnTopic(submissionId, user.id);
  }

  @Get()
  async getSubmissionTopics(
    @CurrentUser() user: User,
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
  ) {
    return this.topicService.getSubmissionTopics(
      submissionId,
      user.id,
    );
  }
}
