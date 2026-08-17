/** Minutes an OTP (registration or password reset) stays valid for. */
export const OTP_EXPIRATION_MINUTES = 10;

/** Max incorrect OTP submissions before the code must be re-requested. */
export const MAX_OTP_ATTEMPTS = 5;

/** Minimum time between two OTP sends for the same email, to curb abuse. */
export const OTP_RESEND_COOLDOWN_MS = 60_000;

/** Distinguishes what a VerificationToken row is for. */
export const VerificationTokenType = {
  REGISTRATION: 'REGISTRATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
} as const;

export type VerificationTokenType =
  (typeof VerificationTokenType)[keyof typeof VerificationTokenType];
