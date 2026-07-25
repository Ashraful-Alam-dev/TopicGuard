import axios from "axios"
import type { ApiErrorBody } from "@/lib/types"
import { CONSULT_AI_SOFT_UNAVAILABLE_MESSAGE } from "./constants"

/**
 * The backend already responds with the exact soft-unavailable wording on
 * 429 (cooldown/rate limit) and 503 (Groq down, timeout, bad completion) —
 * see ConsultAiService.mapProviderError. This just surfaces that message
 * when present, and falls back to the same wording for anything that never
 * reached the server at all (client-side timeout, offline/network error),
 * so the card reads identically either way per the "graceful error
 * handling" requirement.
 */
export function getConsultAiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiErrorBody
    if (data.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message
    }
  }
  return CONSULT_AI_SOFT_UNAVAILABLE_MESSAGE
}
