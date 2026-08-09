export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Classroom {
  id: string;
  name: string;
  courseCode: string;
  description: string | null;
  joinCode: string;
  isArchived: boolean;
  monitor: User;
  memberCount: number;
  isMonitor: boolean;
  createdAt: string;
  updatedAt: string;
  members?: User[];
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Submission {
  id: string;
  classroomId: string;
  title: string;
  description: string | null;
  openDate: string;
  closeDate: string;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * A student attached to a topic, either as the leader (the student who
 * registered it) or as a team member added by the leader. Mirrors the
 * subset of `User` the backend embeds on `TopicResponseDto`.
 */
export interface TopicMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface Topic {
  id: string;
  submissionId: string;
  studentId: string;
  originalTitle: string;
  normalizedTitle: string;
  createdAt: string;
  updatedAt: string;

  highestSimilarity: number | null;
  similarTopics: SimilarTopic[];

  /**
   * Team fields — always present on `TopicResponseDto`. An individual
   * (non-team) topic simply has `isTeamTopic: false` and `members: []`.
   * `leader` is the student who registered the topic (== studentId).
   */
  leader: TopicMember;
  members: TopicMember[];
  isTeamTopic: boolean;
}

/**
 * A classroom student who is not yet attached to any topic in this
 * submission, and can therefore be added as a team member. Returned by
 * GET /submissions/:submissionId/topics/available-members.
 */
export type AvailableTopicMember = TopicMember;

export interface SimilarTopic {
  title: string;
  similarityScore: number;
  submissionId: string;
  studentName?: string;
}

export interface TopicWithStudent extends Topic {
  student: Pick<User, "id" | "name" | "email" | "avatarUrl">;

  highestSimilarity: number | null;

  similarTopics: SimilarTopic[];
}

export interface DuplicateTopic {
  studentId: string;
  studentName: string;
  title: string;
}

export interface SimilarityCheckResponse {
  isDuplicate: boolean;
  duplicate?: DuplicateTopic;
  similarTopics?: SimilarTopic[];
}

export interface SubmissionTopicsResponse {
  submission: Pick<
    Submission,
    "id" | "title" | "description" | "openDate" | "closeDate" | "isOpen"
  >;

  classroom: {
    id: string;
    name: string;
  };

  totalTopics: number;

  topics: TopicWithStudent[];
}

export interface Message {
  id: string;
  classroomId: string;
  senderId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shape returned by POST /topics/consult-ai. Mirrors the backend's
 * ConsultAiResponseDto exactly (see consult-ai-response.dto.ts) — camelCase,
 * already clamped/normalized server-side.
 */
export interface ConsultAiResult {
  score: number;
  uniqueness: string;
  relevance: string;
  suggestions: string[];
  recommendedTopics: string[];
}

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}