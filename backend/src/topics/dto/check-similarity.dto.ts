import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CheckSimilarityDto {
  @IsUUID()
  submissionId!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title!: string;
}
