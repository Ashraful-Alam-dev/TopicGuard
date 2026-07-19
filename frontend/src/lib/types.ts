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

export interface Topic {
  id: string;
  submissionId: string;
  studentId: string;
  originalTitle: string;
  normalizedTitle: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopicWithStudent extends Topic {
  student: Pick<User, "id" | "name" | "email" | "avatarUrl">;
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

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}
