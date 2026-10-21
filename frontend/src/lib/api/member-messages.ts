import { apiClient } from "./client";
import type { MemberMessage, PendingMemberMessages } from "@/lib/types";

export const memberMessagesApi = {
  create: (classroomId: string, content: string) =>
    apiClient
      .post<MemberMessage>(`/classrooms/${classroomId}/member-messages`, {
        content,
      })
      .then((res) => res.data),

  /** Messages the current user sent in this classroom. */
  listMine: (classroomId: string) =>
    apiClient
      .get<MemberMessage[]>(`/classrooms/${classroomId}/member-messages/mine`)
      .then((res) => res.data),

  /** Monitor-only: everything members sent to this classroom's CR. */
  listInbox: (classroomId: string) =>
    apiClient
      .get<MemberMessage[]>(`/classrooms/${classroomId}/member-messages/inbox`)
      .then((res) => res.data),

  /** Dashboard: latest messages the user sent, across classrooms. */
  listMineAcrossClassrooms: () =>
    apiClient
      .get<MemberMessage[]>(`/member-messages/mine`)
      .then((res) => res.data),

  /** Dashboard: unanswered messages in classrooms the user monitors. */
  listPending: () =>
    apiClient
      .get<PendingMemberMessages>(`/member-messages/pending`)
      .then((res) => res.data),

  reply: (id: string, content: string) =>
    apiClient
      .post<MemberMessage>(`/member-messages/${id}/reply`, { content })
      .then((res) => res.data),

  remove: (id: string) =>
    apiClient.delete(`/member-messages/${id}`).then(() => undefined),
};
