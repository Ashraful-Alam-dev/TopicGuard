import axios from "axios";
import { apiClient } from "./client";
import type {
  AvailableTopicMember,
  SimilarityCheckResponse,
  SubmissionTopicsResponse,
  Topic,
} from "@/lib/types";

export interface TopicPayload {
  title: string;
  /** IDs of students to attach as team members. */
  memberIds?: string[];
}

export interface TopicAvailabilityResponse {
  available: boolean;
  student?: {
    id: string;
    name: string;
  };
}

export const topicsApi = {
  /**
   * Returns null when the student hasn't registered a topic yet (the API
   * responds 404 in that case) instead of throwing, so callers can render
   * an empty registration form without special-casing the error.
   */
  getOwn: async (submissionId: string): Promise<Topic | null> => {
    try {
      const res = await apiClient.get<Topic>(
        `/submissions/${submissionId}/topics/me`
      );
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  register: (submissionId: string, payload: TopicPayload) =>
    apiClient
      .post<Topic>(`/submissions/${submissionId}/topics`, payload)
      .then((res) => res.data),

  updateOwn: (submissionId: string, payload: TopicPayload) =>
    apiClient
      .patch<Topic>(`/submissions/${submissionId}/topics/me`, payload)
      .then((res) => res.data),

  deleteOwn: (submissionId: string) =>
    apiClient
      .delete(`/submissions/${submissionId}/topics/me`)
      .then(() => undefined),

  /**
   * Monitor-only: every student's registered topic for a submission, plus
   * the submission/classroom context and a total count.
   */
  getSubmissionTopics: (submissionId: string) =>
    apiClient
      .get<SubmissionTopicsResponse>(`/submissions/${submissionId}/topics`)
      .then((res) => res.data),

  checkAvailability: (
    submissionId: string,
    title: string,
    topicId?: string,
  ) =>
    apiClient
      .get(
        `/submissions/${submissionId}/topics/check`,
        {
          params: {
            title,
            ...(topicId ? { topicId } : {}),
          },
        },
      )
      .then((res) => res.data),

  /** Students in the submission's classroom who aren't already attached (as leader or member) to a topic in this submission. */
  getAvailableMembers: (submissionId: string) =>
    apiClient
      .get<AvailableTopicMember[]>(
        `/submissions/${submissionId}/topics/available-members`,
      )
      .then((res) => res.data),

  /** Semantic similarity check, run right before a final submit. */
  checkSimilarity: (
    submissionId: string,
    title: string,
    topicId?: string,
  ) =>
    apiClient
      .post(`/topics/check-similarity`, {
        submissionId,
        title,
        ...(topicId ? { topicId } : {}),
      })
      .then((res) => res.data),
};
