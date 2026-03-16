/**
 * Tests for the dead man's switch state machine.
 *
 * Pure state transitions, no timers or I/O. The interval-based
 * heartbeat monitor is tested separately when wired.
 */

import { describe, it, expect, vi } from "vitest";
import {
  createDeadManSwitch,
  type DeadManSwitchConfig,
} from "./dead-man-switch.js";

function makeConfig(
  overrides?: Partial<DeadManSwitchConfig>,
): DeadManSwitchConfig {
  return {
    heartbeatIntervalMs: 15 * 60 * 1000,
    missThreshold: 3,
    onLockdown: vi.fn(),
    ...overrides,
  };
}

describe("DeadManSwitch", () => {
  it("starts in active state with missedCount 0", () => {
    const dms = createDeadManSwitch(makeConfig());

    expect(dms.state).toBe("active");
    expect(dms.missedCount).toBe(0);
  });

  it("stays active after heartbeat", () => {
    const dms = createDeadManSwitch(makeConfig());

    dms.heartbeat();

    expect(dms.state).toBe("active");
    expect(dms.missedCount).toBe(0);
  });

  it("transitions to warning after 1 miss", () => {
    const dms = createDeadManSwitch(makeConfig());

    dms.miss();

    expect(dms.state).toBe("warning");
    expect(dms.missedCount).toBe(1);
  });

  it("stays in warning after 2 misses", () => {
    const dms = createDeadManSwitch(makeConfig());

    dms.miss();
    dms.miss();

    expect(dms.state).toBe("warning");
    expect(dms.missedCount).toBe(2);
  });

  it("transitions to lockdown at miss threshold and calls onLockdown once", () => {
    const onLockdown = vi.fn();
    const dms = createDeadManSwitch(makeConfig({ onLockdown }));

    dms.miss();
    dms.miss();
    dms.miss();

    expect(dms.state).toBe("lockdown");
    expect(dms.missedCount).toBe(3);
    expect(onLockdown).toHaveBeenCalledOnce();
  });

  it("does not call onLockdown again on subsequent misses", () => {
    const onLockdown = vi.fn();
    const dms = createDeadManSwitch(makeConfig({ onLockdown }));

    dms.miss();
    dms.miss();
    dms.miss();
    dms.miss();

    expect(dms.state).toBe("lockdown");
    expect(dms.missedCount).toBe(3); // miss() is a no-op in lockdown
    expect(onLockdown).toHaveBeenCalledOnce();
  });

  it("heartbeat after miss resets to active (before lockdown)", () => {
    const dms = createDeadManSwitch(makeConfig());

    dms.miss();
    dms.miss();
    expect(dms.state).toBe("warning");

    dms.heartbeat();

    expect(dms.state).toBe("active");
    expect(dms.missedCount).toBe(0);
  });

  it("heartbeat after lockdown does not recover", () => {
    const dms = createDeadManSwitch(makeConfig());

    dms.miss();
    dms.miss();
    dms.miss();
    expect(dms.state).toBe("lockdown");

    dms.heartbeat();

    expect(dms.state).toBe("lockdown");
    expect(dms.missedCount).toBe(3);
  });

  it("calls onWarning with correct missedCount on each warning transition", () => {
    const onWarning = vi.fn();
    const dms = createDeadManSwitch(makeConfig({ onWarning }));

    dms.miss();
    expect(onWarning).toHaveBeenCalledWith(1);

    dms.miss();
    expect(onWarning).toHaveBeenCalledWith(2);

    expect(onWarning).toHaveBeenCalledTimes(2);

    // Third miss triggers lockdown, not warning
    dms.miss();
    expect(onWarning).toHaveBeenCalledTimes(2);
  });
});
