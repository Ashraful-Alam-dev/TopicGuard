import { Module } from '@nestjs/common';
import { TopicController } from './topic.controller';
import { TopicSimilarityController } from './topic-similarity.controller';
import { TopicService } from './topic.service';
import { TopicVectorRepository } from './topic-vector.repository';
import { SubmissionModule } from '../submission/submission.module';
import { EmbeddingModule } from '../embedding/embedding.module';

@Module({
  imports: [SubmissionModule, EmbeddingModule],
  controllers: [TopicController, TopicSimilarityController],
  providers: [TopicService, TopicVectorRepository],
})
export class TopicModule {}
