/**
 * Tests for merge scan composable utilities.
 *
 * Tests the pairKey function used for dismissal blob key computation
 * and verifies the MergeScanDeps interface shape.
 */

import { describe, it, expect } from "vitest";
import { pairKey, type TicketRef } from "./create-merge-scan.svelte.js";

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

describe("TicketRef type inference", () => {
  it("accepts the TicketRef shape without casts", () => {
    // Type-level verification: TicketRef fields compile without
    // runtime "in" probes or "as" casts. If the server output type
    // drifts, this assignment will fail at compile time.
    const ref: TicketRef = {
      id: "t-1",
      clientId: "c-1",
      keyWrap: {
        ephemeralPoint: "ep",
        nonce: "n",
        wrappedKey: "wk",
      },
      intakeWrap: "iw",
    };
    expect(ref.keyWrap).not.toBeNull();
    expect(ref.intakeWrap).toBe("iw");
  });

  it("accepts null keyWrap and intakeWrap", () => {
    const ref: TicketRef = {
      id: "t-2",
      clientId: "c-2",
      keyWrap: null,
      intakeWrap: null,
    };
    expect(ref.keyWrap).toBeNull();
    expect(ref.intakeWrap).toBeNull();
  });
});
