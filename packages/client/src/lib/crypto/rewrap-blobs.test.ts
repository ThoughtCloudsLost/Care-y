/**
 * Tests for rewrap-blobs.ts (main-thread blob re-wrap orchestration).
 *
 * Verifies: TanStack cache prefix-match lookup for blob flags, recording
 * and attachment re-wrap orchestration, all-or-nothing error propagation,
 * and the no-blobs fast path.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { QueryClient } from "@tanstack/svelte-query";
import { ticketKeys } from "$lib/query/keys.js";
import { rewrapBlobsForFollowUp } from "./rewrap-blobs.js";

const TICKET_ID = "ticket-001";
const FOLLOW_UP_ID = "fu-001";

function createMockBridge(): CryptoBridge {
  return {
    rewrapBlob: vi.fn().mockResolvedValue({
      encryptedData: "re-encrypted-base64",
      blobKey: "blob-key-001",
      category: "recording" as const,
    }),
  } as unknown as CryptoBridge;
}

function createMockTicketRouter() {
  return {
    listRecordings: {
      query: vi.fn().mockResolvedValue([]),
    },
    listAttachments: {
      query: vi.fn().mockResolvedValue([]),
    },
    downloadRecordingBlob: {
      query: vi.fn().mockResolvedValue({ data: "encrypted-blob-base64" }),
    },
    downloadAttachmentBlob: {
      query: vi.fn().mockResolvedValue({ data: "encrypted-att-base64" }),
    },
  };
}

/**
 * Creates a mock QueryClient that returns data for getQueriesData calls.
 * Stores data under specific sub-keys of the followUps prefix.
 */
function createMockQueryClient(
  followUps?: readonly {
    id: string;
    hasRecording?: boolean;
    hasImage?: boolean;
    hasFile?: boolean;
  }[],
): QueryClient {
  const store = new Map<string, unknown>();

  if (followUps) {
    const key = JSON.stringify(ticketKeys.followUpsInitial(TICKET_ID));
    store.set(key, followUps);
  }

  return {
    getQueriesData: vi.fn((opts: { queryKey: readonly unknown[] }) => {
      const prefix = JSON.stringify(opts.queryKey);
      const results: [readonly unknown[], unknown][] = [];
      for (const [key, data] of store) {
        const keyArr = JSON.parse(key) as unknown[];
        const prefixArr = JSON.parse(prefix) as unknown[];
        const isPrefix = prefixArr.every(
          (v, i) => JSON.stringify(v) === JSON.stringify(keyArr[i]),
        );
        if (isPrefix) {
          results.push([keyArr, data]);
        }
      }
      return results;
    }),
  } as unknown as QueryClient;
}

