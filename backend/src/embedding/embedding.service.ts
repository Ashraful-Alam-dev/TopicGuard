import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EMBEDDING_DIMENSIONS } from './embedding.constants';
import { EmbeddingProvider } from './interfaces/embedding-provider.interface';
import { OpenAiEmbeddingProvider } from './providers/openai-embedding.provider';
import { TransformersEmbeddingProvider } from './providers/transformers-embedding.provider';

@Injectable()
export class EmbeddingService {
  private readonly provider: EmbeddingProvider;

  readonly dimensions = EMBEDDING_DIMENSIONS;

  constructor(
    private readonly configService: ConfigService,
    private readonly openAiProvider: OpenAiEmbeddingProvider,
    private readonly transformersProvider: TransformersEmbeddingProvider,
  ) {
    const provider =
      this.configService.get<string>('embedding.provider') ?? 'transformers';

    switch (provider) {
      case 'transformers':
        this.provider = this.transformersProvider;
        break;

      case 'openai':
        this.provider = this.openAiProvider;
        break;

      default:
        throw new InternalServerErrorException(`Unsupported embedding provider: ${provider}`);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const embedding = await this.provider.generateEmbedding(text.trim());

    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new InternalServerErrorException(
        `Embedding provider "${this.provider.name}" returned ${embedding.length} dimensions. Expected ${EMBEDDING_DIMENSIONS}.`,
      );
    }

    return embedding;
  }
}