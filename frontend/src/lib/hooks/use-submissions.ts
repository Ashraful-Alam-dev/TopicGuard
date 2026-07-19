"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  submissionsApi,
  type CreateSubmissionPayload,
  type UpdateSubmissionPayload,
} from "@/lib/api/submissions"

export const submissionsQueryKey = (classroomId: string) =>
  ["classrooms", classroomId, "submissions"] as const
export const submissionQueryKey = (id: string) => ["submissions", id] as const

export function useSubmissions(classroomId: string) {
  return useQuery({
    queryKey: submissionsQueryKey(classroomId),
    queryFn: () => submissionsApi.listForClassroom(classroomId),
    enabled: !!classroomId,
  })
}

export function useSubmission(id: string) {
  return useQuery({
    queryKey: submissionQueryKey(id),
    queryFn: () => submissionsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateSubmission(classroomId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSubmissionPayload) =>
      submissionsApi.create(classroomId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: submissionsQueryKey(classroomId),
      })
    },
  })
}

export function useUpdateSubmission(id: string, classroomId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateSubmissionPayload) =>
      submissionsApi.update(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(submissionQueryKey(id), data)
      queryClient.invalidateQueries({
        queryKey: submissionsQueryKey(classroomId),
      })
    },
  })
}

export function useOpenSubmission(id: string, classroomId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => submissionsApi.open(id),
    onSuccess: (data) => {
      queryClient.setQueryData(submissionQueryKey(id), data)
      queryClient.invalidateQueries({
        queryKey: submissionsQueryKey(classroomId),
      })
    },
  })
}

export function useCloseSubmission(id: string, classroomId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => submissionsApi.close(id),
    onSuccess: (data) => {
      queryClient.setQueryData(submissionQueryKey(id), data)
      queryClient.invalidateQueries({
        queryKey: submissionsQueryKey(classroomId),
      })
    },
  })
}
