import axios from "axios"
import type { ApiErrorBody } from "@/lib/types"
import {
  CONSULT_AI_DAILY_LIMIT_MESSAGE,
  CONSULT_AI_SOFT_UNAVAILABLE_MESSAGE,
} from "./constants"

/** The backend already responds with the exact soft-unavailable wording on 429 (cooldown/rate limit) and 503 (Groq down, timeout, bad completion) — see ConsultAiService.mapProviderError. */
export function getConsultAiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiErrorBody
    if (data.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message
    }
  }
  return CONSULT_AI_SOFT_UNAVAILABLE_MESSAGE
}

/** True once the per-user daily Consult AI cap (see CONSULT_AI_DAILY_LIMIT) has been hit — used to disable the button for the rest of the day instead of just the usual 30s cooldown. */
export function isConsultAiDailyLimitError(error: unknown): boolean {
  if (!axios.isAxiosError(error) || error.response?.status !== 429) {
    return false
  }
  const data = error.response.data as ApiErrorBody | undefined
  const message = Array.isArray(data?.message)
    ? data?.message[0]
    : data?.message
  return !!message?.startsWith(CONSULT_AI_DAILY_LIMIT_MESSAGE)
}
