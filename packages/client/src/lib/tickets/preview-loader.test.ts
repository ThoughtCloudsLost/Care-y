/**
 * Tests for createPreviewLoader.
 *
 * Verifies batch deduplication, eager vs lazy loading, cache registry
 * integration, and error handling for the ticket preview data pipeline.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createPreviewLoader,
  type RawFollowUpPreview,
  type PreviewLoader,
} from "./preview-loader.svelte.js";
import { cacheRegistry } from "$lib/crypto/cache-registry.js";

const KEY_WRAP = {
  ephemeralPoint: "ep",
  nonce: "nonce",
  wrappedKey: "wk",
};

function makePreview(id: string): RawFollowUpPreview {
  return {
    id,
    source: "volunteer",
    type: "message",
    encryptedContent: { type: "Buffer", data: [1, 2, 3] },
    keyWrap: KEY_WRAP,
    createdAt: "2026-04-01T00:00:00Z",
    hasRecording: false,
    hasImage: false,
    hasFile: false,
    noteTypeId: null,
  };
}

function createMockQueryFn(): {
  queryFn: (ids: string[]) => Promise<Record<string, RawFollowUpPreview[]>>;
  mock: ReturnType<typeof vi.fn>;
} {
  const mock =
    vi.fn<(ids: string[]) => Promise<Record<string, RawFollowUpPreview[]>>>();
  mock.mockImplementation(async (ids: string[]) => {
    const result: Record<string, RawFollowUpPreview[]> = {};
    for (const id of ids) {
      result[id] = [makePreview(`fu-${id}`)];
    }
    return result;
  });
  return { queryFn: mock, mock };
}

describe("createPreviewLoader", () => {
  let loader: PreviewLoader;
  let queryMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    const { queryFn, mock } = createMockQueryFn();
    queryMock = mock;
    // Use a short batch delay for predictable test timing.
    loader = createPreviewLoader({ queryFn, batchDelayMs: 50 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Registry names are used by cacheRegistry.clearAll() on logout to wipe decrypted data.
  it("registers rawPreviews map and state with cacheRegistry", () => {
    const names = cacheRegistry.registered;
    expect(names).toContain("PreviewLoader:raw");
    expect(names).toContain("PreviewLoader:state");
  });

  describe("observe", () => {
    it("batches multiple observe calls into a single query", async () => {
      loader.observe("t-1");
      loader.observe("t-2");
      loader.observe("t-3");

      // Advance past the batch delay.
      await vi.advanceTimersByTimeAsync(60);

      expect(queryMock).toHaveBeenCalledOnce();
      expect(queryMock).toHaveBeenCalledWith(["t-1", "t-2", "t-3"]);
    });

    it("deduplicates: calling observe twice with the same ID fires one query", async () => {
      loader.observe("t-1");
      loader.observe("t-1");
      loader.observe("t-1");

      await vi.advanceTimersByTimeAsync(60);

      expect(queryMock).toHaveBeenCalledOnce();
      expect(queryMock).toHaveBeenCalledWith(["t-1"]);
    });

    it("skips already-loaded IDs", async () => {
      // Eagerly load t-1 first.
      await loader.eagerLoad(["t-1"]);

      loader.observe("t-1");
      loader.observe("t-2");

      await vi.advanceTimersByTimeAsync(60);

      // Second query should only contain t-2.
      expect(queryMock).toHaveBeenCalledTimes(2);
      expect(queryMock).toHaveBeenLastCalledWith(["t-2"]);
    });

    it("stores results in rawPreviews map", async () => {
      loader.observe("t-1");
      await vi.advanceTimersByTimeAsync(60);

      const previews = loader.get("t-1");
      expect(previews).toBeDefined();
      expect(previews).toHaveLength(1);
      expect(previews?.[0]?.id).toBe("fu-t-1");
    });
  });

  describe("eagerLoad", () => {
    it("fetches immediately without batch delay", async () => {
      await loader.eagerLoad(["t-1", "t-2"]);

      expect(queryMock).toHaveBeenCalledOnce();
      expect(queryMock).toHaveBeenCalledWith(["t-1", "t-2"]);
    });

    it("skips already-loaded IDs", async () => {
      await loader.eagerLoad(["t-1"]);
      await loader.eagerLoad(["t-1", "t-2"]);

      expect(queryMock).toHaveBeenCalledTimes(2);
      expect(queryMock).toHaveBeenLastCalledWith(["t-2"]);
    });

    it("is a no-op when all IDs are already loaded", async () => {
      await loader.eagerLoad(["t-1"]);
      await loader.eagerLoad(["t-1"]);

      expect(queryMock).toHaveBeenCalledOnce();
    });
  });

  describe("get", () => {
    it("returns undefined for unloaded ticket", () => {
      expect(loader.get("unknown")).toBeUndefined();
    });

    it("returns previews after load", async () => {
      await loader.eagerLoad(["t-1"]);
      expect(loader.get("t-1")).toHaveLength(1);
    });
  });

  describe("error handling", () => {
    it("sets empty arrays on query failure so UI does not shimmer forever", async () => {
      queryMock.mockRejectedValueOnce(new Error("network error"));

      loader.observe("t-1");
      loader.observe("t-2");
      await vi.advanceTimersByTimeAsync(60);

      expect(loader.get("t-1")).toEqual([]);
      expect(loader.get("t-2")).toEqual([]);
    });

    it("handles missing ticket IDs in response (sets empty array)", async () => {
      queryMock.mockResolvedValueOnce({ "t-1": [makePreview("fu-t-1")] });

      await loader.eagerLoad(["t-1", "t-2"]);

      expect(loader.get("t-1")).toHaveLength(1);
      expect(loader.get("t-2")).toEqual([]);
    });
  });
});
