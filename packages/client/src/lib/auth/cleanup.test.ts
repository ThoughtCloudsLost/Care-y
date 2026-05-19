/**
 * Tests for cleanup handler (beforeunload disconnect + cache clearing).
 *
 * Mocks window.addEventListener/removeEventListener and verifies
 * that the handler fires bridge.disconnect() and orgKey.zero() without
 * blocking page unload.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  installCleanupHandler,
  removeCleanupHandler,
  type CleanupBridge,
  type CleanupOrgKey,
} from "./cleanup.js";

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
  disconnectSpy: ReturnType<typeof vi.fn<() => void>>;
} {
  const disconnectSpy = vi.fn<() => void>();
  return { bridge: { disconnect: disconnectSpy }, disconnectSpy };
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
    it("calls bridge.disconnect()", () => {
      const { bridge, disconnectSpy } = createMockBridge();
      const { orgKey } = createMockOrgKey();

      installCleanupHandler(bridge, orgKey);

      expect(unloadHandler).not.toBeNull();
      unloadHandler!();

      expect(disconnectSpy).toHaveBeenCalledOnce();
    });

    it("calls orgKey.zero()", () => {
      const { bridge } = createMockBridge();
      const { orgKey, zeroSpy } = createMockOrgKey();

      installCleanupHandler(bridge, orgKey);

      unloadHandler!();

      expect(zeroSpy).toHaveBeenCalledOnce();
    });
  });

  describe("removeCleanupHandler", () => {
    it("removes the beforeunload handler (disconnect does not fire after removal)", () => {
      const { bridge, disconnectSpy } = createMockBridge();
      const { orgKey } = createMockOrgKey();

      installCleanupHandler(bridge, orgKey);
      removeCleanupHandler();

      expect(unloadHandler).toBeNull();
      expect(disconnectSpy).not.toHaveBeenCalled();
    });

    it("is idempotent (no error when called without prior install)", () => {
      expect(() => {
        removeCleanupHandler();
      }).not.toThrow();
    });
  });
});
