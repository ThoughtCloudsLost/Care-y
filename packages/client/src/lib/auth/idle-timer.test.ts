/**
 * Tests for IdleTimer.
 *
 * Uses an injectable clock (now() function) for deterministic time control.
 * Uses vi.useFakeTimers() to advance the setInterval check cycle.
 * Both are needed: the clock controls "what time it is" while fake timers
 * control "when the interval fires".
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { IdleTimer } from "./idle-timer.js";

// Mock document.addEventListener / removeEventListener since we're in Node
const addedListeners = new Map<string, Set<EventListener>>();
const removedListeners = new Map<string, Set<EventListener>>();

beforeEach(() => {
  addedListeners.clear();
  removedListeners.clear();

  vi.stubGlobal("document", {
    addEventListener: vi.fn(
      (type: string, handler: EventListener, _opts?: unknown) => {
        if (!addedListeners.has(type)) addedListeners.set(type, new Set());
        addedListeners.get(type)!.add(handler);
      },
    ),
    removeEventListener: vi.fn((type: string, handler: EventListener) => {
      if (!removedListeners.has(type)) removedListeners.set(type, new Set());
      removedListeners.get(type)!.add(handler);
    }),
  });

  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function createTimer(
  overrides: {
    timeoutMs?: number;
    warningMs?: number;
    startTime?: number;
  } = {},
): {
  timer: IdleTimer;
  onWarning: () => void;
  onTimeout: () => void;
  clock: { time: number; advance: (ms: number) => void };
} {
  const clock = {
    time: overrides.startTime ?? 1000,
    advance(ms: number): void {
      this.time += ms;
    },
  };

  const onWarning = vi.fn();
  const onTimeout = vi.fn();

  const timer = new IdleTimer({
    timeoutMs: overrides.timeoutMs ?? 15 * 60 * 1000,
    warningMs: overrides.warningMs ?? 5 * 60 * 1000,
    onWarning,
    onTimeout,
    now: () => clock.time,
  });

  return { timer, onWarning, onTimeout, clock };
}

/**
 * Advance both the injectable clock and the fake timer interval.
 * This simulates real passage of time: the clock moves forward,
 * then the interval fires and reads the new clock value.
 */
function advanceTime(
  clock: { time: number; advance: (ms: number) => void },
  ms: number,
): void {
  clock.advance(ms);
  // Fire any pending setInterval callbacks
  vi.advanceTimersByTime(ms);
}

