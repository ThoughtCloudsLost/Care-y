// @vitest-environment jsdom
/**
 * Queue appearance resolution tests.
 *
 * Covers token-to-render resolution (valid, unknown, missing) and the
 * cache-backed decrypt wrapper (cache key contract, null ciphertext
 * fallback, invalidation key list).
 */

import { describe, it, expect, vi } from "vitest";
import {
  resolveQueueAppearance,
  decryptQueueAppearance,
  queueAppearanceCacheKeys,
  QUEUE_DEFAULT_COLOR,
  QUEUE_DEFAULT_ICON,
} from "./queue-appearance.js";
import {
  ICON_BY_ID,
  COLOR_HEX_BY_ID,
} from "$lib/components/inputs/picker-options.js";
import type { OrgDecryptCache } from "$lib/crypto/org-decrypt-cache.js";

describe("resolveQueueAppearance", () => {
  it("resolves known tokens to their registry values", () => {
    const a = resolveQueueAppearance("red", "phone");
    expect(a.colorId).toBe("red");
    expect(a.colorHex).toBe(COLOR_HEX_BY_ID.red);
    expect(a.iconId).toBe("phone");
    expect(a.icon).toBe(ICON_BY_ID.phone);
  });

  it("falls back to defaults for null tokens (pre-078 rows, pending decrypts)", () => {
    const a = resolveQueueAppearance(null, null);
    expect(a.colorId).toBe(QUEUE_DEFAULT_COLOR);
    expect(a.iconId).toBe(QUEUE_DEFAULT_ICON);
    expect(a.icon).toBe(ICON_BY_ID[QUEUE_DEFAULT_ICON]);
  });

  it("falls back to defaults for unknown tokens", () => {
    const a = resolveQueueAppearance("hotpink", "unicorn");
    expect(a.colorId).toBe(QUEUE_DEFAULT_COLOR);
    expect(a.iconId).toBe(QUEUE_DEFAULT_ICON);
  });

  it("resolves tokens independently (one valid, one missing)", () => {
    const a = resolveQueueAppearance("green", undefined);
    expect(a.colorId).toBe("green");
    expect(a.iconId).toBe(QUEUE_DEFAULT_ICON);
  });
});

describe("decryptQueueAppearance", () => {
  it("decrypts via namespaced cache keys and resolves the tokens", () => {
    const values = new Map<string, string>([
      ["queue-color:q1", "purple"],
      ["queue-icon:q1", "star"],
    ]);
    const decrypt = vi.fn((id: string, data: unknown): string | null =>
      data === null ? null : (values.get(id) ?? null),
    );
    const cache = { decrypt } as unknown as OrgDecryptCache;

    const ct = "AQID";
    const a = decryptQueueAppearance(cache, {
      id: "q1",
      encryptedColor: ct,
      encryptedIcon: ct,
    });

    expect(decrypt).toHaveBeenCalledWith("queue-color:q1", ct);
    expect(decrypt).toHaveBeenCalledWith("queue-icon:q1", ct);
    expect(a.colorId).toBe("purple");
    expect(a.iconId).toBe("star");
  });

  it("returns defaults when ciphertexts are null", () => {
    const decrypt = vi.fn((): string | null => null);
    const cache = { decrypt } as unknown as OrgDecryptCache;

    const a = decryptQueueAppearance(cache, {
      id: "q2",
      encryptedColor: null,
      encryptedIcon: null,
    });

    expect(a.colorId).toBe(QUEUE_DEFAULT_COLOR);
    expect(a.iconId).toBe(QUEUE_DEFAULT_ICON);
  });
});

describe("queueAppearanceCacheKeys", () => {
  it("lists both namespaced keys for invalidation", () => {
    expect(queueAppearanceCacheKeys("abc")).toEqual([
      "queue-color:abc",
      "queue-icon:abc",
    ]);
  });
});
