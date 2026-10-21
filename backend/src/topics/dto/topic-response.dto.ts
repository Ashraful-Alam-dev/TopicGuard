import { Topic } from '@prisma/client';
import { parseTopicText } from '../../common/utils/topic-text.util';

export interface TopicMemberSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

// Define a type for topics that include the vector similarity payload
export type TopicWithSimilarity = Topic & {
  highestSimilarity?: number | null;
  similarTopics?: Array<{
    title: string;
    studentName: string | null;
    similarityScore: number;
  }>;
  // Present once a topic is enriched with team info (register/update/get/
  // monitor list). studentId above always remains the leader's id — these
  // are the same person, exposed in a friendlier shape for the frontend.
  leader?: TopicMemberSummary;
  members?: TopicMemberSummary[];
};

export class TopicResponseDto {
  id!: string;
  submissionId!: string;
  studentId!: string;
  /** Title only — the description is stored in the same column and split out here. */
  originalTitle!: string;
  description!: string | null;
  normalizedTitle!: string;
  createdAt!: Date;
  updatedAt!: Date;

  highestSimilarity?: number | null;
  similarTopics?: Array<{
    title: string;
    studentName: string | null;
    similarityScore: number;
  }>;

  // Team fields. leader mirrors studentId/originalTitle's owner; members is
  // empty for an individual topic (no team added).
  leader?: TopicMemberSummary;
  members!: TopicMemberSummary[];
  isTeamTopic!: boolean;

  private constructor(topic: TopicWithSimilarity) {
    this.id = topic.id;
    this.submissionId = topic.submissionId;
    this.studentId = topic.studentId;
    const parsed = parseTopicText(topic.originalTitle);
    this.originalTitle = parsed.title;
    this.description = parsed.description;
    this.normalizedTitle = topic.normalizedTitle;
    this.createdAt = topic.createdAt;
    this.updatedAt = topic.updatedAt;

    // Map the extra calculated properties!
    this.highestSimilarity = topic.highestSimilarity ?? null;
    this.similarTopics = topic.similarTopics ?? [];

    this.leader = topic.leader;
    this.members = topic.members ?? [];
    this.isTeamTopic = this.members.length > 0;
  }

  static fromEntity(topic: TopicWithSimilarity): TopicResponseDto {
    return new TopicResponseDto(topic);
  }
}