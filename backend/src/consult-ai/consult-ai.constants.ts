/**
 * Token-optimization limits (see FEATURE REQUIREMENT #2). These are the
 * ceilings actually sent to the model — enforced here on the backend as
 * the source of truth, independent of whatever the client already trims.
 */
export const CLASSROOM_NAME_MAX_LENGTH = 100;
export const SUBMISSION_DETAILS_MAX_LENGTH = 300;
export const TOPIC_TITLE_MAX_LENGTH = 150;

/**
 * Server-side backstop for the client's 30s cooldown button. A scripted
 * or modified client could otherwise call this endpoint at full speed;
 * this keeps a slightly tighter per-user floor so legitimate double
 * requests from the real button are never falsely rejected.
 */
export const CONSULT_AI_COOLDOWN_MS = 30_000;

/** Upper bound on how long we wait on Groq before treating it as unavailable. */
export const CONSULT_AI_REQUEST_TIMEOUT_MS = 15_000;

/** Default Groq model used when GROQ_MODEL is not set. */
export const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';

/** Default Groq (OpenAI-compatible) base URL used when GROQ_BASE_URL is not set. */
export const DEFAULT_GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
