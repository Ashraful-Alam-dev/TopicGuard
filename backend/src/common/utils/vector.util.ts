/**
 * Formats a numeric vector as a pgvector text literal, e.g. "[0.1,0.2,0.3]",
 * suitable for casting with `::vector` in a raw SQL query.
 */
export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}
