import {
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  TOPIC_DESCRIPTION_MAX_LENGTH,
  TOPIC_TITLE_MAX_LENGTH,
} from '../../common/utils/topic-text.util';

/** Shared by register and edit — both take the same fields, with identical validation. */
export class TopicDto {
  @IsString()
  @MinLength(3)
  @MaxLength(TOPIC_TITLE_MAX_LENGTH)
  title!: string;

  /** Optional. Stored together with the title (see topic-text.util.ts). */
  @IsOptional()
  @IsString()
  @MaxLength(TOPIC_DESCRIPTION_MAX_LENGTH)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  memberIds?: string[];
}
