import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomBytes } from "node:crypto";
import { createConnection } from "node:net";
import { unlinkSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sodium from "sodium-native";
import { getSodium } from "@care-y/crypto";
import {
  loadShare,
  secureShare,
  verifyCanary,
  getShare,
  startOprfProcess,
  type ProcessConfig,
} from "./oprf-process.js";
import { CryptoError } from "../errors.js";

const IS_LINUX = process.platform === "linux";
const LENGTH_PREFIX_BYTES = 4;
const POINT_BYTES = 32;

beforeAll(async () => {
  await getSodium();
});

describe("loadShare", () => {
  it("returns 32-byte buffer from valid hex", async () => {
    const hex = randomBytes(32).toString("hex");
    const result = await loadShare({
      socketPath: "/tmp/test.sock",
      shareHex: hex,
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBe(32);
  });

  it("rejects hex that decodes to wrong length", async () => {
    const shortHex = randomBytes(16).toString("hex");

    await expect(
      loadShare({ socketPath: "/tmp/test.sock", shareHex: shortHex }),
    ).rejects.toThrow(CryptoError);
  });

  it("rejects empty hex string", async () => {
    await expect(
      loadShare({ socketPath: "/tmp/test.sock", shareHex: "" }),
    ).rejects.toThrow(CryptoError);
  });

  it("throws when neither hex nor file path provided", async () => {
    await expect(loadShare({ socketPath: "/tmp/test.sock" })).rejects.toThrow(
      CryptoError,
    );
  });

  it("throws when neither hex nor file path provided with descriptive message", async () => {
    await expect(loadShare({ socketPath: "/tmp/test.sock" })).rejects.toThrow(
      /OPRF_SHARE_HEX.*OPRF_SHARE_FILE/,
    );
  });
});

describe.skipIf(!IS_LINUX)("secureShare (Linux only)", () => {
  it("allocates buffer and zeros the original", () => {
    const raw = Buffer.from(randomBytes(32));
    const originalCopy = Buffer.from(raw);
    const secure = secureShare(raw);

    // Original was zeroed
    expect(raw.every((b) => b === 0)).toBe(true);

    // Secure buffer contains the share data
    const share = getShare(secure);
    expect(Buffer.from(share).equals(originalCopy)).toBe(true);

    // Cleanup
    sodium.sodium_mprotect_readwrite(secure.buffer);
    sodium.sodium_memzero(secure.buffer);
  });

  it("canary is verifiable after secureShare", () => {
    const raw = Buffer.from(randomBytes(32));
    const secure = secureShare(raw);

    expect(verifyCanary(secure)).toBe(true);

    // Cleanup
    sodium.sodium_mprotect_readwrite(secure.buffer);
    sodium.sodium_memzero(secure.buffer);
  });

  it("buffer is 40 bytes (32 share + 8 canary)", () => {
    const raw = Buffer.from(randomBytes(32));
    const secure = secureShare(raw);

    expect(secure.buffer.length).toBe(40);

    // Cleanup
    sodium.sodium_mprotect_readwrite(secure.buffer);
    sodium.sodium_memzero(secure.buffer);
  });

  it("canaryRef is 8 bytes", () => {
    const raw = Buffer.from(randomBytes(32));
    const secure = secureShare(raw);

    expect(secure.canaryRef.length).toBe(8);

    // Cleanup
    sodium.sodium_mprotect_readwrite(secure.buffer);
    sodium.sodium_memzero(secure.buffer);
  });

  it("memzero clears the buffer completely", () => {
    const raw = Buffer.from(randomBytes(32));
    const secure = secureShare(raw);

    sodium.sodium_mprotect_readwrite(secure.buffer);
    sodium.sodium_memzero(secure.buffer);

    expect(secure.buffer.every((b) => b === 0)).toBe(true);
  });
});

describe.skipIf(!IS_LINUX)("IPC protocol (Linux only)", () => {
  const socketPath = join(tmpdir(), `oprf-test-${Date.now()}.sock`);
  let cleanup: (() => void) | undefined;

  const testShareHex = randomBytes(32).toString("hex");

  beforeAll(async () => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test socket
    if (existsSync(socketPath)) unlinkSync(socketPath);

    const config: ProcessConfig = {
      socketPath,
      shareHex: testShareHex,
    };
    const server = await startOprfProcess(config);
    cleanup = () => {
      server.close();
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test socket
      if (existsSync(socketPath)) unlinkSync(socketPath);
    };

    // Wait for server to be listening
    await new Promise<void>((resolve) => {
      const check = (): void => {
        if (server.listening) {
          resolve();
        } else {
          setTimeout(check, 10);
        }
      };
      check();
    });
  });

  afterAll(() => {
    cleanup?.();
  });

  function sendIpc(payload: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const socket = createConnection(socketPath);
      const msg = Buffer.alloc(LENGTH_PREFIX_BYTES + payload.length);
      msg.writeUInt32BE(payload.length, 0);
      payload.copy(msg, LENGTH_PREFIX_BYTES);
      socket.write(msg);

      let received = Buffer.alloc(0);
      socket.on("data", (chunk: Buffer) => {
        received = Buffer.concat([received, chunk]);
        if (received.length >= LENGTH_PREFIX_BYTES) {
          const respLen = received.readUInt32BE(0);
          if (received.length >= LENGTH_PREFIX_BYTES + respLen) {
            socket.destroy();
            resolve(received);
          }
        }
      });

      socket.on("error", reject);
      setTimeout(() => {
        socket.destroy();
        reject(new Error("IPC timeout"));
      }, 5_000);
    });
  }

  it("returns 32-byte evaluated point for valid 32-byte input", async () => {
    const { requireSodium } = await import("@care-y/crypto");
    const s = requireSodium();
    const scalar = s.crypto_core_ristretto255_scalar_random();
    const point = s.crypto_scalarmult_ristretto255_base(scalar);

    const response = await sendIpc(Buffer.from(point));
    const respLen = response.readUInt32BE(0);

    expect(respLen).toBe(POINT_BYTES);
    expect(response.length).toBe(LENGTH_PREFIX_BYTES + POINT_BYTES);
  });

  it("returns zero-length error for wrong-size payload", async () => {
    const badPayload = Buffer.alloc(16);
    const response = await sendIpc(badPayload);
    const respLen = response.readUInt32BE(0);

    expect(respLen).toBe(0);
    expect(response.length).toBe(LENGTH_PREFIX_BYTES);
  });

  it("returns consistent results for the same input", async () => {
    const { requireSodium } = await import("@care-y/crypto");
    const s = requireSodium();
    const scalar = s.crypto_core_ristretto255_scalar_random();
    const point = s.crypto_scalarmult_ristretto255_base(scalar);
    const payload = Buffer.from(point);

    const resp1 = await sendIpc(payload);
    const resp2 = await sendIpc(payload);

    const result1 = resp1.subarray(LENGTH_PREFIX_BYTES);
    const result2 = resp2.subarray(LENGTH_PREFIX_BYTES);
    expect(result1.equals(result2)).toBe(true);
  });
});
