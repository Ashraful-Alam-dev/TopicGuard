"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { topicsApi, type TopicPayload } from "@/lib/api/topics"

export const ownTopicQueryKey = (submissionId: string) =>
  ["submissions", submissionId, "topics", "me"] as const

export const topicAvailabilityQueryKey = (
  submissionId: string,
  title: string,
) =>
  ["submissions", submissionId, "topics", "check", title] as const;

export function useOwnTopic(submissionId: string) {
  return useQuery({
    queryKey: ownTopicQueryKey(submissionId),
    queryFn: () => topicsApi.getOwn(submissionId),
    enabled: !!submissionId,
  })
}

export function useRegisterTopic(submissionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TopicPayload) =>
      topicsApi.register(submissionId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(ownTopicQueryKey(submissionId), data)
      queryClient.invalidateQueries({
        queryKey: submissionTopicsQueryKey(submissionId),
      })
    },
  })
}

export function useUpdateOwnTopic(submissionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TopicPayload) =>
      topicsApi.updateOwn(submissionId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(ownTopicQueryKey(submissionId), data)
      queryClient.invalidateQueries({
        queryKey: submissionTopicsQueryKey(submissionId),
      })
    },
  })
}

export function useDeleteOwnTopic(submissionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => topicsApi.deleteOwn(submissionId),
    onSuccess: () => {
      queryClient.setQueryData(ownTopicQueryKey(submissionId), null)
      queryClient.invalidateQueries({
        queryKey: submissionTopicsQueryKey(submissionId),
      })
    },
  })
}

export const submissionTopicsQueryKey = (submissionId: string) =>
  ["submissions", submissionId, "topics"] as const

export function useSubmissionTopics(submissionId: string, enabled = true) {
  return useQuery({
    queryKey: submissionTopicsQueryKey(submissionId),
    queryFn: () => topicsApi.getSubmissionTopics(submissionId),
    enabled: !!submissionId && enabled,
  })
}

export function useTopicAvailability(
  submissionId: string,
  title: string,
  topicId?: string,
) {
  return useQuery({
    queryKey: [
      ...topicAvailabilityQueryKey(submissionId, title),
      topicId ?? null,
    ],
    queryFn: () =>
      topicsApi.checkAvailability(
        submissionId,
        title,
        topicId,
      ),
    enabled:
      !!submissionId &&
      title.trim().length > 2,
    staleTime: 5000,
  });
}

/** Semantic similarity check — triggered on submit, not on keystroke (unlike useTopicAvailability). */
export function useCheckSimilarity(submissionId: string) {
  return useMutation({
    mutationFn: ({
      title,
      topicId,
    }: {
      title: string
      topicId?: string
    }) =>
      topicsApi.checkSimilarity(
        submissionId,
        title,
        topicId,
      ),
  })
}

export const availableTopicMembersQueryKey = (submissionId: string) =>
  ["submissions", submissionId, "topics", "available-members"] as const

/** Classroom students available to add as team members, not yet on another topic. */
export function useAvailableTopicMembers(submissionId: string, enabled = true) {
  return useQuery({
    queryKey: availableTopicMembersQueryKey(submissionId),
    queryFn: () => topicsApi.getAvailableMembers(submissionId),
    enabled: !!submissionId && enabled,
    staleTime: 5000,
  })
}
