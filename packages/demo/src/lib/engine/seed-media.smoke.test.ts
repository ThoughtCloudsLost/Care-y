import { describe, it, expect, beforeAll } from "vitest";
import type { DemoEngineResult } from "./engine.js";
import { bootDemoEngine } from "./engine.js";
import type { TicketId } from "@care-y/shared";
import { SEED_VOICEMAIL_DURATION_S } from "@care-y/shared/dev/seed-stories.js";
import {
  SMOKE_SNAPSHOT_TIMEOUT_MS,
  loadSmokeSnapshot,
  smokeSnapshotSource,
} from "./test-utils.js";

/**
 * Smoke tests for the media the seed snapshot carries on the handbook
 * story ticket: the voicemail the replay stores through the recording
 * webhook's path, the photo and checklist it uploads the way the composer
 * does, and the blobs behind them in the restored blob store.
 */

describe("seed snapshot media on the story ticket", () => {
  let engine: DemoEngineResult;
  let storyTicketId: TicketId;

  beforeAll(async () => {
    const contents = await loadSmokeSnapshot();
    engine = await bootDemoEngine({
      snapshot: smokeSnapshotSource(contents),
    });
    const first = engine.ticketIds[0];
    if (first === undefined) expect.fail("The snapshot has no tickets");
    storyTicketId = first as TicketId;
  }, SMOKE_SNAPSHOT_TIMEOUT_MS);

  it("stores the voicemail recording with the seed clip's duration", async () => {
    const recordings = await engine.tDb
      .selectFrom("recordings")
      .select(["duration_seconds", "blob_key"])
      .where("ticket_id", "=", storyTicketId)
      .execute();

    expect(recordings.length).toBeGreaterThan(0);
    expect(
      recordings.some((r) => r.duration_seconds === SEED_VOICEMAIL_DURATION_S),
    ).toBe(true);
  }, 30_000);

  it("restores every recording and attachment blob", async () => {
    const recordings = await engine.tDb
      .selectFrom("recordings")
      .select("blob_key")
      .where("ticket_id", "=", storyTicketId)
      .execute();
    const attachments = await engine.tDb
      .selectFrom("attachments")
      .select("blob_key")
      .where("ticket_id", "=", storyTicketId)
      .execute();

    expect(attachments.length).toBeGreaterThan(0);
    for (const row of [...recordings, ...attachments]) {
      const blob = await engine.blobStore.get(row.blob_key);
      expect(blob).not.toBeNull();
      expect(blob?.byteLength ?? 0).toBeGreaterThan(0);
    }
  }, 30_000);

  it("resolves an attachment through the blob resolver", async () => {
    const attachment = await engine.tDb
      .selectFrom("attachments")
      .select("id")
      .where("ticket_id", "=", storyTicketId)
      .executeTakeFirstOrThrow();

    const bytes = await engine.resolveBlob.resolveBlob(
      "attachments",
      attachment.id,
    );
    expect(bytes).not.toBeNull();
    expect(bytes?.byteLength ?? 0).toBeGreaterThan(0);
  }, 30_000);

  it("records the missed and the completed call", async () => {
    const phoneCalls = await engine.tDb
      .selectFrom("followups")
      .select(["call_status", "call_duration_seconds"])
      .where("ticket_id", "=", storyTicketId)
      .where("type", "=", "phone_call")
      .orderBy("created_at", "asc")
      .execute();

    expect(phoneCalls).toHaveLength(2);
    expect(phoneCalls[0]?.call_status).toBe("no_answer");
    expect(phoneCalls[1]?.call_status).toBe("completed");
    expect(phoneCalls[1]?.call_duration_seconds).toBe(340);
  }, 30_000);

  it("wraps each uploaded attachment's file key, as the composer does", async () => {
    const attachments = await engine.tDb
      .selectFrom("attachments")
      .select("file_key_wrap")
      .where("ticket_id", "=", storyTicketId)
      .execute();

    expect(attachments.length).toBeGreaterThan(0);
    for (const att of attachments) {
      expect(att.file_key_wrap).not.toBeNull();
    }
  }, 30_000);

  it("seals the story ticket's attachments to its portal channel", async () => {
    const portalAttachments = await engine.tDb
      .selectFrom("portal_attachments as pa")
      .innerJoin("attachments as a", "a.id", "pa.attachment_id")
      .select("pa.attachment_id")
      .where("a.ticket_id", "=", storyTicketId)
      .execute();
    expect(portalAttachments.length).toBeGreaterThan(0);
  }, 30_000);

  it("carries the story ticket's system events", async () => {
    const systemEvents = await engine.tDb
      .selectFrom("followups")
      .select("type")
      .where("ticket_id", "=", storyTicketId)
      .where("source", "=", "system")
      .execute();

    const types = systemEvents.map((e) => e.type);
    expect(types).toContain("hold_placed");
    expect(types).toContain("hold_removed");
    expect(types).toContain("volunteer_unassigned");
  }, 30_000);
});
