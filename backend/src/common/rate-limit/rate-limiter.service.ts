import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

export interface RateLimitRule {
  /** Max requests allowed inside `windowMs`. */
  limit: number;
  /** Sliding window size, in milliseconds. */
  windowMs: number;
  /** Optional hard cap on requests inside a rolling 24h period. */
  dailyLimit?: number;
  /** Message returned when `limit`/`windowMs` is exceeded. */
  message?: string;
  /** Message returned when `dailyLimit` is exceeded. */
  dailyMessage?: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Once a key's history exceeds this many entries, we prune stale ones on next access. */
const MAP_PRUNE_THRESHOLD = 1000;

@Injectable()
export class RateLimiterService {
  private readonly hitsByKey = new Map<string, number[]>();

  consume(key: string, rule: RateLimitRule): void {
    const now = Date.now();
    const dayCutoff = now - DAY_MS;

    const history = (this.hitsByKey.get(key) ?? []).filter(
      (t) => t > dayCutoff,
    );

    if (rule.dailyLimit && history.length >= rule.dailyLimit) {
      this.hitsByKey.set(key, history);
      const retryAfterMs = history[0] + DAY_MS - now;
      throw this.tooManyRequests(
        rule.dailyMessage ??
          'Daily limit reached. Please try again tomorrow.',
        retryAfterMs,
      );
    }

    const windowCutoff = now - rule.windowMs;
    const withinWindow = history.filter((t) => t > windowCutoff);

    if (withinWindow.length >= rule.limit) {
      this.hitsByKey.set(key, history);
      const retryAfterMs = withinWindow[0] + rule.windowMs - now;
      throw this.tooManyRequests(
        rule.message ?? 'Too many requests. Please slow down.',
        retryAfterMs,
      );
    }

    history.push(now);
    this.hitsByKey.set(key, history);

    if (this.hitsByKey.size > MAP_PRUNE_THRESHOLD) {
      this.prune(dayCutoff);
    }
  }

  private tooManyRequests(message: string, retryAfterMs: number): HttpException {
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
    return new HttpException(
      `${message} (try again in ${this.formatDuration(retryAfterSeconds)})`,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  private formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.ceil(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.ceil(minutes / 60);
    return `${hours}h`;
  }

  private prune(dayCutoff: number): void {
    for (const [key, timestamps] of this.hitsByKey.entries()) {
      if (timestamps.every((t) => t <= dayCutoff)) {
        this.hitsByKey.delete(key);
      }
    }
  }
}
