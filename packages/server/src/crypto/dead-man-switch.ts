/**
 * Dead man's switch state machine.
 *
 * Monitors heartbeat signals from a remote OPRF server. When consecutive
 * missed heartbeats reach the threshold, the switch enters lockdown
 * (zeroes shares, alerts admins). Lockdown is irrecoverable via heartbeat
 * to prevent spoofed heartbeats from an attacker who captured the server.
 *
 * This module provides the state machine only. The HTTPS heartbeat
 * transport and interval-based monitor are wired separately.
 */

export type SwitchState = "active" | "warning" | "lockdown";

export interface DeadManSwitchConfig {
  /** Heartbeat interval in milliseconds (default: 15 minutes) */
  readonly heartbeatIntervalMs: number;
  /** Number of consecutive missed heartbeats before lockdown (default: 3) */
  readonly missThreshold: number;
  /** Callback invoked when entering lockdown (zero shares, alert admins) */
  readonly onLockdown: () => void;
  /** Callback invoked when entering warning state */
  readonly onWarning?: (missedCount: number) => void;
}

export const DEFAULT_DMS_CONFIG: Omit<DeadManSwitchConfig, "onLockdown"> = {
  heartbeatIntervalMs: 15 * 60 * 1000,
  missThreshold: 3,
};

export interface DeadManSwitch {
  /** Current state of the switch */
  readonly state: SwitchState;
  /** Number of consecutive missed heartbeats */
  readonly missedCount: number;
  /** Record a successful heartbeat (resets miss counter) */
  heartbeat(): void;
  /** Record a missed heartbeat (increments miss counter, may trigger lockdown) */
  miss(): void;
  /** Stop the switch (cleanup timers) */
  stop(): void;
}

export function createDeadManSwitch(
  config: DeadManSwitchConfig,
): DeadManSwitch {
  let state: SwitchState = "active";
  let missedCount = 0;
  let lockdownFired = false;

  return {
    get state(): SwitchState {
      return state;
    },

    get missedCount(): number {
      return missedCount;
    },

    heartbeat(): void {
      if (state === "lockdown") return;
      missedCount = 0;
      state = "active";
    },

    miss(): void {
      if (state === "lockdown") return;

      missedCount++;

      if (missedCount >= config.missThreshold) {
        state = "lockdown";
        if (!lockdownFired) {
          lockdownFired = true;
          config.onLockdown();
        }
      } else {
        state = "warning";
        config.onWarning?.(missedCount);
      }
    },

    stop(): void {
      // No timers to clean up in the passive version.
      // The interval-based monitor (added later) will need cleanup here.
    },
  };
}
