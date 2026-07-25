"use client"

import { useMutation } from "@tanstack/react-query"
import { consultAiApi, type ConsultAiPayload } from "@/lib/api/consult-ai"

/**
 * Imperative "run this once" action, same shape as useCheckSimilarity —
 * it's a mutation rather than a query since it's fired by a manual button
 * click, not derived from the current input.
 */
export function useConsultAi() {
  return useMutation({
    mutationFn: (payload: ConsultAiPayload) => consultAiApi.evaluate(payload),
  })
}
