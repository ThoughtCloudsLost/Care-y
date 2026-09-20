/**
 * Tests for the saved-filter reseal utility.
 *
 * Verifies that resealSavedFilterNames correctly delegates to the
 * CryptoBridge orgResealBatch, replaces only resealed records,
 * leaves undecryptable records untouched, and returns null when
 * nothing changed.
 */

import { describe, it, expect, vi } from "vitest";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { SavedFilterRecord } from "@care-y/shared";
import { resealSavedFilterNames } from "./saved-filter-reseal.js";

// ── Bridge mock ───────────────────────────────────────────────────

type ResealBatchFn = CryptoBridge["orgResealBatch"];

function createMockBridge(impl: ResealBatchFn): CryptoBridge {
  return { orgResealBatch: vi.fn(impl) } as unknown as CryptoBridge;
}

// ── Helpers ───────────────────────────────────────────────────────

function makeRecord(
  overrides: Partial<SavedFilterRecord> = {},
): SavedFilterRecord {
  return {
    id: crypto.randomUUID(),
    encryptedName: "old-ciphertext-" + Math.random().toString(36).slice(2),
    color: "blue",
    icon: "tag",
    state: JSON.stringify({
      statuses: ["new"],
      queueIds: [],
      priorities: [],
      assigneeId: null,
      dateFrom: null,
      dateTo: null,
      sortField: "date",
      sortDirection: "desc",
    }),
    shared: false,
    ownerId: "user-1",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────

describe("resealSavedFilterNames", () => {
  it("returns null when nothing was resealed", async () => {
    const rec = makeRecord();
    const bridge = createMockBridge(async (items) =>
      items.map((item) => ({
        cacheKey: item.cacheKey,
        resealed: null,
        fromGeneration: 2,
        indexHash: null,
      })),
    );

    const result = await resealSavedFilterNames(bridge, [rec]);
    expect(result).toBeNull();
  });

  it("returns null for an empty records array", async () => {
    const bridge = createMockBridge(async () => []);
    const result = await resealSavedFilterNames(bridge, []);
    expect(result).toBeNull();
  });

  it("replaces only records that were resealed", async () => {
    const rec1 = makeRecord({
      id: "aaa-1111-0000-0000-000000000000" as `${string}-${string}-${string}-${string}-${string}`,
    });
    const rec2 = makeRecord({
      id: "bbb-2222-0000-0000-000000000000" as `${string}-${string}-${string}-${string}-${string}`,
    });

    const bridge = createMockBridge(async (items) =>
      items.map((item) => ({
        cacheKey: item.cacheKey,
        resealed: item.cacheKey === rec1.id ? "new-ciphertext" : null,
        fromGeneration: item.cacheKey === rec1.id ? 1 : 2,
        indexHash: null,
      })),
    );

    const result = await resealSavedFilterNames(bridge, [rec1, rec2]);

    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);
    expect(result![0]!.encryptedName).toBe("new-ciphertext");
    expect(result![1]!.encryptedName).toBe(rec2.encryptedName);
  });

  it("leaves undecryptable records untouched", async () => {
    const rec = makeRecord();

    // Both resealed and fromGeneration null = undecryptable
    const bridge = createMockBridge(async (items) =>
      items.map((item) => ({
        cacheKey: item.cacheKey,
        resealed: null,
        fromGeneration: null,
        indexHash: null,
      })),
    );

    const result = await resealSavedFilterNames(bridge, [rec]);

    // Nothing resealed, so null (no persist needed).
    // The original record is preserved (not deleted).
    expect(result).toBeNull();
  });
});
