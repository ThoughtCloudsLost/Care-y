import { describe, it, expect } from "vitest";
import { DECRYPT_ERROR_SENTINEL } from "./async-decrypt-cache.js";
import {
  type DecryptResult,
  LOADING,
  DENIED,
  ERROR,
  resolveAsyncDecrypt,
  resolveOrgDecrypt,
  matchDecryptResult,
  decryptedValueOr,
  isDecryptReady,
} from "./decrypt-result.js";

describe("DecryptResult", () => {
  describe("singleton identity", () => {
    it("LOADING is the same reference across calls", () => {
      expect(LOADING).toBe(LOADING);
      expect(Object.isFrozen(LOADING)).toBe(true);
    });

    it("DENIED is the same reference across calls", () => {
      expect(DENIED).toBe(DENIED);
      expect(Object.isFrozen(DENIED)).toBe(true);
    });

    it("ERROR is the same reference across calls", () => {
      expect(ERROR).toBe(ERROR);
      expect(Object.isFrozen(ERROR)).toBe(true);
    });
  });

  describe("resolveAsyncDecrypt", () => {
    it("returns DENIED when hasAccess is false", () => {
      expect(resolveAsyncDecrypt(undefined, false)).toBe(DENIED);
      expect(resolveAsyncDecrypt("plaintext", false)).toBe(DENIED);
      expect(resolveAsyncDecrypt(DECRYPT_ERROR_SENTINEL, false)).toBe(DENIED);
    });

    it("returns LOADING when raw is undefined and hasAccess is true", () => {
      expect(resolveAsyncDecrypt(undefined, true)).toBe(LOADING);
    });

    it("returns ERROR when raw is the sentinel and hasAccess is true", () => {
      expect(resolveAsyncDecrypt(DECRYPT_ERROR_SENTINEL, true)).toBe(ERROR);
    });

    it("returns ready with plaintext value", () => {
      const result = resolveAsyncDecrypt("hello world", true);
      expect(result.status).toBe("ready");
      expect(result).toEqual({ status: "ready", value: "hello world" });
    });

    it("ready results are frozen", () => {
      const result = resolveAsyncDecrypt("test", true);
      expect(Object.isFrozen(result)).toBe(true);
    });
  });

  describe("resolveOrgDecrypt", () => {
    it("returns LOADING when raw is null and key is not loaded", () => {
      expect(resolveOrgDecrypt(null, false)).toBe(LOADING);
    });

    it("returns ERROR when raw is null and key is loaded", () => {
      expect(resolveOrgDecrypt(null, true)).toBe(ERROR);
    });

    it("returns ready with plaintext value", () => {
      const result = resolveOrgDecrypt("org content", true);
      expect(result.status).toBe("ready");
      expect(result).toEqual({ status: "ready", value: "org content" });
    });

    it("returns ready regardless of isKeyLoaded when value is present", () => {
      const result = resolveOrgDecrypt("cached", false);
      expect(result.status).toBe("ready");
      expect(result).toEqual({ status: "ready", value: "cached" });
    });
  });

  describe("matchDecryptResult", () => {
    it("dispatches to loading handler", () => {
      const result = matchDecryptResult(LOADING, {
        loading: () => "is-loading",
        ready: () => "is-ready",
        denied: () => "is-denied",
        error: () => "is-error",
      });
      expect(result).toBe("is-loading");
    });

    it("dispatches to ready handler with value", () => {
      const r: DecryptResult = { status: "ready", value: "test" };
      const result = matchDecryptResult(r, {
        loading: () => "is-loading",
        ready: (v) => `is-ready:${v}`,
        denied: () => "is-denied",
        error: () => "is-error",
      });
      expect(result).toBe("is-ready:test");
    });

    it("dispatches to denied handler", () => {
      const result = matchDecryptResult(DENIED, {
        loading: () => "is-loading",
        ready: () => "is-ready",
        denied: () => "is-denied",
        error: () => "is-error",
      });
      expect(result).toBe("is-denied");
    });

    it("dispatches to error handler", () => {
      const result = matchDecryptResult(ERROR, {
        loading: () => "is-loading",
        ready: () => "is-ready",
        denied: () => "is-denied",
        error: () => "is-error",
      });
      expect(result).toBe("is-error");
    });
  });

  describe("decryptedValueOr", () => {
    it("returns value when ready", () => {
      const r: DecryptResult = { status: "ready", value: "plaintext" };
      expect(decryptedValueOr(r, "fallback")).toBe("plaintext");
    });

    it("returns fallback for loading", () => {
      expect(decryptedValueOr(LOADING, "fallback")).toBe("fallback");
    });

    it("returns fallback for denied", () => {
      expect(decryptedValueOr(DENIED, "fallback")).toBe("fallback");
    });

    it("returns fallback for error", () => {
      expect(decryptedValueOr(ERROR, "fallback")).toBe("fallback");
    });
  });

  describe("isDecryptReady", () => {
    it("returns true for ready state", () => {
      const r: DecryptResult = { status: "ready", value: "test" };
      expect(isDecryptReady(r)).toBe(true);
    });

    it("narrows type to access value", () => {
      const r: DecryptResult = { status: "ready", value: "test" };
      if (isDecryptReady(r)) {
        // This line would fail to compile if narrowing didn't work
        const v: string = r.value;
        expect(v).toBe("test");
      }
    });

    it("returns false for non-ready states", () => {
      expect(isDecryptReady(LOADING)).toBe(false);
      expect(isDecryptReady(DENIED)).toBe(false);
      expect(isDecryptReady(ERROR)).toBe(false);
    });
  });
});
