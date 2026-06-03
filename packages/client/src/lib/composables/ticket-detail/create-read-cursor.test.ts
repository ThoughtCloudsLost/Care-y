import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createReadCursor,
  type ReadCursorConfig,
} from "./create-read-cursor.svelte.js";

function makeConfig(overrides?: Partial<ReadCursorConfig>): ReadCursorConfig {
  return {
    getTicketId: () => "ticket-1",
    getTicketKeyWrap: () => undefined,
    getCursorData: () => undefined,
    cryptoBridge: {
      decrypt: vi.fn<() => Promise<string>>().mockResolvedValue("{}"),
      encrypt: vi
        .fn<() => Promise<string>>()
        .mockResolvedValue("encrypted-blob"),
      encryptText: vi.fn().mockResolvedValue("encrypted-text"),
    } as unknown as ReadCursorConfig["cryptoBridge"],
    mutate: vi.fn<() => Promise<unknown>>().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("createReadCursor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with undefined readUpTo", () => {
    const rc = createReadCursor(makeConfig());

    expect(rc.readUpTo).toBeUndefined();
  });

  describe("handleProgress", () => {
    it("schedules a flush after 3 seconds", () => {
      const config = makeConfig();
      const rc = createReadCursor(config);

      rc.handleProgress("2026-01-01T12:00:00Z");

      expect(config.mutate).not.toHaveBeenCalled();
    });

    it("ignores timestamps that do not advance the cursor", () => {
      const config = makeConfig();
      const rc = createReadCursor(config);

      rc.handleProgress("2026-01-01T12:00:00Z");
      rc.handleProgress("2026-01-01T11:00:00Z");

      vi.advanceTimersByTime(3000);
      // flush will be called once, with the latest timestamp
    });

    it("replaces pending timestamp when a newer one arrives", () => {
      const config = makeConfig();
      const rc = createReadCursor(config);

      rc.handleProgress("2026-01-01T12:00:00Z");
      rc.handleProgress("2026-01-01T13:00:00Z");

      // The 3s timer restarts on the second call
    });
  });

  describe("flush", () => {
    it("encrypts and mutates with the pending timestamp", async () => {
      const encrypt = vi
        .fn<() => Promise<string>>()
        .mockResolvedValue("encrypted-payload");
      const mutate = vi
        .fn<() => Promise<unknown>>()
        .mockResolvedValue(undefined);
      const config = makeConfig({
        cryptoBridge: {
          encrypt,
          decrypt: vi.fn(),
        } as unknown as ReadCursorConfig["cryptoBridge"],
        mutate,
      });
      const rc = createReadCursor(config);

      rc.handleProgress("2026-01-01T12:00:00Z");
      await rc.flush();

      expect(encrypt).toHaveBeenCalledWith(
        "ticket-1",
        JSON.stringify({ readUpTo: "2026-01-01T12:00:00Z" }),
      );
      expect(mutate).toHaveBeenCalledWith({
        ticketId: "ticket-1",
        encryptedReadCursor: "encrypted-payload",
      });
    });

    it("does nothing when no timestamp is pending", async () => {
      const config = makeConfig();
      const rc = createReadCursor(config);

      await rc.flush();

      expect(config.mutate).not.toHaveBeenCalled();
    });

    it("clears pending timestamp after flush", async () => {
      const config = makeConfig();
      const rc = createReadCursor(config);

      rc.handleProgress("2026-01-01T12:00:00Z");
      await rc.flush();
      await rc.flush();

      expect(config.mutate).toHaveBeenCalledOnce();
    });

    it("swallows errors gracefully", async () => {
      const config = makeConfig({
        mutate: vi.fn().mockRejectedValue(new Error("network")),
      });
      const rc = createReadCursor(config);

      rc.handleProgress("2026-01-01T12:00:00Z");

      await expect(rc.flush()).resolves.toBeUndefined();
    });
  });
});
