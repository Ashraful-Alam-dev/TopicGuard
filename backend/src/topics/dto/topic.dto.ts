import {
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Shared by register and edit — both take the same fields, with identical validation. */
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
