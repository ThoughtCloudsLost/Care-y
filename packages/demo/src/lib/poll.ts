/**
 * Shared polling utility for async condition waits.
 *
 * The demo's phone-driving logic waits for DOM elements, login stages,
 * and selectors that appear asynchronously. This module replaces four
 * hand-rolled 100ms setInterval loops with one parameterized helper.
 */

// -----------------------------------------------------------------------
// Timing constants (named so call sites read as prose)
// -----------------------------------------------------------------------

/** Default interval between probes (ms). */
export const POLL_INTERVAL_MS = 100;

/** Short timeout for waits expected to resolve within one beat. */
export const POLL_TIMEOUT_SHORT_MS = 1500;

/** Medium timeout for selector and stage waits. */
export const POLL_TIMEOUT_MEDIUM_MS = 4000;

/** Standard timeout for most element-appearance waits. */
export const POLL_TIMEOUT_STANDARD_MS = 5000;

// -----------------------------------------------------------------------
// pollUntil
// -----------------------------------------------------------------------

export interface PollOptions<T> {
  /** Probe function called each tick. A non-null return resolves the poll. */
  readonly probe: () => T | null;
  /**
   * Staleness check called each tick. When it returns true the poll
   * resolves with null immediately (a superseding intent or feature
   * change makes the result irrelevant).
   */
  readonly isStale?: () => boolean;
  /** Maximum wait time in ms. Defaults to POLL_TIMEOUT_STANDARD_MS. */
  readonly timeoutMs?: number;
  /** Interval between probes in ms. Defaults to POLL_INTERVAL_MS. */
  readonly pollMs?: number;
}

/**
 * Poll until `probe` returns a non-null value, or give up on timeout /
 * staleness. Returns null on timeout or stale cancellation.
 *
 * The probe is called once immediately before the first interval tick,
 * so an already-met condition resolves synchronously (within the same
 * microtask for the promise, no timer needed).
 */
export async function pollUntil<T>(opts: PollOptions<T>): Promise<T | null> {
  const {
    probe,
    isStale,
    timeoutMs = POLL_TIMEOUT_STANDARD_MS,
    pollMs = POLL_INTERVAL_MS,
  } = opts;

  return new Promise<T | null>((resolve) => {
    // Check staleness before the immediate probe so a poll started
    // after its token was superseded never resolves with a stale value.
    if (isStale?.() === true) {
      resolve(null);
      return;
    }

    // Immediate check
    const immediate = probe();
    if (immediate !== null) {
      resolve(immediate);
      return;
    }

    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += pollMs;

      if (isStale?.() === true) {
        clearInterval(timer);
        resolve(null);
        return;
      }

      const found = probe();
      if (found !== null) {
        clearInterval(timer);
        resolve(found);
        return;
      }

      if (elapsed >= timeoutMs) {
        clearInterval(timer);
        resolve(null);
      }
    }, pollMs);
  });
}
