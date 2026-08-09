import {
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Shared by register and edit — both take the same fields, with
 * identical validation. Reusing one DTO avoids duplicating the rules.
 *
 * memberIds is optional: omitting it (or sending an empty array) keeps
 * the topic individual. A non-empty array registers/updates it as a team
 * topic, with the requesting student as leader.
 */
export class TopicDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  memberIds?: string[];
}
