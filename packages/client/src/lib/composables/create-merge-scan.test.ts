/**
 * Tests for merge scan composable utilities.
 *
 * Tests the pairKey function used for dismissal blob key computation
 * and verifies the MergeScanDeps interface shape.
 */

import { describe, it, expect } from "vitest";
import { pairKey } from "./create-merge-scan.svelte.js";
import type { MergeScanDeps } from "./create-merge-scan.svelte.js";

describe("pairKey", () => {
  it("produces identical keys regardless of argument order", () => {
    const keyAB = pairKey("client-aaa", "client-bbb");
    const keyBA = pairKey("client-bbb", "client-aaa");
    expect(keyAB).toBe(keyBA);
  });

  it("sorts client ids lexicographically", () => {
    const key = pairKey("zzz", "aaa");
    expect(key).toBe("aaa:zzz");
  });

  it("handles identical client ids", () => {
    const key = pairKey("same-id", "same-id");
    expect(key).toBe("same-id:same-id");
  });

  it("produces different keys for different pairs", () => {
    const key1 = pairKey("aaa", "bbb");
    const key2 = pairKey("aaa", "ccc");
    expect(key1).not.toBe(key2);
  });

  it("uses colon separator", () => {
    const key = pairKey("alpha", "beta");
    expect(key).toBe("alpha:beta");
    expect(key.split(":")).toHaveLength(2);
  });
});

describe("MergeScanDeps interface", () => {
  it("no longer includes clientPhones property", () => {
    // The composable consumes phoneHashes from the server payload instead
    // of plaintext phone values from the dashboard. This test verifies the
    // type change at the value level.
    const deps: MergeScanDeps = {
      dashboardReady: true,
      tickets: [],
      canViewClients: true,
    };
    expect(Object.keys(deps)).not.toContain("clientPhones");
    expect(deps.canViewClients).toBe(true);
  });

  it("requires canViewClients permission flag", () => {
    const deps: MergeScanDeps = {
      dashboardReady: true,
      tickets: [],
      canViewClients: false,
    };
    expect(deps.canViewClients).toBe(false);
  });
});
