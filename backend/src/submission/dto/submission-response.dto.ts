import { Submission } from '@prisma/client';

export class SubmissionResponseDto {
  id!: string;
  classroomId!: string;
  title!: string;
  description!: string | null;
  openDate!: Date;
  closeDate!: Date;
  isOpen!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  private constructor(submission: Submission) {
    this.id = submission.id;
    this.classroomId = submission.classroomId;
    this.title = submission.title;
    this.description = submission.description;
    this.openDate = submission.openDate;
    this.closeDate = submission.closeDate;
    this.isOpen = submission.isOpen;
    this.createdAt = submission.createdAt;
    this.updatedAt = submission.updatedAt;
  }

  static fromEntity(submission: Submission): SubmissionResponseDto {
    return new SubmissionResponseDto(submission);
  }
}
