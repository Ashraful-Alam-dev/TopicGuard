import { Module } from '@nestjs/common';

import { SubmissionModule } from '../submission/submission.module';
import { RateLimitModule } from '../common/rate-limit/rate-limit.module';
import { ConsultAiController } from './consult-ai.controller';
import { ConsultAiService } from './consult-ai.service';

@Module({
  imports: [SubmissionModule, RateLimitModule],
  controllers: [ConsultAiController],
  providers: [ConsultAiService],
})
export class ConsultAiModule {}
