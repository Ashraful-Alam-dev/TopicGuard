"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { memberMessagesApi } from "@/lib/api/member-messages"

const ROOT = ["member-messages"] as const

export const myMemberMessagesQueryKey = (classroomId: string) =>
  [...ROOT, "classroom", classroomId, "mine"] as const

export const memberInboxQueryKey = (classroomId: string) =>
  [...ROOT, "classroom", classroomId, "inbox"] as const

export const dashboardMyMessagesQueryKey = [...ROOT, "dashboard", "mine"] as const
export const dashboardPendingQueryKey = [...ROOT, "dashboard", "pending"] as const

export function useMyMemberMessages(classroomId: string, enabled = true) {
  return useQuery({
    queryKey: myMemberMessagesQueryKey(classroomId),
    queryFn: () => memberMessagesApi.listMine(classroomId),
    enabled: !!classroomId && enabled,
  })
}

export function useMemberInbox(classroomId: string, enabled = true) {
  return useQuery({
    queryKey: memberInboxQueryKey(classroomId),
    queryFn: () => memberMessagesApi.listInbox(classroomId),
    enabled: !!classroomId && enabled,
  })
}

export function useDashboardMyMessages() {
  return useQuery({
    queryKey: dashboardMyMessagesQueryKey,
    queryFn: () => memberMessagesApi.listMineAcrossClassrooms(),
  })
}

export function useDashboardPendingMessages() {
  return useQuery({
    queryKey: dashboardPendingQueryKey,
    queryFn: () => memberMessagesApi.listPending(),
  })
}

/** Every list (classroom page + dashboard) refreshes after any change. */
function useInvalidateMemberMessages() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ROOT })
}

export function useSendMemberMessage(classroomId: string) {
  const invalidate = useInvalidateMemberMessages()
  return useMutation({
    mutationFn: (content: string) =>
      memberMessagesApi.create(classroomId, content),
    onSuccess: invalidate,
  })
}

export function useReplyMemberMessage() {
  const invalidate = useInvalidateMemberMessages()
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      memberMessagesApi.reply(id, content),
    onSuccess: invalidate,
  })
}

export function useDeleteMemberMessage() {
  const invalidate = useInvalidateMemberMessages()
  return useMutation({
    mutationFn: (id: string) => memberMessagesApi.remove(id),
    onSuccess: invalidate,
  })
}
