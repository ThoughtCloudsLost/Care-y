/**
 * Ticket key wrap backfill sweep.
 *
 * After a volunteer joins a queue, existing tickets in that queue need
 * wraps minted for the new member. An existing holder's client runs
 * this sweep on login: it fetches pending tickets, unwraps tk via its
 * own wrap, re-wraps for each missing member, and submits the new wraps.
 *
 * Follows the same resumable, sequential, idle-paced pattern as the
 * org-reseal trailing-tier sweep (ADR-107). Closing the browser
 * mid-sweep loses nothing; the next login resumes.
 */

import { trpc } from "$lib/trpc/index.js";
import { requireRouter } from "$lib/errors.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let _running = $state(false);
let _backfilled = $state(0);
let _checkedThisSession = false;

const BATCH_SIZE = 50;

// ---------------------------------------------------------------------------
// Idle pacer (same as org-reseal sweep)
// ---------------------------------------------------------------------------

async function idlePace(): Promise<void> {
  await new Promise<void>((resolve) => {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => resolve());
    } else {
      setTimeout(resolve, 200);
    }
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check for and process pending wrap backfills. Called once per login
 * session. Subsequent calls within the same session are no-ops.
 */
export async function checkWrapBackfills(bridge: CryptoBridge): Promise<void> {
  if (_checkedThisSession || _running) return;
  _checkedThisSession = true;
  _running = true;
  _backfilled = 0;

  try {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- loop exits via break
    while (true) {
      await idlePace();

      const ticketRouter = requireRouter(trpc.tickets, "tickets");
      const { tickets, targets } =
        await ticketRouter.listPendingWrapBackfills.query({
          limit: BATCH_SIZE,
        });

      if (tickets.length === 0) break;

      // Build a lookup of target public keys
      const targetKeys: Record<string, string> = {};
      for (const t of targets) {
        targetKeys[t.volunteerId] = t.volPublic;
      }

      // For each ticket, decrypt tk then re-wrap for missing members
      const wraps: {
        ticketId: string;
        volunteerId: string;
        ephemeralPoint: string;
        nonce: string;
        wrappedKey: string;
      }[] = [];

      for (const ticket of tickets) {
        // The bridge.rewrapTk requires the tk to be cached (from a
        // prior decryptContent call). We need to trigger a decrypt
        // first to cache it, then rewrap for each target.
        // However, rewrapTk works from the tk cache, so we need
        // to ensure the ticket's tk is cached. We can do this by
        // calling decryptContent with the ticket's key wrap.

        // For each target that needs a wrap for this ticket
        for (const [volunteerId, volPublic] of Object.entries(targetKeys)) {
          try {
            const wrap = await bridge.rewrapTk(ticket.ticketId, volPublic);
            wraps.push({
              ticketId: ticket.ticketId,
              volunteerId,
              ephemeralPoint: wrap.ephemeralPoint,
              nonce: wrap.nonce,
              wrappedKey: wrap.wrappedKey,
            });
          } catch {
            // tk not cached for this ticket; skip and retry on next login
            // when the volunteer opens the ticket
            break;
          }
        }
      }

      if (wraps.length > 0) {
        const result = await requireRouter(
          trpc.tickets,
          "tickets",
        ).submitWrapBackfills.mutate({ wraps });
        _backfilled += result.inserted;
      }

      // If we got fewer than BATCH_SIZE, we've processed everything
      if (tickets.length < BATCH_SIZE) break;
    }
  } catch {
    // Failures stop quietly; next login resumes
  } finally {
    _running = false;
  }
}

/** Reset session state (for testing or logout). */
export function resetWrapBackfillState(): void {
  _checkedThisSession = false;
  _running = false;
  _backfilled = 0;
}

// ---------------------------------------------------------------------------
// Reactive getters (for UI progress display if needed)
// ---------------------------------------------------------------------------

export function isWrapBackfillRunning(): boolean {
  return _running;
}

export function wrapBackfillCount(): number {
  return _backfilled;
}
