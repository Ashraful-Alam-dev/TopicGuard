export interface EmbeddingProvider {
  readonly name: string;

  generateEmbedding(text: string): Promise<number[]>;

  /** Optional readiness check. */
  isReady?(): boolean;
}
