/**
 * In-memory sliding window rate limiter.
 *
 * Tracks request timestamps per key. Each check() call prunes timestamps
 * outside the window, then decides allow/reject based on count. A periodic
 * cleanup sweeps keys with no recent activity every 60s.
 *
 * A Redis-backed version (same RateLimiter interface) can replace this
 * for multi-process deployments.
 */

const CLEANUP_INTERVAL_MS = 60_000;

export interface RateLimitConfig {
  readonly windowMs: number;
  readonly maxRequests: number;
}

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly retryAfterMs: number;
}

export interface RateLimiter {
  check(key: string): RateLimitResult;
  reset(key: string): void;
}

export function createInMemoryRateLimiter(
  config: RateLimitConfig,
  now: () => number = Date.now,
): RateLimiter {
  const windows = new Map<string, number[]>();

  function pruneKey(key: string): number[] {
    const timestamps = windows.get(key);
    if (!timestamps) return [];

    // Timestamps are sorted (push-only). Drop expired entries from the front
    // without allocating a new array.
    const cutoff = now() - config.windowMs;
    while (timestamps.length > 0 && (timestamps[0] ?? Infinity) <= cutoff) {
      timestamps.shift();
    }

    if (timestamps.length === 0) {
      windows.delete(key);
    }
    return timestamps;
  }

  const cleanup = setInterval(() => {
    for (const key of windows.keys()) {
      pruneKey(key);
    }
  }, CLEANUP_INTERVAL_MS);
  cleanup.unref();

  return {
    check(key: string): RateLimitResult {
      const timestamps = pruneKey(key);

      const oldest = timestamps[0];
      if (timestamps.length >= config.maxRequests && oldest !== undefined) {
        const retryAfterMs = oldest + config.windowMs - now();
        return {
          allowed: false,
          remaining: 0,
          retryAfterMs: Math.max(retryAfterMs, 0),
        };
      }

      timestamps.push(now());
      if (!windows.has(key)) {
        windows.set(key, timestamps);
      }

      return {
        allowed: true,
        remaining: config.maxRequests - timestamps.length,
        retryAfterMs: 0,
      };
    },

    reset(key: string): void {
      windows.delete(key);
    },
  };
}
