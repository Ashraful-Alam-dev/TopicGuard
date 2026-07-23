import {
  Injectable,
  Logger,
  OnModuleInit,
  InternalServerErrorException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { pipeline } from '@huggingface/transformers';
import { EmbeddingProvider } from '../interfaces/embedding-provider.interface';
import { EMBEDDING_DIMENSIONS } from '../embedding.constants';

type EmbeddingPipeline = (
  text: string,
  options?: {
    pooling?: 'mean' | 'cls';
    normalize?: boolean;
  },
) => Promise<{
  data: Float32Array;
}>;

@Injectable()
export class TransformersEmbeddingProvider
  implements EmbeddingProvider, OnModuleInit
{
  readonly name = 'transformers';

  private readonly logger = new Logger(TransformersEmbeddingProvider.name);

  private extractor!: EmbeddingPipeline;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const model =
      this.configService.get<string>('embedding.transformerModel') ??
      'Xenova/all-MiniLM-L6-v2';

    this.logger.log(`Loading embedding model: ${model}`);

    this.extractor = (await pipeline(
      'feature-extraction',
      model,
    )) as unknown as EmbeddingPipeline;

    this.logger.log('Embedding model loaded.');
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.extractor) {
      throw new InternalServerErrorException('Embedding model has not been initialized.');
    }

    const output = await this.extractor(text, {
      pooling: 'mean',
      normalize: true,
    });

    const embedding = Array.from(output.data);

    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new InternalServerErrorException(
        `Expected ${EMBEDDING_DIMENSIONS} dimensions but received ${embedding.length}.`,
      );
    }

    return embedding;
  }
}