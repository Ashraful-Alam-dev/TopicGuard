import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

/** classroomName and submissionDetails are intentionally NOT accepted here anymore — they're derived server-side from submissionId (see ConsultAiService.getSubmissionContext) so a client can't send arbitrary context for a submission it doesn't actually belong to. */
export class ConsultAiDto {
  @IsUUID()
  submissionId!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  title!: string;

  /** Optional project description the student wrote under the title. */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}