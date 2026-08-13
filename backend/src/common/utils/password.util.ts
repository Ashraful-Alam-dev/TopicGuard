import * as bcrypt from 'bcrypt';

export const BCRYPT_SALT_ROUNDS = 12;

/**
 * Hashes a plaintext secret (a password or an OTP) with bcrypt.
 * Shared so we never store a plaintext password or plaintext OTP anywhere.
 */
export async function hashSecret(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_SALT_ROUNDS);
}

export async function compareSecret(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