describe("rewrapBlobsForFollowUp", () => {
  let bridge: CryptoBridge;
  let router: ReturnType<typeof createMockTicketRouter>;

  beforeEach(() => {
    bridge = createMockBridge();
    router = createMockTicketRouter();
  });

  it("returns empty array when follow-up has no blobs in cache", async () => {
    const qc = createMockQueryClient([
      {
        id: FOLLOW_UP_ID,
        hasRecording: false,
        hasImage: false,
        hasFile: false,
      },
    ]);

    const result = await rewrapBlobsForFollowUp(
      TICKET_ID,
      FOLLOW_UP_ID,
      bridge,
      router as never,
      qc,
    );

    expect(result).toEqual([]);
    expect(router.listRecordings.query).not.toHaveBeenCalled();
  });

  it("returns empty array when follow-up is not in cache at all", async () => {
    const qc = createMockQueryClient([]);

    const result = await rewrapBlobsForFollowUp(
      TICKET_ID,
      FOLLOW_UP_ID,
      bridge,
      router as never,
      qc,
    );

    expect(result).toEqual([]);
  });

  it("returns empty array when cache has no data", async () => {
    const qc = createMockQueryClient();

    const result = await rewrapBlobsForFollowUp(
      TICKET_ID,
      FOLLOW_UP_ID,
      bridge,
      router as never,
      qc,
    );

    expect(result).toEqual([]);
  });

  it("re-wraps recordings when follow-up has recording flag", async () => {
    const qc = createMockQueryClient([
      { id: FOLLOW_UP_ID, hasRecording: true },
    ]);

    router.listRecordings.query.mockResolvedValue([
      { id: "rec-1", blobKey: "blob-rec-1", followupId: FOLLOW_UP_ID },
    ]);

    (bridge.rewrapBlob as ReturnType<typeof vi.fn>).mockResolvedValue({
      encryptedData: "re-encrypted-rec",
      blobKey: "blob-rec-1",
      category: "recording",
    });

    const result = await rewrapBlobsForFollowUp(
      TICKET_ID,
      FOLLOW_UP_ID,
      bridge,
      router as never,
      qc,
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      oldBlobKey: "blob-rec-1",
      encryptedData: "re-encrypted-rec",
      category: "recording",
    });

    expect(router.downloadRecordingBlob.query).toHaveBeenCalledWith({
      recordingId: "rec-1",
    });
    expect(bridge.rewrapBlob).toHaveBeenCalledWith(
      FOLLOW_UP_ID,
      TICKET_ID,
      "encrypted-blob-base64",
      "blob-rec-1",
      "recording",
    );
  });

  it("re-wraps multiple attachments when follow-up has image flag", async () => {
    const qc = createMockQueryClient([{ id: FOLLOW_UP_ID, hasImage: true }]);

    router.listAttachments.query.mockResolvedValue([
      { id: "att-1", blobKey: "blob-att-1", followupId: FOLLOW_UP_ID },
      { id: "att-2", blobKey: "blob-att-2", followupId: FOLLOW_UP_ID },
    ]);

    (bridge.rewrapBlob as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        encryptedData: "re-encrypted-att-1",
        blobKey: "blob-att-1",
        category: "attachment",
      })
      .mockResolvedValueOnce({
        encryptedData: "re-encrypted-att-2",
        blobKey: "blob-att-2",
        category: "attachment",
      });

    const result = await rewrapBlobsForFollowUp(
      TICKET_ID,
      FOLLOW_UP_ID,
      bridge,
      router as never,
      qc,
    );

    expect(result).toHaveLength(2);
    expect(result[0]!.category).toBe("attachment");
    expect(result[1]!.category).toBe("attachment");
  });

  it("propagates blob download errors (all-or-nothing)", async () => {
    const qc = createMockQueryClient([
      { id: FOLLOW_UP_ID, hasRecording: true },
    ]);

    router.listRecordings.query.mockResolvedValue([
      { id: "rec-fail", blobKey: "blob-fail", followupId: FOLLOW_UP_ID },
    ]);
    router.downloadRecordingBlob.query.mockRejectedValue(
      new Error("Network error"),
    );

    await expect(
      rewrapBlobsForFollowUp(
        TICKET_ID,
        FOLLOW_UP_ID,
        bridge,
        router as never,
        qc,
      ),
    ).rejects.toThrow("Network error");
  });

  it("propagates Worker rewrapBlob errors (all-or-nothing)", async () => {
    const qc = createMockQueryClient([{ id: FOLLOW_UP_ID, hasFile: true }]);

    router.listAttachments.query.mockResolvedValue([
      { id: "att-fail", blobKey: "blob-fail", followupId: FOLLOW_UP_ID },
    ]);

    (bridge.rewrapBlob as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("REWRAP_FAILED"),
    );

    await expect(
      rewrapBlobsForFollowUp(
        TICKET_ID,
        FOLLOW_UP_ID,
        bridge,
        router as never,
        qc,
      ),
    ).rejects.toThrow("REWRAP_FAILED");
  });

  it("handles mixed recordings and attachments", async () => {
    const qc = createMockQueryClient([
      { id: FOLLOW_UP_ID, hasRecording: true, hasImage: true },
    ]);

    router.listRecordings.query.mockResolvedValue([
      { id: "rec-1", blobKey: "blob-rec-1", followupId: FOLLOW_UP_ID },
    ]);
    router.listAttachments.query.mockResolvedValue([
      { id: "att-1", blobKey: "blob-att-1", followupId: FOLLOW_UP_ID },
    ]);

    (bridge.rewrapBlob as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        encryptedData: "re-enc-rec",
        blobKey: "blob-rec-1",
        category: "recording",
      })
      .mockResolvedValueOnce({
        encryptedData: "re-enc-att",
        blobKey: "blob-att-1",
        category: "attachment",
      });

    const result = await rewrapBlobsForFollowUp(
      TICKET_ID,
      FOLLOW_UP_ID,
      bridge,
      router as never,
      qc,
    );

    expect(result).toHaveLength(2);
    const categories = result.map((r) => r.category);
    expect(categories).toContain("recording");
    expect(categories).toContain("attachment");
  });
});
