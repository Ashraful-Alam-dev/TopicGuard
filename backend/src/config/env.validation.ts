import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

enum EmbeddingProvider {
  Transformers = 'transformers',
  OpenAI = 'openai',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  PORT: number = 3000;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  @MinLength(16, {
    message: 'JWT_SECRET must be at least 16 characters long',
  })
  JWT_SECRET!: string;

  @IsString()
  JWT_EXPIRES_IN: string = '1d';

  @IsString()
  CORS_ORIGIN: string = 'http://localhost:3001';

  @IsString()
  COOKIE_SECURE: string = 'false';

  @IsEnum(EmbeddingProvider)
  EMBEDDING_PROVIDER: EmbeddingProvider =
    EmbeddingProvider.Transformers;

  @IsOptional()
  @IsString()
  TRANSFORMER_MODEL?: string;

  @IsOptional()
  @IsString()
  OPENAI_EMBEDDING_MODEL?: string;
  
  @IsNumber()
  @Min(0)
  @Max(1)
  SIMILARITY_THRESHOLD: number = 0.75;

  @IsOptional()
  @IsString()
  OPENAI_API_KEY?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');

    throw new Error(`Environment validation failed: ${messages}`);
  }

  return validatedConfig;
}