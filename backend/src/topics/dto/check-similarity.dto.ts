import { IsString, IsUUID, IsOptional, MaxLength, MinLength } from 'class-validator';
import {
  TOPIC_DESCRIPTION_MAX_LENGTH,
  TOPIC_TITLE_MAX_LENGTH,
} from '../../common/utils/topic-text.util';

export class CheckSimilarityDto {
  @IsUUID()
  submissionId!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(TOPIC_TITLE_MAX_LENGTH)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(TOPIC_DESCRIPTION_MAX_LENGTH)
  description?: string;

  @IsOptional()
  @IsUUID()
  topicId?: string;
}
