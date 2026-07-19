import { IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Shared by register and edit — both take exactly one field, with
 * identical validation. Reusing one DTO avoids duplicating the rules.
 */
export class TopicDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title!: string;
}
