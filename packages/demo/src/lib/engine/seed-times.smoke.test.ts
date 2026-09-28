import { describe, it, expect, beforeAll } from "vitest";
import { cursorSlot, decode } from "@care-y/crypto";
import type { TicketId } from "@care-y/shared";
import { SEED_HANDBOOK_TICKET } from "@care-y/shared/dev/seed-handbook-ticket.js";
import type { SeedSnapshotManifest } from "@care-y/shared/dev/seed-snapshot.js";

import { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import { toArrayBuffer } from "$lib/base64.js";
import { requireRouter } from "$lib/errors.js";
// Type-only, through a relative path: the $lib/trpc alias points at the
// demo's stub, and only the real client's type is wanted here.
import type { trpc as RealTrpcClient } from "../../../../client/src/lib/trpc/index.js";

import type { DemoEngineResult } from "./engine.js";
import { bootDemoEngine } from "./engine.js";
import {
  DEMO_ADMIN_IDENTIFIER,
  DEMO_ADMIN_PASSWORD,
} from "./server/seed-structure.js";
import { withInProcessCryptoWorker } from "./snapshot/in-process-crypto-worker.js";
import {
  SMOKE_SNAPSHOT_TIMEOUT_MS,
  loadSmokeSnapshot,
  smokeSnapshotSource,
} from "./test-utils.js";

/**
 * Smoke tests for the boot's time shift. The engine boots with its shift
 * target five days past the real clock, so shifted and unshifted times
 * are days apart and cannot be mistaken for each other.
 *
 * The plaintext half reads the story ticket's rows straight from the
 * database. The ciphertext half keys a real CryptoBridge as the demo
 * admin (over the in-process worker the snapshot builder uses), reads the
 * story ticket's read state the way the tickets list does, and counts
 * unread replies before and after the read cursor reseal.
 */

type AppTrpc = typeof RealTrpcClient;

const MINUTE_MS = 60_000;
const SHIFT_AHEAD_MS = 5 * 24 * 60 * MINUTE_MS;
/**
 * How far before the build time the seed's relative times may have been
 * taken. The replay writes each one against the clock while it runs, and
 * a build takes seconds to a few minutes.
 */
const BUILD_SLACK_MS = 15 * MINUTE_MS;

/** A timestamp as the caller adapter hands it over (Date or ISO text). */
function toMs(value: unknown): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") return Date.parse(value);
  return expect.fail(`Not a timestamp: ${String(value)}`);
}

/**
 * Key the bridge as loginCrypto does: salt, Argon2id, OPRF blind,
 * evaluate, derive.
 */
async function keyAsAdmin(app: AppTrpc, bridge: CryptoBridge): Promise<void> {
  const { salt, userId } = await app.auth.getSalt.query({
    identifier: DEMO_ADMIN_IDENTIFIER,
  });
  await bridge.argon2id(
    toArrayBuffer(new TextEncoder().encode(DEMO_ADMIN_PASSWORD)),
    toArrayBuffer(decode(salt)),
  );
  const { blindedElement } = await bridge.oprfBlind();
  const { evaluated } = await app.oprf.evaluate.mutate({
    kind: "volunteer",
    userId,
    blindedElement,
  });
  await bridge.deriveKeys(toArrayBuffer(decode(evaluated)));
}

