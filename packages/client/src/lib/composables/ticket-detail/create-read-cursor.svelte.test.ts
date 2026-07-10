// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushSync } from "svelte";
import {
  createReadCursor,
  type ReadCursorConfig,
  type ReadCursorState,
} from "./create-read-cursor.svelte.js";
import type { TicketKeyWrap } from "$lib/crypto/ticket-decrypt-cache.js";

// Effect-lifecycle companion to create-read-cursor.test.ts: these tests
// run inside $effect.root so the composable's effects are real. The
// plain .test.ts sibling covers the imperative API with effects
// compiled out.

const keyWrap: TicketKeyWrap = {
  ephemeralPoint: "ep",
  nonce: "n",
  wrappedKey: "wk",
};

function makeConfig(overrides?: Partial<ReadCursorConfig>): ReadCursorConfig {
  return {
    getTicketId: () => "ticket-1",
    getUserId: () => "user-1",
    getTicketKeyWrap: () => keyWrap,
    getCursorData: () => undefined,
    cryptoBridge: {
      // A dummy cursor row: AEAD decrypt fails, readUpTo settles to null.
      decrypt: vi
        .fn<() => Promise<string>>()
        .mockRejectedValue(new Error("aead failure")),
      encrypt: vi
        .fn<() => Promise<string>>()
        .mockResolvedValue("encrypted-blob"),
    } as unknown as ReadCursorConfig["cryptoBridge"],
    mutate: vi.fn<() => Promise<unknown>>().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("createReadCursor (effect lifecycle)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("a cursor refetch does not cancel an armed flush", async () => {
    let cursorData = $state<{ encryptedReadCursor: string } | undefined>({
      encryptedReadCursor: "dummy-cursor-1",
    });
    const config = makeConfig({ getCursorData: () => cursorData });

    let rc!: ReadCursorState;
    const destroy = $effect.root(() => {
      rc = createReadCursor(config);
    });
    flushSync();
    // Let the (failing) dummy decrypt settle: readUpTo -> null.
    await vi.advanceTimersByTimeAsync(0);

    // The initial visibility report arms the 3s flush. A conversation
    // that fits the pane fires no scroll event, so this one report is
    // the only chance the cursor write gets.
    rc.handleProgress("2026-01-01T12:00:00Z");

    // The read cursor query refetches inside the flush window (identity
    // change re-runs the decrypt effect). This used to clear the armed
    // timer via the decrypt effect's cleanup and strand the write.
    cursorData = { encryptedReadCursor: "dummy-cursor-2" };
    flushSync();

    await vi.advanceTimersByTimeAsync(3000);
    expect(config.mutate).toHaveBeenCalledTimes(1);

    destroy();
  });

  it("unmount clears an armed flush", async () => {
    const config = makeConfig();

    let rc!: ReadCursorState;
    const destroy = $effect.root(() => {
      rc = createReadCursor(config);
    });
    flushSync();
    await vi.advanceTimersByTimeAsync(0);

    rc.handleProgress("2026-01-01T12:00:00Z");
    destroy();

    await vi.advanceTimersByTimeAsync(3000);
    expect(config.mutate).not.toHaveBeenCalled();
  });
});
