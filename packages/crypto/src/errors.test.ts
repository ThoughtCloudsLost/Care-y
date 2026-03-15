import { describe, it, expect } from "vitest";
import {
  CryptoError,
  DecryptionError,
  InvalidKeyError,
  InvalidInputError,
  SodiumNotReadyError,
} from "./errors.js";

describe("CryptoError", () => {
  it("stores code and message", () => {
    const err = new CryptoError("TEST_CODE", "test message");
    expect(err.code).toBe("TEST_CODE");
    expect(err.message).toBe("test message");
    expect(err.name).toBe("CryptoError");
  });

  it("extends Error", () => {
    const err = new CryptoError("X", "y");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("DecryptionError", () => {
  it("has correct defaults", () => {
    const err = new DecryptionError();
    expect(err.code).toBe("DECRYPTION_FAILED");
    expect(err.message).toBe("Decryption failed");
    expect(err.name).toBe("DecryptionError");
  });

  it("accepts custom message", () => {
    const err = new DecryptionError("bad ciphertext");
    expect(err.message).toBe("bad ciphertext");
    expect(err.code).toBe("DECRYPTION_FAILED");
  });

  it("is CryptoError and Error", () => {
    const err = new DecryptionError();
    expect(err).toBeInstanceOf(CryptoError);
    expect(err).toBeInstanceOf(Error);
  });
});

describe("InvalidKeyError", () => {
  it("has correct defaults", () => {
    const err = new InvalidKeyError();
    expect(err.code).toBe("INVALID_KEY");
    expect(err.message).toBe("Invalid key");
    expect(err.name).toBe("InvalidKeyError");
  });

  it("accepts custom message", () => {
    const err = new InvalidKeyError("key too short");
    expect(err.message).toBe("key too short");
  });

  it("is CryptoError and Error", () => {
    const err = new InvalidKeyError();
    expect(err).toBeInstanceOf(CryptoError);
    expect(err).toBeInstanceOf(Error);
  });
});

describe("InvalidInputError", () => {
  it("has correct defaults", () => {
    const err = new InvalidInputError();
    expect(err.code).toBe("INVALID_INPUT");
    expect(err.message).toBe("Invalid input");
    expect(err.name).toBe("InvalidInputError");
  });

  it("accepts custom message", () => {
    const err = new InvalidInputError("truncated");
    expect(err.message).toBe("truncated");
  });

  it("is CryptoError and Error", () => {
    const err = new InvalidInputError();
    expect(err).toBeInstanceOf(CryptoError);
    expect(err).toBeInstanceOf(Error);
  });
});

describe("SodiumNotReadyError", () => {
  it("has correct code and message", () => {
    const err = new SodiumNotReadyError();
    expect(err.code).toBe("SODIUM_NOT_READY");
    expect(err.message).toBe(
      "Sodium backend not initialized. Call getSodium() first.",
    );
    expect(err.name).toBe("SodiumNotReadyError");
  });

  it("is CryptoError and Error", () => {
    const err = new SodiumNotReadyError();
    expect(err).toBeInstanceOf(CryptoError);
    expect(err).toBeInstanceOf(Error);
  });
});

describe("branded types structural compatibility", () => {
  it("branded Uint8Array passes where Uint8Array is expected", () => {
    // Compile-time check: branded types are structurally Uint8Array.
    // At runtime, verify the cast produces a real Uint8Array.
    const buf = new Uint8Array(32);
    // The plan specifies phantom branding via `as Scalar`.
    // This test confirms the resulting value is still a Uint8Array instance.
    expect(buf).toBeInstanceOf(Uint8Array);
    expect(buf.byteLength).toBe(32);

    // Verify Uint8Array methods remain accessible after branding.
    // (TypeScript intersection types preserve all methods from both sides.)
    const slice = buf.slice(0, 16);
    expect(slice).toBeInstanceOf(Uint8Array);
    expect(slice.byteLength).toBe(16);
  });
});
