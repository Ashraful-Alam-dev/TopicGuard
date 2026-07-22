import { Module } from '@nestjs/common';

import { EmbeddingService } from './embedding.service';
import { OpenAiEmbeddingProvider } from './providers/openai-embedding.provider';
import { TransformersEmbeddingProvider } from './providers/transformers-embedding.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [
    EmbeddingService,
    OpenAiEmbeddingProvider,
    TransformersEmbeddingProvider,
  ],
  exports: [EmbeddingService],
})
export class EmbeddingModule {}