import { PartialType } from '@nestjs/mapped-types';
import { CreateSubmissionDto } from './create-submission.dto';

// Deliberately based on CreateSubmissionDto (not a hand-rolled type) so
// isOpen can never be set through this DTO — open/close are their own
// explicit actions, not a field edit.
export class UpdateSubmissionDto extends PartialType(CreateSubmissionDto) {}
