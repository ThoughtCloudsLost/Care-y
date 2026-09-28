/**
 * Moves the time stored inside each seeded read cursor by the boot's time
 * shift. The cursor holds `{"readUpTo": <ISO time>}` encrypted under the
 * ticket key, so the SQL shift in seed-time-shift.ts cannot reach it, and
 * an unshifted cursor would mark the wrong replies as unread.
 *
 * Each cursor goes through the same calls the ticket detail view makes
 * (create-read-cursor.svelte.ts). The ticket's key wrap comes from
 * tickets.get and the cursor from tickets.getReadCursor. The crypto
 * worker opens it under the account's cursor slot, and the shifted
 * payload is encrypted with the ticket key that open cached and written
 * with tickets.updateReadCursor.
 *
 * Every other payload the seed encrypts (titles, descriptions, follow-up
 * and email content, attachment names and bytes, org-sealed names and
 * articles, portal messages and share text) holds no absolute time.
 */

import { cursorSlot } from "@care-y/crypto";

import { SeedTimeResealError } from "../errors.js";

import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
// Type-only, through a relative path: the $lib/trpc alias points at the
// demo's stub, and only the real client's type is wanted here.
import type { trpc as RealTrpcClient } from "../../../../../client/src/lib/trpc/index.js";

type TicketsClient = NonNullable<(typeof RealTrpcClient)["tickets"]>;

export interface ReadCursorResealDeps {
  readonly tickets: Pick<
    TicketsClient,
    "get" | "getReadCursor" | "updateReadCursor"
  >;
  /** A keyed bridge, unpaced: the reseal runs before queued decrypts are released. */
  readonly bridge: Pick<CryptoBridge, "decrypt" | "encrypt">;
  /** The signed-in account. The cursor row and its slot are per account. */
  readonly userId: string;
  readonly ticketIds: readonly string[];
  readonly deltaMs: number;
}

/** The cursor's stored time, parsed as the product parses it. */
function readUpToOf(plaintext: string, ticketId: string): number {
  let parsed: unknown;
  try {
    parsed = JSON.parse(plaintext);
  } catch (err: unknown) {
    throw new SeedTimeResealError(
      `The read cursor on ${ticketId} is not JSON`,
      { cause: err },
    );
  }
  const readUpTo =
    parsed !== null && typeof parsed === "object" && "readUpTo" in parsed
      ? parsed.readUpTo
      : undefined;
  const ms = typeof readUpTo === "string" ? Date.parse(readUpTo) : Number.NaN;
  if (Number.isNaN(ms)) {
    throw new SeedTimeResealError(
      `The read cursor on ${ticketId} holds no readUpTo time`,
    );
  }
  return ms;
}

async function resealOne(
  deps: ReadCursorResealDeps,
  ticketId: string,
): Promise<void> {
  const { tickets, bridge, userId, deltaMs } = deps;
  const ticket = await tickets.get.query({ ticketId });
  const keyWrap = ticket.keyWrap;
  if (keyWrap === null) {
    throw new SeedTimeResealError(
      `The signed-in account holds no key wrap on ${ticketId}`,
    );
  }
  const cursor = await tickets.getReadCursor.query({ ticketId });

  let plaintext: string;
  try {
    plaintext = await bridge.decrypt(
      ticketId,
      cursorSlot(userId),
      ticketId,
      keyWrap.ephemeralPoint,
      keyWrap.nonce,
      keyWrap.wrappedKey,
      cursor.encryptedReadCursor,
    );
  } catch (err: unknown) {
    throw new SeedTimeResealError(
      `The read cursor on ${ticketId} does not open`,
      { cause: err },
    );
  }

  const shifted = new Date(readUpToOf(plaintext, ticketId) + deltaMs);
  const encryptedReadCursor = await bridge.encrypt(
    ticketId,
    cursorSlot(userId),
    JSON.stringify({ readUpTo: shifted.toISOString() }),
  );
  await tickets.updateReadCursor.mutate({ ticketId, encryptedReadCursor });
}

/**
 * Reseal every listed read cursor with its time moved by `deltaMs`.
 * Throws {@link SeedTimeResealError} when any cursor cannot be opened,
 * parsed or written; the underlying failure is its cause.
 */
export async function resealReadCursors(
  deps: ReadCursorResealDeps,
): Promise<void> {
  try {
    await Promise.all(
      deps.ticketIds.map(async (ticketId) => resealOne(deps, ticketId)),
    );
  } catch (err: unknown) {
    if (err instanceof SeedTimeResealError) throw err;
    const reason = err instanceof Error ? err.message : String(err);
    throw new SeedTimeResealError(
      `Resealing the seeded read cursors failed: ${reason}`,
      { cause: err },
    );
  }
}
