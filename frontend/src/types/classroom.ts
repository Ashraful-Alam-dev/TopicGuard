import { User } from "./user";

/** Mirrors backend ClassroomResponseDto. */
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
  /** Only present on the classroom detail endpoint. */
  members?: User[];
}

export interface CreateClassroomInput {
  name: string;
  courseCode: string;
  description?: string;
}

export type UpdateClassroomInput = Partial<CreateClassroomInput>;

export interface JoinClassroomInput {
  joinCode: string;
}

export interface TransferMonitorInput {
  newMonitorId: string;
}
