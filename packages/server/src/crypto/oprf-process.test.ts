import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  vi,
  afterEach,
} from "vitest";
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
import { DOCKER_OPRF_AVAILABLE, DOCKER_SOCKET_A } from "../test-utils.js";

const IS_LINUX = process.platform === "linux";
const LENGTH_PREFIX_BYTES = 4;
const POINT_BYTES = 32;

function sendIpc(targetSocket: string, payload: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const socket = createConnection(targetSocket);
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

  it("memzero clears the buffer completely", () => {
    const raw = Buffer.from(randomBytes(32));
    const secure = secureShare(raw);

    sodium.sodium_mprotect_readwrite(secure.buffer);
    sodium.sodium_memzero(secure.buffer);

    expect(secure.buffer.every((b) => b === 0)).toBe(true);
  });
});

// Wire format: [uint32BE length][payload]. Guards backward compatibility with oprf-ipc client.
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

  it("returns 32-byte evaluated point for valid 32-byte input", async () => {
    const { requireSodium } = await import("@care-y/crypto");
    const s = requireSodium();
    const scalar = s.crypto_core_ristretto255_scalar_random();
    const point = s.crypto_scalarmult_ristretto255_base(scalar);

    const response = await sendIpc(socketPath, Buffer.from(point));
    const respLen = response.readUInt32BE(0);

    expect(respLen).toBe(POINT_BYTES);
    expect(response.length).toBe(LENGTH_PREFIX_BYTES + POINT_BYTES);
  });

  it("returns zero-length error for wrong-size payload", async () => {
    const badPayload = Buffer.alloc(16);
    const response = await sendIpc(socketPath, badPayload);
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

    const resp1 = await sendIpc(socketPath, payload);
    const resp2 = await sendIpc(socketPath, payload);

    const result1 = resp1.subarray(LENGTH_PREFIX_BYTES);
    const result2 = resp2.subarray(LENGTH_PREFIX_BYTES);
    expect(result1.equals(result2)).toBe(true);
  });
});

// Wire format: [uint32BE length][payload]. Guards backward compatibility with oprf-ipc client.
describe.skipIf(!DOCKER_OPRF_AVAILABLE)(
  "IPC protocol (Docker OPRF containers)",
  () => {
    it("returns 32-byte evaluated point for valid 32-byte input", async () => {
      const { requireSodium } = await import("@care-y/crypto");
      const s = requireSodium();
      const scalar = s.crypto_core_ristretto255_scalar_random();
      const point = s.crypto_scalarmult_ristretto255_base(scalar);

      const response = await sendIpc(DOCKER_SOCKET_A, Buffer.from(point));
      const respLen = response.readUInt32BE(0);

      expect(respLen).toBe(POINT_BYTES);
      expect(response.length).toBe(LENGTH_PREFIX_BYTES + POINT_BYTES);
    });

    it("returns zero-length error for wrong-size payload", async () => {
      const badPayload = Buffer.alloc(16);
      const response = await sendIpc(DOCKER_SOCKET_A, badPayload);
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

      const resp1 = await sendIpc(DOCKER_SOCKET_A, payload);
      const resp2 = await sendIpc(DOCKER_SOCKET_A, payload);

      const result1 = resp1.subarray(LENGTH_PREFIX_BYTES);
      const result2 = resp2.subarray(LENGTH_PREFIX_BYTES);
      expect(result1.equals(result2)).toBe(true);
    });
  },
);

