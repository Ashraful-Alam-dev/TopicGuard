import { Module } from '@nestjs/common';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';
import { SubmissionModule } from '../submission/submission.module';

@Module({
  imports: [SubmissionModule],
  controllers: [TopicController],
  providers: [TopicService],
})
export class TopicModule {}
