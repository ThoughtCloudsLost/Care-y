/**
 * Tests for cleanup handler (beforeunload key zeroing).
 *
 * Mocks window.addEventListener/removeEventListener and verifies
 * that the handler fires bridge.zeroAll() and orgKey.zero() without
 * blocking page unload.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  installCleanupHandler,
  removeCleanupHandler,
  type CleanupBridge,
  type CleanupOrgKey,
} from "./cleanup.js";

// Track registered and removed beforeunload handlers
let unloadHandler: (() => void) | null = null;

beforeEach(() => {
  unloadHandler = null;

  vi.stubGlobal("window", {
    addEventListener: vi.fn((type: string, handler: () => void) => {
      if (type === "beforeunload") {
        unloadHandler = handler;
      }
    }),
    removeEventListener: vi.fn((type: string, _handler: () => void) => {
      if (type === "beforeunload") {
        unloadHandler = null;
      }
    }),
  });
});

afterEach(() => {
  removeCleanupHandler();
  vi.unstubAllGlobals();
});

function createMockBridge(): {
  bridge: CleanupBridge;
  zeroAllSpy: ReturnType<typeof vi.fn<() => Promise<void>>>;
} {
  const zeroAllSpy = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  return { bridge: { zeroAll: zeroAllSpy }, zeroAllSpy };
}

function createMockOrgKey(): {
  orgKey: CleanupOrgKey;
  zeroSpy: ReturnType<typeof vi.fn<() => void>>;
} {
  const zeroSpy = vi.fn<() => void>();
  return { orgKey: { zero: zeroSpy }, zeroSpy };
}

describe("cleanup handler", () => {
  describe("installCleanupHandler", () => {
    it("is idempotent (second call does not double-register)", () => {
      const { bridge } = createMockBridge();
      const { orgKey } = createMockOrgKey();

      installCleanupHandler(bridge, orgKey);
      installCleanupHandler(bridge, orgKey);

      expect(window.addEventListener).toHaveBeenCalledTimes(1);
    });
  });

  describe("beforeunload fires", () => {
    it("calls bridge.zeroAll() fire-and-forget", () => {
      const { bridge, zeroAllSpy } = createMockBridge();
      const { orgKey } = createMockOrgKey();

      installCleanupHandler(bridge, orgKey);

      expect(unloadHandler).not.toBeNull();
      unloadHandler!();

      expect(zeroAllSpy).toHaveBeenCalledOnce();
    });

    it("calls orgKey.zero()", () => {
      const { bridge } = createMockBridge();
      const { orgKey, zeroSpy } = createMockOrgKey();

      installCleanupHandler(bridge, orgKey);

      unloadHandler!();

      expect(zeroSpy).toHaveBeenCalledOnce();
    });

    it("does not throw if bridge.zeroAll rejects", () => {
      const { bridge, zeroAllSpy } = createMockBridge();
      zeroAllSpy.mockRejectedValue(new Error("Worker terminated"));
      const { orgKey } = createMockOrgKey();

      installCleanupHandler(bridge, orgKey);

      // Should not throw (fire-and-forget with .catch())
      expect(() => {
        unloadHandler!();
      }).not.toThrow();
    });
  });

  describe("removeCleanupHandler", () => {
    it("removes the beforeunload handler (zeroAll does not fire after removal)", () => {
      const { bridge, zeroAllSpy } = createMockBridge();
      const { orgKey } = createMockOrgKey();

      installCleanupHandler(bridge, orgKey);
      removeCleanupHandler();

      // After removal, unloadHandler is null (handler cannot fire)
      expect(unloadHandler).toBeNull();
      expect(zeroAllSpy).not.toHaveBeenCalled();
    });

    it("is idempotent (no error when called without prior install)", () => {
      expect(() => {
        removeCleanupHandler();
      }).not.toThrow();
    });
  });
});
