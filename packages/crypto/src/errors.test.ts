import { describe, it, expect } from "vitest";
import {
  CryptoError,
  DecryptionError,
  InvalidKeyError,
  InvalidInputError,
  SodiumNotReadyError,
} from "./errors.js";

// code is part of the @care-y/crypto public API; server tRPC error mapping depends on specific string values
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
