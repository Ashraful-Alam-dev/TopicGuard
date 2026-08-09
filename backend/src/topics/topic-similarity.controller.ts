import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TopicService } from './topic.service';

import { CheckSimilarityDto } from './dto/check-similarity.dto';
import { SimilarityCheckResponseDto } from './dto/similarity-check-response.dto';

@Controller('topics')
export class TopicSimilarityController {
  constructor(
    private readonly topicService: TopicService,
  ) {}

  @Post('check-similarity')
  @HttpCode(HttpStatus.OK)
  async checkSimilarity(
    @CurrentUser() user: User,
    @Body() dto: CheckSimilarityDto,
  ): Promise<SimilarityCheckResponseDto> {
    return this.topicService.checkSemanticSimilarity(
      dto.submissionId,
      user.id,
      dto.title,
      dto.topicId,
    );
  }
}