describe("IdleTimer", () => {
  describe("start", () => {
    it("is idempotent (second call does not double-register)", () => {
      const { timer } = createTimer();
      timer.start();
      timer.start();

      // Each event type should have exactly one handler
      expect(addedListeners.get("mousemove")?.size).toBe(1);

      timer.stop();
    });
  });

  describe("activity resets the timer", () => {
    it("prevents timeout when activity occurs before threshold", () => {
      const { timer, onTimeout, clock } = createTimer({ timeoutMs: 60_000 });
      timer.start();

      // Advance to just before timeout
      advanceTime(clock, 55_000);
      expect(onTimeout).not.toHaveBeenCalled();

      // Simulate activity (reset the timer)
      timer.reset();

      // Advance another 55 seconds (would have timed out without reset)
      advanceTime(clock, 55_000);
      expect(onTimeout).not.toHaveBeenCalled();

      timer.stop();
    });
  });

  describe("warning callback", () => {
    it("fires at (timeout - warning) threshold", () => {
      const { timer, onWarning, clock } = createTimer({
        timeoutMs: 60_000,
        warningMs: 10_000,
      });
      timer.start();

      // Advance to warning threshold (60s - 10s = 50s)
      advanceTime(clock, 50_000);
      expect(onWarning).toHaveBeenCalledOnce();

      timer.stop();
    });

    it("fires only once per idle period", () => {
      const { timer, onWarning, clock } = createTimer({
        timeoutMs: 60_000,
        warningMs: 10_000,
      });
      timer.start();

      // Advance past warning threshold
      advanceTime(clock, 50_000);
      expect(onWarning).toHaveBeenCalledOnce();

      // Advance more (still idle, within timeout)
      advanceTime(clock, 5_000);
      expect(onWarning).toHaveBeenCalledOnce(); // Still once

      timer.stop();
    });

    it("resets after activity (fires again on next idle period)", () => {
      const { timer, onWarning, clock } = createTimer({
        timeoutMs: 60_000,
        warningMs: 10_000,
      });
      timer.start();

      // Trigger warning
      advanceTime(clock, 50_000);
      expect(onWarning).toHaveBeenCalledOnce();

      // Activity resets
      timer.reset();

      // Advance to warning again
      advanceTime(clock, 50_000);
      expect(onWarning).toHaveBeenCalledTimes(2);

      timer.stop();
    });
  });

  describe("timeout callback", () => {
    it("fires at timeout threshold", () => {
      const { timer, onTimeout, clock } = createTimer({ timeoutMs: 60_000 });
      timer.start();

      advanceTime(clock, 60_000);
      expect(onTimeout).toHaveBeenCalledOnce();
    });

    it("stops the timer after firing (no repeated calls)", () => {
      const { timer, onTimeout, clock } = createTimer({ timeoutMs: 60_000 });
      timer.start();

      advanceTime(clock, 60_000);
      expect(onTimeout).toHaveBeenCalledOnce();
      expect(timer.isRunning).toBe(false);

      // Further advances should not fire again
      advanceTime(clock, 60_000);
      expect(onTimeout).toHaveBeenCalledOnce();
    });
  });

  describe("DOM event wiring", () => {
    it("resets the timer when a registered DOM event fires", () => {
      const { timer, onTimeout, clock } = createTimer({ timeoutMs: 60_000 });
      timer.start();

      // Advance to 55s (just under timeout)
      advanceTime(clock, 55_000);
      expect(onTimeout).not.toHaveBeenCalled();

      // Fire a synthetic mousemove through the mock document's listener map.
      // This exercises the full path: DOM event → boundReset → lastActivity update.
      const handlers = addedListeners.get("mousemove");
      expect(handlers).toBeDefined();
      expect(handlers!.size).toBe(1);
      for (const handler of handlers!) {
        handler(new Event("mousemove"));
      }

      // 30s after reset: should NOT have timed out (reset pushed deadline forward)
      advanceTime(clock, 30_000);
      expect(onTimeout).not.toHaveBeenCalled();

      timer.stop();
    });
  });

  describe("stop", () => {
    it("prevents further callbacks", () => {
      const { timer, onTimeout, onWarning, clock } = createTimer({
        timeoutMs: 60_000,
        warningMs: 10_000,
      });
      timer.start();
      timer.stop();

      advanceTime(clock, 120_000);
      expect(onWarning).not.toHaveBeenCalled();
      expect(onTimeout).not.toHaveBeenCalled();
    });

    it("is idempotent (no error when called twice)", () => {
      const { timer } = createTimer();
      timer.start();
      timer.stop();
      expect(() => {
        timer.stop();
      }).not.toThrow();
    });
  });

  describe("remainingMs", () => {
    it("reflects full timeout initially", () => {
      const { timer } = createTimer({ timeoutMs: 60_000 });
      timer.start();
      expect(timer.remainingMs).toBe(60_000);
      timer.stop();
    });

    it("decreases as time passes", () => {
      const { timer, clock } = createTimer({ timeoutMs: 60_000 });
      timer.start();

      clock.advance(20_000);
      expect(timer.remainingMs).toBe(40_000);

      timer.stop();
    });

    it("returns 0 after timeout", () => {
      const { timer, clock } = createTimer({ timeoutMs: 60_000 });
      timer.start();

      clock.advance(120_000);
      expect(timer.remainingMs).toBe(0);

      timer.stop();
    });

    it("resets after activity", () => {
      const { timer, clock } = createTimer({ timeoutMs: 60_000 });
      timer.start();

      clock.advance(40_000);
      expect(timer.remainingMs).toBe(20_000);

      timer.reset();
      expect(timer.remainingMs).toBe(60_000);

      timer.stop();
    });
  });

  describe("isRunning", () => {
    it("returns false before start", () => {
      const { timer } = createTimer();
      expect(timer.isRunning).toBe(false);
    });

    it("returns true after start", () => {
      const { timer } = createTimer();
      timer.start();
      expect(timer.isRunning).toBe(true);
      timer.stop();
    });

    it("returns false after stop", () => {
      const { timer } = createTimer();
      timer.start();
      timer.stop();
      expect(timer.isRunning).toBe(false);
    });

    it("returns false after timeout fires", () => {
      const { timer, clock } = createTimer({ timeoutMs: 60_000 });
      timer.start();
      advanceTime(clock, 60_000);
      expect(timer.isRunning).toBe(false);
    });
  });
});
