import { describe, it, expect, beforeAll } from "vitest";
import type { DemoEngineResult } from "./engine.js";
import { bootDemoEngine } from "./engine.js";
import type { SeedMediaAssets } from "../../../../server/src/dev/seed-tickets.js";

/**
 * Smoke tests for the SeedMediaAssets plumbing: verifies that provided
 * assets flow into recording/attachment rows, and that omitting assets
 * falls back to generated placeholders.
 */

describe("seedTestTickets media assets", () => {
  // ── With assets ──────────────────────────────────────────────────

  describe("provided assets", () => {
    let engine: DemoEngineResult;

    const VOICEMAIL_BYTES = new Uint8Array([0xca, 0xfe, 0x01, 0x02]);
    const VOICEMAIL_DURATION = 42;
    const IMAGE_BYTES_A = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    const IMAGE_BYTES_B = new Uint8Array([0xff, 0xd8, 0xff, 0xe1]);

    const testAssets: SeedMediaAssets = {
      voicemailAudio: {
        bytes: VOICEMAIL_BYTES,
        durationSeconds: VOICEMAIL_DURATION,
      },
      documentImages: [
        { bytes: IMAGE_BYTES_A, contentType: "image/jpeg" },
        { bytes: IMAGE_BYTES_B, contentType: "image/jpeg" },
      ],
    };

    beforeAll(async () => {
      engine = await bootDemoEngine({ mediaAssets: testAssets });
    }, 120_000);

    it("recording row uses provided durationSeconds", async () => {
      const storyTicketId = engine.ticketIds[0];
      expect(storyTicketId).toBeDefined();

      const recordings = await engine.tDb
        .selectFrom("recordings")
        .select(["duration_seconds", "blob_key"])
        .where("ticket_id", "=", storyTicketId as string)
        .execute();

      expect(recordings.length).toBeGreaterThan(0);

      // At least one recording should have the provided duration
      const withProvidedDuration = recordings.filter(
        (r) => r.duration_seconds === VOICEMAIL_DURATION,
      );
      expect(withProvidedDuration.length).toBeGreaterThan(0);
    }, 30_000);

    it("recording blob is stored in the blob store", async () => {
      const storyTicketId = engine.ticketIds[0];
      expect(storyTicketId).toBeDefined();

      const recording = await engine.tDb
        .selectFrom("recordings")
        .select("blob_key")
        .where("ticket_id", "=", storyTicketId as string)
        .executeTakeFirst();

      expect(recording).toBeDefined();
      const blob = await engine.blobStore.get(recording!.blob_key);
      expect(blob).not.toBeNull();
      expect(blob!.byteLength).toBeGreaterThan(0);
    }, 30_000);

    it("story ticket has phone_call follow-ups with call_status", async () => {
      const storyTicketId = engine.ticketIds[0];
      expect(storyTicketId).toBeDefined();

      const phoneCalls = await engine.tDb
        .selectFrom("followups")
        .select(["call_status", "call_duration_seconds"])
        .where("ticket_id", "=", storyTicketId as string)
        .where("type", "=", "phone_call")
        .orderBy("created_at", "asc")
        .execute();

      expect(phoneCalls.length).toBe(2);

      const noAnswer = phoneCalls[0];
      expect(noAnswer).toBeDefined();
      expect(noAnswer!.call_status).toBe("no_answer");

      const completed = phoneCalls[1];
      expect(completed).toBeDefined();
      expect(completed!.call_status).toBe("completed");
      expect(completed!.call_duration_seconds).toBe(340);
    }, 30_000);

    it("story ticket has enriched system event types", async () => {
      const storyTicketId = engine.ticketIds[0];
      expect(storyTicketId).toBeDefined();

      const systemEvents = await engine.tDb
        .selectFrom("followups")
        .select("type")
        .where("ticket_id", "=", storyTicketId as string)
        .where("source", "=", "system")
        .execute();

      const types = systemEvents.map((e) => e.type);
      expect(types).toContain("hold_placed");
      expect(types).toContain("hold_removed");
      expect(types).toContain("volunteer_unassigned");
      expect(types).toContain("merge_note");
    }, 30_000);
  });

  // ── Without assets (fallback) ────────────────────────────────────

  describe("no assets (fallback)", () => {
    let engine: DemoEngineResult;

    beforeAll(async () => {
      engine = await bootDemoEngine();
    }, 120_000);

    it("recording rows still exist with generated data", async () => {
      const storyTicketId = engine.ticketIds[0];
      expect(storyTicketId).toBeDefined();

      const recordings = await engine.tDb
        .selectFrom("recordings")
        .select(["blob_key", "duration_seconds"])
        .where("ticket_id", "=", storyTicketId as string)
        .execute();

      expect(recordings.length).toBeGreaterThan(0);

      // Each recording blob should exist in the store
      for (const rec of recordings) {
        const blob = await engine.blobStore.get(rec.blob_key);
        expect(blob).not.toBeNull();
      }
    }, 30_000);

    it("attachment rows still exist with generated data", async () => {
      const storyTicketId = engine.ticketIds[0];
      expect(storyTicketId).toBeDefined();

      const attachments = await engine.tDb
        .selectFrom("attachments")
        .select("blob_key")
        .where("ticket_id", "=", storyTicketId as string)
        .execute();

      expect(attachments.length).toBeGreaterThan(0);

      for (const att of attachments) {
        const blob = await engine.blobStore.get(att.blob_key);
        expect(blob).not.toBeNull();
      }
    }, 30_000);
  });
});
