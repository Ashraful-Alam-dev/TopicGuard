export interface EmbeddingProvider {
  readonly name: string;

  generateEmbedding(text: string): Promise<number[]>;

  /**
   * Optional readiness check. Providers that need time to initialize
   * (e.g. loading a local model) can implement this so EmbeddingService
   * can fail fast instead of hanging while they're still starting up.
   * Providers that are always ready (e.g. a remote API) can omit it.
   */
  isReady?(): boolean;
}
