/**
 * Client-side mirror of backend/src/consult-ai/consult-ai.constants.ts.
 * The backend is the source of truth and re-enforces all of these — these
 * exist purely so the UI can gate the button and trim the payload without
 * a round trip.
 */

/** Button only activates once the title is longer than this. */
export const CONSULT_AI_MIN_TITLE_LENGTH = 20;

/** Client-side cooldown after a click, in seconds. */
export const CONSULT_AI_COOLDOWN_SECONDS = 30;

/** Token-optimization ceiling for the title we actually send. */
export const CONSULT_AI_TITLE_MAX_LENGTH = 150;

/**
 * Matches ConsultAiService's SOFT_UNAVAILABLE_MESSAGE. Used as a fallback
 * when a failure has no server message at all (network error, client-side
 * timeout) so the card's wording is identical either way.
 */
export const CONSULT_AI_SOFT_UNAVAILABLE_MESSAGE =
  "AI assistant is temporarily busy. Feel free to try again shortly or proceed with manual submission.";
