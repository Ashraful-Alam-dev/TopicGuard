import { apiClient } from "./client";
import type { ConsultAiResult } from "@/lib/types";

export interface ConsultAiPayload {
  submissionId: string;
  title: string;
}

export const consultAiApi = {
  /**
   * POST /topics/consult-ai — sits next to checkSimilarity in the flat
   * /topics namespace (see ConsultAiController). Optional/non-blocking by
   * design: callers are expected to catch failures and degrade gracefully
   * rather than surface them as a hard error.
   */
  evaluate: (payload: ConsultAiPayload) =>
    apiClient
      .post<ConsultAiResult>("/topics/consult-ai", payload)
      .then((res) => res.data),
};
