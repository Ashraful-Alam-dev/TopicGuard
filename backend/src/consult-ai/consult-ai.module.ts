import { Module } from '@nestjs/common';

import { SubmissionModule } from '../submission/submission.module';
import { ConsultAiController } from './consult-ai.controller';
import { ConsultAiService } from './consult-ai.service';

@Module({
  imports: [SubmissionModule],
  controllers: [ConsultAiController],
  providers: [ConsultAiService],
})
export class ConsultAiModule {}