describe.skipIf(!IS_LINUX)("dropCredentials (via startOprfProcess)", () => {
  const socketDir = tmpdir();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("skips credential drop when dropUser is null", async () => {
    const socketPath = join(socketDir, `oprf-dropcred-null-${Date.now()}.sock`);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test socket
    if (existsSync(socketPath)) unlinkSync(socketPath);

    const setuidSpy = vi
      .spyOn(process, "setuid")
      .mockImplementation(() => undefined);
    const setgidSpy = vi
      .spyOn(process, "setgid")
      .mockImplementation(() => undefined);

    const config: ProcessConfig = {
      socketPath,
      shareHex: randomBytes(32).toString("hex"),
      dropUser: undefined,
      dropGroup: undefined,
    };
    const server = await startOprfProcess(config);

    // Wait for the listen callback to fire (where dropCredentials is called)
    await new Promise<void>((resolve) => {
      const check = (): void => {
        if (server.listening) resolve();
        else setTimeout(check, 10);
      };
      check();
    });

    expect(setuidSpy).not.toHaveBeenCalled();
    expect(setgidSpy).not.toHaveBeenCalled();

    server.close();
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test socket
    if (existsSync(socketPath)) unlinkSync(socketPath);
  });

  it("skips credential drop when dropUser and dropGroup are empty strings", async () => {
    const socketPath = join(
      socketDir,
      `oprf-dropcred-empty-${Date.now()}.sock`,
    );
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test socket
    if (existsSync(socketPath)) unlinkSync(socketPath);

    const setuidSpy = vi
      .spyOn(process, "setuid")
      .mockImplementation(() => undefined);
    const setgidSpy = vi
      .spyOn(process, "setgid")
      .mockImplementation(() => undefined);

    const config: ProcessConfig = {
      socketPath,
      shareHex: randomBytes(32).toString("hex"),
      dropUser: "",
      dropGroup: "",
    };
    const server = await startOprfProcess(config);

    await new Promise<void>((resolve) => {
      const check = (): void => {
        if (server.listening) resolve();
        else setTimeout(check, 10);
      };
      check();
    });

    expect(setuidSpy).not.toHaveBeenCalled();
    expect(setgidSpy).not.toHaveBeenCalled();

    server.close();
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test socket
    if (existsSync(socketPath)) unlinkSync(socketPath);
  });

  it("skips credential drop when getuid returns undefined (non-POSIX)", async () => {
    const socketPath = join(socketDir, `oprf-dropcred-nuid-${Date.now()}.sock`);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test socket
    if (existsSync(socketPath)) unlinkSync(socketPath);

    const getuidSpy = vi
      .spyOn(process, "getuid")
      .mockImplementation(() => undefined as unknown as number);
    const setuidSpy = vi
      .spyOn(process, "setuid")
      .mockImplementation(() => undefined);
    const setgidSpy = vi
      .spyOn(process, "setgid")
      .mockImplementation(() => undefined);

    const config: ProcessConfig = {
      socketPath,
      shareHex: randomBytes(32).toString("hex"),
      dropUser: "oprf",
      dropGroup: "oprf",
    };
    const server = await startOprfProcess(config);

    await new Promise<void>((resolve) => {
      const check = (): void => {
        if (server.listening) resolve();
        else setTimeout(check, 10);
      };
      check();
    });

    expect(setuidSpy).not.toHaveBeenCalled();
    expect(setgidSpy).not.toHaveBeenCalled();

    server.close();
    getuidSpy.mockRestore();
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test socket
    if (existsSync(socketPath)) unlinkSync(socketPath);
  });

  it("skips credential drop when getuid returns non-zero (not root)", async () => {
    const socketPath = join(socketDir, `oprf-dropcred-1000-${Date.now()}.sock`);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test socket
    if (existsSync(socketPath)) unlinkSync(socketPath);

    const getuidSpy = vi
      .spyOn(process, "getuid")
      .mockImplementation(() => 1000);
    const setuidSpy = vi
      .spyOn(process, "setuid")
      .mockImplementation(() => undefined);
    const setgidSpy = vi
      .spyOn(process, "setgid")
      .mockImplementation(() => undefined);

    const config: ProcessConfig = {
      socketPath,
      shareHex: randomBytes(32).toString("hex"),
      dropUser: "oprf",
      dropGroup: "oprf",
    };
    const server = await startOprfProcess(config);

    await new Promise<void>((resolve) => {
      const check = (): void => {
        if (server.listening) resolve();
        else setTimeout(check, 10);
      };
      check();
    });

    expect(setuidSpy).not.toHaveBeenCalled();
    expect(setgidSpy).not.toHaveBeenCalled();

    server.close();
    getuidSpy.mockRestore();
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test socket
    if (existsSync(socketPath)) unlinkSync(socketPath);
  });

  it("calls setgid and setuid when running as root (uid 0)", async () => {
    const socketPath = join(socketDir, `oprf-dropcred-root-${Date.now()}.sock`);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test socket
    if (existsSync(socketPath)) unlinkSync(socketPath);

    const getuidSpy = vi.spyOn(process, "getuid").mockImplementation(() => 0);
    const setuidSpy = vi
      .spyOn(process, "setuid")
      .mockImplementation(() => undefined);
    const setgidSpy = vi
      .spyOn(process, "setgid")
      .mockImplementation(() => undefined);
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    const config: ProcessConfig = {
      socketPath,
      shareHex: randomBytes(32).toString("hex"),
      dropUser: "oprfuser",
      dropGroup: "oprfgroup",
    };
    const server = await startOprfProcess(config);

    await vi.waitFor(
      () => {
        expect(setgidSpy).toHaveBeenCalledWith("oprfgroup");
      },
      { timeout: 2000 },
    );
    expect(setuidSpy).toHaveBeenCalledWith("oprfuser");
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("Credentials dropped"),
    );

    server.close();
    getuidSpy.mockRestore();
    logSpy.mockRestore();
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test socket
    if (existsSync(socketPath)) unlinkSync(socketPath);
  });

  it("logs error and calls process.exit(1) when setgid throws", async () => {
    const socketPath = join(socketDir, `oprf-dropcred-fail-${Date.now()}.sock`);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test socket
    if (existsSync(socketPath)) unlinkSync(socketPath);

    const getuidSpy = vi.spyOn(process, "getuid").mockImplementation(() => 0);
    const setgidSpy = vi.spyOn(process, "setgid").mockImplementation(() => {
      throw new Error("EPERM: operation not permitted");
    });
    const setuidSpy = vi
      .spyOn(process, "setuid")
      .mockImplementation(() => undefined);
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const config: ProcessConfig = {
      socketPath,
      shareHex: randomBytes(32).toString("hex"),
      dropUser: "oprfuser",
      dropGroup: "oprfgroup",
    };
    const server = await startOprfProcess(config);

    await vi.waitFor(
      () => {
        expect(errorSpy).toHaveBeenCalledWith(
          "Credential drop failed:",
          "EPERM: operation not permitted",
        );
      },
      { timeout: 2000 },
    );
    expect(exitSpy).toHaveBeenCalledWith(1);

    server.close();
    getuidSpy.mockRestore();
    setgidSpy.mockRestore();
    setuidSpy.mockRestore();
    exitSpy.mockRestore();
    errorSpy.mockRestore();
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test socket
    if (existsSync(socketPath)) unlinkSync(socketPath);
  });
});

