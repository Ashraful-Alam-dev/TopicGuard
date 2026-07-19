import { apiClient } from "./client";
import type { Message } from "@/lib/types";

export interface CreateMessagePayload {
  title: string;
  content: string;
}

export const messagesApi = {
  listForClassroom: (classroomId: string) =>
    apiClient
      .get<Message[]>(`/classrooms/${classroomId}/messages`)
      .then((res) => res.data),

  create: (classroomId: string, payload: CreateMessagePayload) =>
    apiClient
      .post<Message>(`/classrooms/${classroomId}/messages`, payload)
      .then((res) => res.data),

  remove: (id: string) =>
    apiClient.delete(`/messages/${id}`).then(() => undefined),
};
