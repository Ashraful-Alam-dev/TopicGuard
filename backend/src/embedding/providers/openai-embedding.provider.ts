import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmbeddingProvider } from '../interfaces/embedding-provider.interface';
import { EMBEDDING_DIMENSIONS } from '../embedding.constants';

const OPENAI_EMBEDDINGS_URL = 'https://api.openai.com/v1/embeddings';

interface OpenAIEmbeddingResponse {
  data: { embedding: number[] }[];
}

@Injectable()
export class OpenAiEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'openai';

  private readonly logger = new Logger(OpenAiEmbeddingProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async generateEmbedding(text: string): Promise<number[]> {
    const apiKey = this.configService.get<string>('embedding.openaiApiKey');
    const model = this.configService.get<string>('embedding.openaiModel') ?? 'text-embedding-3-small';

    if (!apiKey) {
      throw new InternalServerErrorException(
        'Embedding provider is configured as "openai" but OPENAI_API_KEY is missing.',
      );
    }

    let response: Response;
    try {
      response = await fetch(OPENAI_EMBEDDINGS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          input: text,
          dimensions: EMBEDDING_DIMENSIONS,
        }),
      });
    } catch (error) {
      this.logger.error('Failed to reach OpenAI embeddings API', error as Error);
      throw new InternalServerErrorException(
        'Could not reach the embedding provider',
      );
    }

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`OpenAI embeddings API error (${response.status}): ${body}`);
      throw new InternalServerErrorException(
        'Embedding provider returned an error',
      );
    }

    const payload = (await response.json()) as OpenAIEmbeddingResponse;
    const embedding = payload.data?.[0]?.embedding;

    if (!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new InternalServerErrorException(
        'Embedding provider returned an unexpected vector shape',
      );
    }

    return embedding;
  }
}