describe.skipIf(!IS_LINUX)("shutdown (via signal handler)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("clears secure buffer and exits with 0 on SIGTERM", async () => {
    const socketPath = join(tmpdir(), `oprf-shutdown-${Date.now()}.sock`);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test socket
    if (existsSync(socketPath)) unlinkSync(socketPath);

    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);

    // Record SIGTERM listener count before starting, so we can find the new one
    const beforeCount = process.listenerCount("SIGTERM");

    const config: ProcessConfig = {
      socketPath,
      shareHex: randomBytes(32).toString("hex"),
    };
    const server = await startOprfProcess(config);

    await new Promise<void>((resolve) => {
      const check = (): void => {
        if (server.listening) resolve();
        else setTimeout(check, 10);
      };
      check();
    });

    // startOprfProcess registered new SIGTERM and SIGINT handlers
    const sigTermListeners = process.listeners("SIGTERM");
    expect(sigTermListeners.length).toBeGreaterThan(beforeCount);

    // Invoke the last-registered SIGTERM handler (the shutdown function)
    const shutdownHandler = sigTermListeners[sigTermListeners.length - 1] as (
      ...args: unknown[]
    ) => void;
    shutdownHandler();

    expect(exitSpy).toHaveBeenCalledWith(0);

    // Clean up the registered listeners to avoid cross-test pollution
    process.removeListener("SIGTERM", shutdownHandler);
    const sigIntListeners = process.listeners("SIGINT");
    const sigIntHandler = sigIntListeners[sigIntListeners.length - 1] as
      ((...args: unknown[]) => void) | undefined;
    if (sigIntHandler != null) {
      process.removeListener("SIGINT", sigIntHandler);
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test socket
    if (existsSync(socketPath)) unlinkSync(socketPath);
  });
});
