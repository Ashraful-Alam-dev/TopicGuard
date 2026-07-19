"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { messagesApi, type CreateMessagePayload } from "@/lib/api/messages"

export const messagesQueryKey = (classroomId: string) =>
  ["classrooms", classroomId, "messages"] as const

export function useMessages(classroomId: string) {
  return useQuery({
    queryKey: messagesQueryKey(classroomId),
    queryFn: () => messagesApi.listForClassroom(classroomId),
    enabled: !!classroomId,
  })
}

export function useSendMessage(classroomId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateMessagePayload) =>
      messagesApi.create(classroomId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagesQueryKey(classroomId) })
    },
  })
}

export function useDeleteMessage(classroomId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => messagesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagesQueryKey(classroomId) })
    },
  })
}
