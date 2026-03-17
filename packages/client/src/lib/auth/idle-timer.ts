/**
 * Idle timer for session key zeroing.
 *
 * Tracks human input events (mouse, touch, keyboard) and fires callbacks
 * when the user has been inactive for too long. Used to zero key material
 * in the crypto Worker and org-key module after a configurable period.
 *
 * API calls, SSE events, and TanStack Query refetches do NOT count as
 * activity (per code-standards.md Session Timeout section). Only human
 * input events reset the timer.
 *
 * The timer uses an injectable now() function for deterministic testing
 * (testing-reference.md Section 5, Option A).
 *
 * The check interval (30s) balances responsiveness with CPU efficiency.
 * On mobile devices, shorter intervals waste battery.
 */

export interface IdleTimerConfig {
  /** Total idle time before timeout fires (default: 15 minutes). */
  timeoutMs: number;
  /** Time before timeout at which warning fires (default: 5 minutes). */
  warningMs: number;
  /** Called once when the warning threshold is reached. */
  onWarning: () => void;
  /** Called when the timeout threshold is reached. */
  onTimeout: () => void;
  /** Injectable clock for testing. Defaults to Date.now. */
  now?: () => number;
}

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "touchstart",
  "keydown",
] as const;

const CHECK_INTERVAL_MS = 30_000;

export class IdleTimer {
  private lastActivity: number;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private warningFired = false;
  private readonly config: Required<IdleTimerConfig>;
  private readonly boundReset: () => void;

  constructor(config: IdleTimerConfig) {
    this.config = {
      ...config,
      now: config.now ?? Date.now,
    };
    this.lastActivity = this.config.now();
    this.boundReset = this.reset.bind(this);
  }

  /** Start tracking activity. Registers event listeners and begins polling. */
  start(): void {
    if (this.intervalId !== null) return; // Already running

    this.lastActivity = this.config.now();
    this.warningFired = false;

    for (const event of ACTIVITY_EVENTS) {
      document.addEventListener(event, this.boundReset, { passive: true });
    }

    this.intervalId = setInterval(() => {
      this.check();
    }, CHECK_INTERVAL_MS);
  }

  /** Stop tracking. Removes event listeners and clears the interval. */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    for (const event of ACTIVITY_EVENTS) {
      document.removeEventListener(event, this.boundReset);
    }
  }

  /** Reset activity timestamp. Called by event listeners on human input. */
  reset(): void {
    this.lastActivity = this.config.now();
    this.warningFired = false;
  }

  /** Milliseconds remaining until timeout. 0 if already timed out. */
  get remainingMs(): number {
    const elapsed = this.config.now() - this.lastActivity;
    return Math.max(0, this.config.timeoutMs - elapsed);
  }

  /** Whether the timer is currently running (started and not stopped). */
  get isRunning(): boolean {
    return this.intervalId !== null;
  }

  // ── Private ─────────────────────────────────────────────────────────

  private check(): void {
    const elapsed = this.config.now() - this.lastActivity;

    if (elapsed >= this.config.timeoutMs) {
      // Stop FIRST to prevent re-entrant calls from the callback
      this.stop();
      this.config.onTimeout();
      return;
    }

    const warningThreshold = this.config.timeoutMs - this.config.warningMs;
    if (elapsed >= warningThreshold && !this.warningFired) {
      this.warningFired = true;
      this.config.onWarning();
    }
  }
}
