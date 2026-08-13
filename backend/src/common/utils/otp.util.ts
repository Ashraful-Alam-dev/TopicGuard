import { randomInt } from 'node:crypto';

const OTP_DIGITS = 6;
const OTP_MIN = 0;
const OTP_MAX = 1_000_000; // exclusive upper bound -> 000000-999999

/**
 * Generates a cryptographically secure numeric OTP, zero-padded to
 * OTP_DIGITS characters (e.g. "042917"). Uses crypto.randomInt rather
 * than Math.random so the code cannot be predicted from other output.
 */
export function generateOtp(): string {
  return randomInt(OTP_MIN, OTP_MAX).toString().padStart(OTP_DIGITS, '0');
}