describe("seed time shift", () => {
  let engine: DemoEngineResult;
  let manifest: SeedSnapshotManifest;
  let shiftTo: number;
  let storyTicketId: TicketId;

  beforeAll(async () => {
    const contents = await loadSmokeSnapshot();
    manifest = contents.manifest;
    shiftTo = Date.now() + SHIFT_AHEAD_MS;
    engine = await bootDemoEngine({
      snapshot: smokeSnapshotSource(contents),
      shiftTo,
    });
    const first = engine.ticketIds[0];
    if (first === undefined) expect.fail("The snapshot has no tickets");
    storyTicketId = first as TicketId;
  }, SMOKE_SNAPSHOT_TIMEOUT_MS);

  it("shifts by the gap between the build time and the target", () => {
    expect(engine.timeShiftMs).toBe(shiftTo - manifest.buildNow);
  });

  it("moves the story ticket's plaintext times up to the target", async () => {
    const ticket = await engine.tDb
      .selectFrom("tickets")
      .select("created_at")
      .where("id", "=", storyTicketId)
      .executeTakeFirstOrThrow();
    const createdAt = toMs(ticket.created_at);
    const expectedCreated =
      shiftTo - SEED_HANDBOOK_TICKET.createdAgo * MINUTE_MS;
    expect(createdAt).toBeLessThanOrEqual(expectedCreated);
    expect(createdAt).toBeGreaterThan(expectedCreated - BUILD_SLACK_MS);

    const rows = await engine.tDb
      .selectFrom("followups")
      .select("created_at")
      .where("ticket_id", "=", storyTicketId)
      .execute();
    const latest = Math.max(...rows.map((r) => toMs(r.created_at)));
    expect(latest).toBeLessThanOrEqual(shiftTo);
    expect(latest).toBeGreaterThan(shiftTo - BUILD_SLACK_MS);
  }, 30_000);

  it(
    "reseals the read cursor so only the replies after unreadSince are unread",
    async () => {
      expect(engine.readCursorTicketIds).toContain(storyTicketId);
      const app = engine.trpc as unknown as AppTrpc;
      const tickets = requireRouter(app.tickets, "tickets");
      const adminId = engine.seedResult.adminUserId;

      await withInProcessCryptoWorker(async () => {
        const bridge = new CryptoBridge("dedicated");
        try {
          await keyAsAdmin(app, bridge);

          const ticket = await tickets.get.query({ ticketId: storyTicketId });
          const keyWrap = ticket.keyWrap;
          if (keyWrap === null) expect.fail("The admin holds no key wrap");

          /** The cursor's readUpTo and the listed replies, as the list reads them. */
          const readState = async (): Promise<{
            readUpTo: number;
            replies: number[];
          }> => {
            const window = await tickets.listReadState.query({
              ticketIds: [storyTicketId],
            });
            const entry = Object.entries(window).find(
              ([id]) => id === storyTicketId,
            )?.[1];
            if (entry?.encryptedReadCursor == null) {
              return expect.fail("The story ticket has no read cursor");
            }
            const plaintext = await bridge.decrypt(
              storyTicketId,
              cursorSlot(adminId),
              storyTicketId,
              keyWrap.ephemeralPoint,
              keyWrap.nonce,
              keyWrap.wrappedKey,
              entry.encryptedReadCursor,
            );
            const parsed: unknown = JSON.parse(plaintext);
            const readUpTo =
              parsed !== null &&
              typeof parsed === "object" &&
              "readUpTo" in parsed
                ? toMs(parsed.readUpTo)
                : Number.NaN;
            return {
              readUpTo,
              replies: entry.followUpCreatedAt.map((t: unknown) => toMs(t)),
            };
          };

          const unreadSinceMs =
            shiftTo - SEED_HANDBOOK_TICKET.unreadSince * MINUTE_MS;

          // Before the reseal the cursor still holds a build-time instant,
          // days before every shifted reply, so all of them read as unread.
          const before = await readState();
          expect(before.replies.length).toBeGreaterThan(0);
          expect(before.readUpTo).toBeLessThan(
            unreadSinceMs - SHIFT_AHEAD_MS / 2,
          );
          expect(
            before.replies.filter((t) => t > before.readUpTo),
          ).toHaveLength(before.replies.length);

          await engine.resealSeedTimes(bridge);

          // After it the cursor sits at unreadSince (less the build's own
          // run time), and only the replies after that are unread.
          const after = await readState();
          expect(after.readUpTo).toBeLessThanOrEqual(unreadSinceMs);
          expect(after.readUpTo).toBeGreaterThan(
            unreadSinceMs - BUILD_SLACK_MS,
          );
          const unread = after.replies.filter((t) => t > after.readUpTo);
          expect(unread).toEqual(
            after.replies.filter((t) => t > unreadSinceMs),
          );
          expect(unread.length).toBeGreaterThan(0);
          expect(unread.length).toBeLessThan(after.replies.length);

          // The story's own replies after unreadSince, from others, are
          // among them.
          const storyReplies = SEED_HANDBOOK_TICKET.followUps.filter(
            (fu) =>
              fu.mergedIn !== true &&
              fu.source !== "system" &&
              !(fu.source === "volunteer" && fu.author !== "other") &&
              fu.agoMinutes < SEED_HANDBOOK_TICKET.unreadSince,
          );
          expect(unread.length).toBeGreaterThanOrEqual(storyReplies.length);

          // A second call shares the first run and moves nothing again.
          await engine.resealSeedTimes(bridge);
          expect((await readState()).readUpTo).toBe(after.readUpTo);
        } finally {
          await bridge.zeroAll();
          bridge.destroy();
        }
      });
    },
    SMOKE_SNAPSHOT_TIMEOUT_MS,
  );
});
