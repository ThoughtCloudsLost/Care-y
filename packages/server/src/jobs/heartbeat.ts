/**
 * Scheduler heartbeat.
 *
 * The job queue calls the returned callback at the end of every poll cycle
 * that completed without an error, every few seconds. The callback sends one
 * GET to the heartbeat URL at most once a minute, so the monitoring service
 * raises an alert when the pings stop, which is what happens when the
 * scheduler stops polling inside a server that still answers its health
 * check.
 *
 * Anyone holding the URL can mark the scheduler healthy, so no log line
 * includes it. A failed ping does not throw, because monitoring trouble must
 * not stop the scheduler. Failures reach the log at most once an hour and
 * name the error class or the HTTP status only.
 */

const HEARTBEAT_TIMEOUT_MS = 10_000;
const FAILURE_LOG_INTERVAL_MS = 60 * 60 * 1000;

/** Minimum time between two pings; calls inside the window send nothing. */
export const HEARTBEAT_MIN_INTERVAL_MS = 60_000;

/**
 * Returns the onPollComplete callback for createJobQueue.
 *
 * @param url Heartbeat URL from JOBS_HEARTBEAT_URL.
 * @param fetchImpl The global fetch in production; a mock in tests.
 * @param now Clock for the ping and log throttles.
 * @returns A callback that starts a ping when the previous one was at least
 *   a minute ago, and returns at once.
 */
export function createHeartbeatPing(
  url: string,
  fetchImpl: typeof fetch,
  now: () => number = Date.now,
): () => void {
  let lastPingAt: number | null = null;
  let lastFailureLoggedAt: number | null = null;

  function logFailure(reason: string): void {
    const at = now();
    if (
      lastFailureLoggedAt !== null &&
      at - lastFailureLoggedAt < FAILURE_LOG_INTERVAL_MS
    ) {
      return;
    }
    lastFailureLoggedAt = at;
    console.error(`Scheduler heartbeat ping failed: ${reason}`);
  }

  async function ping(): Promise<void> {
    try {
      const response = await fetchImpl(url, {
        method: "GET",
        signal: AbortSignal.timeout(HEARTBEAT_TIMEOUT_MS),
      });
      // The body is never read; cancelling it releases the connection.
      await response.body?.cancel();
      if (!response.ok) {
        logFailure(`HTTP ${String(response.status)}`);
      }
    } catch (err: unknown) {
      logFailure(err instanceof Error ? err.name : "unknown error");
    }
  }

  return (): void => {
    const at = now();
    if (lastPingAt !== null && at - lastPingAt < HEARTBEAT_MIN_INTERVAL_MS) {
      return;
    }
    lastPingAt = at;
    void ping();
  };
}
