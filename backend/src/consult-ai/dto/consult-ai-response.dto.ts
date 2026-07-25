/**
 * Shape returned to the frontend. Field names are camelCase to match the
 * rest of the API's conventions; `fromRaw` maps from the snake_case
 * structure we instruct the model to return (see the system prompt).
 */
export class ConsultAiResponseDto {
  score!: number;
  uniqueness!: string;
  relevance!: string;
  suggestions!: string[];
  recommendedTopics!: string[];

  /**
   * Never trust the model's JSON blindly, even in structured-output mode —
   * normalize types, clamp the score, and cap array lengths so a malformed
   * or slightly-off completion can't break the frontend card.
   */
  static fromRaw(raw: unknown): ConsultAiResponseDto {
    const source = (raw ?? {}) as Record<string, unknown>;

    const dto = new ConsultAiResponseDto();
    dto.score = ConsultAiResponseDto.clampScore(source.score);
    dto.uniqueness = ConsultAiResponseDto.toTrimmedString(source.uniqueness);
    dto.relevance = ConsultAiResponseDto.toTrimmedString(source.relevance);
    dto.suggestions = ConsultAiResponseDto.toStringArray(source.suggestions).slice(0, 3);
    dto.recommendedTopics = ConsultAiResponseDto.toStringArray(
      source.recommended_topics,
    ).slice(0, 3);

    return dto;
  }

  private static clampScore(value: unknown): number {
    const num = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(num)) {
      return 0;
    }
    return Math.min(10, Math.max(0, Math.round(num * 10) / 10));
  }

  private static toTrimmedString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private static toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
}
