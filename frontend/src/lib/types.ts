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

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}
