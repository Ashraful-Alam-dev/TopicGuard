import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { User } from '@prisma/client';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ConsultAiService } from './consult-ai.service';
import { ConsultAiDto } from './dto/consult-ai-request.dto';
import { ConsultAiResponseDto } from './dto/consult-ai-response.dto';

/**
 * Sits alongside TopicSimilarityController's POST /topics/check-similarity
 * — same flat /topics namespace, same auth (global JwtAuthGuard), same
 * "always 200, never a hard block" contract for this optional feature.
 */
@Controller('topics')
export class ConsultAiController {
  constructor(private readonly consultAiService: ConsultAiService) {}

  @Post('consult-ai')
  @HttpCode(HttpStatus.OK)
  async consult(
    @CurrentUser() user: User,
    @Body() dto: ConsultAiDto,
  ): Promise<ConsultAiResponseDto> {
    return this.consultAiService.evaluateTopic(user.id, dto);
  }
}
