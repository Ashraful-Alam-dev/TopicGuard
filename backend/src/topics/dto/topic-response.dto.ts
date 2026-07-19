import { Topic } from '@prisma/client';

export class TopicResponseDto {
  id!: string;
  submissionId!: string;
  studentId!: string;
  originalTitle!: string;
  normalizedTitle!: string;
  createdAt!: Date;
  updatedAt!: Date;

  private constructor(topic: Topic) {
    this.id = topic.id;
    this.submissionId = topic.submissionId;
    this.studentId = topic.studentId;
    this.originalTitle = topic.originalTitle;
    this.normalizedTitle = topic.normalizedTitle;
    this.createdAt = topic.createdAt;
    this.updatedAt = topic.updatedAt;
  }

  static fromEntity(topic: Topic): TopicResponseDto {
    return new TopicResponseDto(topic);
  }
}
