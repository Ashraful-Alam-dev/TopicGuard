import { apiClient } from "./client";
import type { Classroom } from "@/lib/types";

export interface CreateClassroomPayload {
  name: string;
  courseCode: string;
  description?: string;
}

export type UpdateClassroomPayload = Partial<CreateClassroomPayload>;

export const classroomsApi = {
  list: () => apiClient.get<Classroom[]>("/classrooms").then((res) => res.data),

  get: (id: string) =>
    apiClient.get<Classroom>(`/classrooms/${id}`).then((res) => res.data),

  create: (payload: CreateClassroomPayload) =>
    apiClient.post<Classroom>("/classrooms", payload).then((res) => res.data),

  join: (joinCode: string) =>
    apiClient
      .post<Classroom>("/classrooms/join", { joinCode })
      .then((res) => res.data),

  update: (id: string, payload: UpdateClassroomPayload) =>
    apiClient
      .patch<Classroom>(`/classrooms/${id}`, payload)
      .then((res) => res.data),

  archive: (id: string) =>
    apiClient
      .patch<Classroom>(`/classrooms/${id}/archive`)
      .then((res) => res.data),

  unarchive: (id: string) =>
    apiClient
      .patch<Classroom>(`/classrooms/${id}/unarchive`)
      .then((res) => res.data),

  transferMonitor: (id: string, newMonitorId: string) =>
    apiClient
      .patch<Classroom>(`/classrooms/${id}/transfer-monitor`, {
        newMonitorId,
      })
      .then((res) => res.data),
};
