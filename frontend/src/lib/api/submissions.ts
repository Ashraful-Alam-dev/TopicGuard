import { apiClient } from "./client";
import type { Submission } from "@/lib/types";

export interface CreateSubmissionPayload {
  title: string;
  description?: string;
  openDate: string;
  closeDate: string;
}

export type UpdateSubmissionPayload = Partial<CreateSubmissionPayload>;

export const submissionsApi = {
  listForClassroom: (classroomId: string) =>
    apiClient
      .get<Submission[]>(`/classrooms/${classroomId}/submissions`)
      .then((res) => res.data),

  get: (id: string) =>
    apiClient.get<Submission>(`/submissions/${id}`).then((res) => res.data),

  create: (classroomId: string, payload: CreateSubmissionPayload) =>
    apiClient
      .post<Submission>(`/classrooms/${classroomId}/submissions`, payload)
      .then((res) => res.data),

  update: (id: string, payload: UpdateSubmissionPayload) =>
    apiClient
      .patch<Submission>(`/submissions/${id}`, payload)
      .then((res) => res.data),

  open: (id: string) =>
    apiClient
      .patch<Submission>(`/submissions/${id}/open`)
      .then((res) => res.data),

  close: (id: string) =>
    apiClient
      .patch<Submission>(`/submissions/${id}/close`)
      .then((res) => res.data),
};
