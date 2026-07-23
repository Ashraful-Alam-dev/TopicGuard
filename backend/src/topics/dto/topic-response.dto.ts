import { Topic } from '@prisma/client';

// Define a type for topics that include the vector similarity payload
export type TopicWithSimilarity = Topic & {
  highestSimilarity?: number | null;
  similarTopics?: Array<{
    title: string;
    studentName: string | null;
    similarityScore: number;
  }>;
};

export class TopicResponseDto {
  id!: string;
  submissionId!: string;
  studentId!: string;
  originalTitle!: string;
  normalizedTitle!: string;
  createdAt!: Date;
  updatedAt!: Date;

  highestSimilarity?: number | null;
  similarTopics?: Array<{
    title: string;
    studentName: string | null;
    similarityScore: number;
  }>;

  private constructor(topic: TopicWithSimilarity) {
    this.id = topic.id;
    this.submissionId = topic.submissionId;
    this.studentId = topic.studentId;
    this.originalTitle = topic.originalTitle;
    this.normalizedTitle = topic.normalizedTitle;
    this.createdAt = topic.createdAt;
    this.updatedAt = topic.updatedAt;

    // Map the extra calculated properties!
    this.highestSimilarity = topic.highestSimilarity ?? null;
    this.similarTopics = topic.similarTopics ?? [];
  }

  static fromEntity(topic: TopicWithSimilarity): TopicResponseDto {
    return new TopicResponseDto(topic);
  }
}