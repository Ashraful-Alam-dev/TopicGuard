/**
 * Normalizes a topic title for duplicate-detection comparisons:
 * lowercase -> strip punctuation -> trim -> collapse internal whitespace.
 * Unicode-aware so accented/non-Latin titles normalize correctly.
 */
export function normalizeTitle(title: string): string {
  let normalized = title.toLowerCase();
  normalized = normalized.replace(/[^\p{L}\p{N}\s]/gu, '');
  normalized = normalized.trim();
  normalized = normalized.replace(/\s+/g, ' ');
  return normalized;
}
