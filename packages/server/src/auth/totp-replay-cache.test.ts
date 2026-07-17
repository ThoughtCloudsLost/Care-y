/**
 * Unit tests for the in-memory TOTP replay cache (RFC 6238 Section 5.2).
 *
 * Pure unit tests: no DB or Docker required.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  createInMemoryTotpReplayCache,
  assertSingleInstanceTotpReplayCache,
  TOTP_REPLAY_TTL_MS,
} from "./totp-replay-cache.js";
import { ConfigError } from "../errors.js";

describe("TotpReplayCache", () => {
  describe("createInMemoryTotpReplayCache", () => {
    it("reports a code unused before markUsed and used after", () => {
      const cache = createInMemoryTotpReplayCache(() => 1_000);

      expect(cache.isUsed("org", "user", "123456")).toBe(false);
      cache.markUsed("org", "user", "123456");
      expect(cache.isUsed("org", "user", "123456")).toBe(true);
    });

    it("does not mark other codes for the same user", () => {
      const cache = createInMemoryTotpReplayCache(() => 1_000);

      cache.markUsed("org", "user", "123456");
      expect(cache.isUsed("org", "user", "654321")).toBe(false);
    });

    it("isolates users within an org", () => {
      const cache = createInMemoryTotpReplayCache(() => 1_000);

      cache.markUsed("org", "user-a", "123456");
      expect(cache.isUsed("org", "user-b", "123456")).toBe(false);
    });

    it("isolates orgs for the same user ID", () => {
      const cache = createInMemoryTotpReplayCache(() => 1_000);

      cache.markUsed("org-a", "user", "123456");
      expect(cache.isUsed("org-b", "user", "123456")).toBe(false);
    });

    it("keeps a code used until the TTL elapses, then forgets it", () => {
      let time = 0;
      const cache = createInMemoryTotpReplayCache(() => time);

      cache.markUsed("org", "user", "123456");

      time = TOTP_REPLAY_TTL_MS - 1;
      expect(cache.isUsed("org", "user", "123456")).toBe(true);

      time = TOTP_REPLAY_TTL_MS;
      expect(cache.isUsed("org", "user", "123456")).toBe(false);
    });

    it("accepts a fresh markUsed after a previous entry expired", () => {
      let time = 0;
      const cache = createInMemoryTotpReplayCache(() => time);

      cache.markUsed("org", "user", "123456");
      time = TOTP_REPLAY_TTL_MS + 1;
      expect(cache.isUsed("org", "user", "123456")).toBe(false);

      cache.markUsed("org", "user", "123456");
      expect(cache.isUsed("org", "user", "123456")).toBe(true);
    });
  });

  describe("cleanup interval", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("evicts expired entries in the periodic sweep and keeps live ones", () => {
      vi.useFakeTimers();
      let time = 0;
      const cache = createInMemoryTotpReplayCache(() => time);

      cache.markUsed("org", "user", "111111");
      time = TOTP_REPLAY_TTL_MS + 1;
      cache.markUsed("org", "user", "222222");

      // Trigger the 60s cleanup interval.
      vi.advanceTimersByTime(60_000);

      expect(cache.isUsed("org", "user", "111111")).toBe(false);
      expect(cache.isUsed("org", "user", "222222")).toBe(true);
    });
  });

  describe("assertSingleInstanceTotpReplayCache", () => {
    it("throws ConfigError when a multi-instance deployment is declared", () => {
      expect(() => {
        assertSingleInstanceTotpReplayCache(true);
      }).toThrow(ConfigError);
    });

    it("does nothing for a single-instance deployment", () => {
      expect(() => {
        assertSingleInstanceTotpReplayCache(false);
      }).not.toThrow();
    });
  });
});
