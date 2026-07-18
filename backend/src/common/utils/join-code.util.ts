/**
 * Alphanumeric charset for classroom join codes.
 * Ambiguous characters (0, O, 1, I) are excluded to avoid transcription errors
 * when codes are read aloud or copied by hand.
 */
const JOIN_CODE_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const JOIN_CODE_LENGTH = 8;

/**
 * Generates a random 8-character join code containing at least one letter
 * and one number, as required by the product spec.
 */
export function generateJoinCode(): string {
  let code: string;

  do {
    code = Array.from({ length: JOIN_CODE_LENGTH }, () =>
      JOIN_CODE_CHARSET.charAt(
        Math.floor(Math.random() * JOIN_CODE_CHARSET.length),
      ),
    ).join('');
  } while (!hasLetterAndNumber(code));

  return code;
}

function hasLetterAndNumber(value: string): boolean {
  return /[A-Z]/.test(value) && /[0-9]/.test(value);
}
