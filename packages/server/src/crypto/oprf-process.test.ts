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
import { createConnection, Socket } from "node:net";
import { unlinkSync, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sodium from "sodium-native";
import { getSodium } from "@care-y/crypto";
import {
  loadShare,
  secureShare,
  verifyCanary,
  getShare,
  handleConnection,
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

    // 32 bytes is the ristretto255 scalar width the OPRF protocol
    // requires; a share of any other size is unusable by the peer
    // server or the client's blinded evaluation.
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

  /** Build a tagged IPC payload: [uint16BE tagLen][tag UTF-8][32-byte point] */
  function buildTaggedPayload(point: Uint8Array, tag: string): Buffer {
    const tagBuf = Buffer.from(tag, "utf8");
    const payload = Buffer.alloc(2 + tagBuf.length + POINT_BYTES);
    payload.writeUInt16BE(tagBuf.length, 0);
    tagBuf.copy(payload, 2);
    Buffer.from(point).copy(payload, 2 + tagBuf.length);
    return payload;
  }

  it("returns 32-byte evaluated point for valid tagged input", async () => {
    const { requireSodium } = await import("@care-y/crypto");
    const s = requireSodium();
    const scalar = s.crypto_core_ristretto255_scalar_random();
    const point = s.crypto_scalarmult_ristretto255_base(scalar);

    const payload = buildTaggedPayload(point, "volunteer:test-user");
    const response = await sendIpc(socketPath, payload);
    const respLen = response.readUInt32BE(0);

    expect(respLen).toBe(POINT_BYTES);
    expect(response.length).toBe(LENGTH_PREFIX_BYTES + POINT_BYTES);
  });

  it("returns zero-length error for bare 32-byte point (no tag prefix)", async () => {
    const { requireSodium } = await import("@care-y/crypto");
    const s = requireSodium();
    const scalar = s.crypto_core_ristretto255_scalar_random();
    const point = s.crypto_scalarmult_ristretto255_base(scalar);

    // Send bare point without tag prefix; process rejects it
    const response = await sendIpc(socketPath, Buffer.from(point));
    const respLen = response.readUInt32BE(0);

    expect(respLen).toBe(0);
    expect(response.length).toBe(LENGTH_PREFIX_BYTES);
  });

  it("returns zero-length error for wrong-size payload", async () => {
    const badPayload = Buffer.alloc(16);
    const response = await sendIpc(socketPath, badPayload);
    const respLen = response.readUInt32BE(0);

    expect(respLen).toBe(0);
    expect(response.length).toBe(LENGTH_PREFIX_BYTES);
  });

  it("returns consistent results for the same tagged input", async () => {
    const { requireSodium } = await import("@care-y/crypto");
    const s = requireSodium();
    const scalar = s.crypto_core_ristretto255_scalar_random();
    const point = s.crypto_scalarmult_ristretto255_base(scalar);
    const payload = buildTaggedPayload(point, "account:consistency-test");

    const resp1 = await sendIpc(socketPath, payload);
    const resp2 = await sendIpc(socketPath, payload);

    const result1 = resp1.subarray(LENGTH_PREFIX_BYTES);
    const result2 = resp2.subarray(LENGTH_PREFIX_BYTES);
    expect(result1.equals(result2)).toBe(true);
  });

  it("returns different results for different tags", async () => {
    const { requireSodium } = await import("@care-y/crypto");
    const s = requireSodium();
    const scalar = s.crypto_core_ristretto255_scalar_random();
    const point = s.crypto_scalarmult_ristretto255_base(scalar);

    const payloadA = buildTaggedPayload(point, "volunteer:user-a");
    const payloadB = buildTaggedPayload(point, "volunteer:user-b");

    const respA = await sendIpc(socketPath, payloadA);
    const respB = await sendIpc(socketPath, payloadB);

    const resultA = respA.subarray(LENGTH_PREFIX_BYTES);
    const resultB = respB.subarray(LENGTH_PREFIX_BYTES);
    expect(resultA.equals(resultB)).toBe(false);
  });
});

// Wire format: [uint32BE length][uint16BE tagLen][tag][point].
// Docker containers must be rebuilt with the tagged protocol before these pass.
describe.skipIf(!DOCKER_OPRF_AVAILABLE)(
  "IPC protocol (Docker OPRF containers)",
  () => {
    /** Build a tagged IPC payload: [uint16BE tagLen][tag UTF-8][32-byte point] */
    function buildTaggedPayload(point: Uint8Array, tag: string): Buffer {
      const tagBuf = Buffer.from(tag, "utf8");
      const payload = Buffer.alloc(2 + tagBuf.length + POINT_BYTES);
      payload.writeUInt16BE(tagBuf.length, 0);
      tagBuf.copy(payload, 2);
      Buffer.from(point).copy(payload, 2 + tagBuf.length);
      return payload;
    }

    it("returns 32-byte evaluated point for valid tagged input", async () => {
      const { requireSodium } = await import("@care-y/crypto");
      const s = requireSodium();
      const scalar = s.crypto_core_ristretto255_scalar_random();
      const point = s.crypto_scalarmult_ristretto255_base(scalar);

      const payload = buildTaggedPayload(point, "volunteer:docker-test");
      const response = await sendIpc(DOCKER_SOCKET_A, payload);
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

    it("returns consistent results for the same tagged input", async () => {
      const { requireSodium } = await import("@care-y/crypto");
      const s = requireSodium();
      const scalar = s.crypto_core_ristretto255_scalar_random();
      const point = s.crypto_scalarmult_ristretto255_base(scalar);
      const payload = buildTaggedPayload(point, "volunteer:docker-consistency");

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

describe("loadShare (file-based)", () => {
  it("reads 32-byte share from a file path", async () => {
    const shareBytes = randomBytes(32);
    const filePath = join(tmpdir(), `oprf-share-valid-${Date.now()}.bin`);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test file
    writeFileSync(filePath, shareBytes);

    try {
      const result = await loadShare({
        socketPath: "/tmp/test.sock",
        shareFilePath: filePath,
      });
      // 32 bytes is the ristretto255 scalar width the OPRF protocol
      // requires; a share of any other size cannot be used by the peer
      // server or the client's blinded evaluation.
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBe(32);
    } finally {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test file
      unlinkSync(filePath);
    }
  });

  it("rejects file that does not contain exactly 32 bytes", async () => {
    const shortBytes = randomBytes(16);
    const filePath = join(tmpdir(), `oprf-share-short-${Date.now()}.bin`);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test file
    writeFileSync(filePath, shortBytes);

    try {
      await expect(
        loadShare({ socketPath: "/tmp/test.sock", shareFilePath: filePath }),
      ).rejects.toThrow(CryptoError);
    } finally {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test file
      unlinkSync(filePath);
    }
  });

  it("prefers shareHex over shareFilePath when both are provided", async () => {
    const hex = randomBytes(32).toString("hex");
    const result = await loadShare({
      socketPath: "/tmp/test.sock",
      shareHex: hex,
      shareFilePath: "/nonexistent/path",
    });
    // Same ristretto255 scalar width contract as the file-based load.
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBe(32);
  });

  it("falls through to file path when shareHex is empty string", async () => {
    const shareBytes = randomBytes(32);
    const filePath = join(tmpdir(), `oprf-share-fallthrough-${Date.now()}.bin`);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test file
    writeFileSync(filePath, shareBytes);

    try {
      const result = await loadShare({
        socketPath: "/tmp/test.sock",
        shareHex: "",
        shareFilePath: filePath,
      });
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBe(32);
    } finally {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test file
      unlinkSync(filePath);
    }
  });
});

describe.skipIf(!IS_LINUX)(
  "handleConnection IPC edge cases (Linux only)",
  () => {
    const SCALAR_BYTES = 32;
    const TAG_LEN_BYTES = 2;

    function buildSecureShareForTest(): {
      secure: ReturnType<typeof secureShare>;
      cleanup: () => void;
    } {
      const raw = Buffer.from(randomBytes(SCALAR_BYTES));
      const secure = secureShare(raw);
      return {
        secure,
        cleanup: (): void => {
          sodium.sodium_mprotect_readwrite(secure.buffer);
          sodium.sodium_memzero(secure.buffer);
        },
      };
    }

    /** Collect all data written to the mock socket. */
    function createMockSocket(): {
      socket: Socket;
      written: Buffer[];
    } {
      const written: Buffer[] = [];
      const socket = new Socket();
      // Prevent actual network operations
      socket.destroy();
      // Replace write to capture output
      const origWrite = socket.write.bind(socket);
      socket.write = ((
        data: Uint8Array | string,
        encodingOrCb?: BufferEncoding | ((error?: Error | null) => void),
        cb?: (error?: Error | null) => void,
      ): boolean => {
        written.push(Buffer.from(data as Uint8Array));
        const callback = typeof encodingOrCb === "function" ? encodingOrCb : cb;
        if (callback != null) callback(null);
        return true;
      }) as typeof socket.write;
      // Re-enable the writable state so event listeners can be attached
      socket.writable = true;
      // Suppress error events from the destroyed socket
      socket.on("error", () => undefined);
      void origWrite;
      return { socket, written };
    }

    it("responds with error frame when IPC message has null payload (zero-length prefix)", () => {
      const { secure, cleanup } = buildSecureShareForTest();
      try {
        const { socket, written } = createMockSocket();
        handleConnection(socket, secure);

        // Send a zero-length IPC frame: uint32BE(0)
        const errorFrame = Buffer.alloc(LENGTH_PREFIX_BYTES);
        errorFrame.writeUInt32BE(0, 0);
        socket.emit("data", errorFrame);

        expect(written.length).toBe(1);
        // Response should be an error frame (4-byte prefix with length 0)
        expect(written[0]!.length).toBe(LENGTH_PREFIX_BYTES);
        expect(written[0]!.readUInt32BE(0)).toBe(0);
      } finally {
        cleanup();
      }
    });

    it("responds with error frame for tagged payload with zero-length tag", () => {
      const { secure, cleanup } = buildSecureShareForTest();
      try {
        const { socket, written } = createMockSocket();
        handleConnection(socket, secure);

        // Build payload: [uint16BE(0) tag_len=0][32 bytes point]
        // parseTaggedPayload returns null when tagLen === 0
        const payload = Buffer.alloc(TAG_LEN_BYTES + SCALAR_BYTES);
        payload.writeUInt16BE(0, 0);
        randomBytes(SCALAR_BYTES).copy(payload, TAG_LEN_BYTES);

        // Wrap in IPC frame
        const frame = Buffer.alloc(LENGTH_PREFIX_BYTES + payload.length);
        frame.writeUInt32BE(payload.length, 0);
        payload.copy(frame, LENGTH_PREFIX_BYTES);
        socket.emit("data", frame);

        expect(written.length).toBe(1);
        expect(written[0]!.readUInt32BE(0)).toBe(0);
      } finally {
        cleanup();
      }
    });

    it("responds with error frame for tagged payload with mismatched total length", () => {
      const { secure, cleanup } = buildSecureShareForTest();
      try {
        const { socket, written } = createMockSocket();
        handleConnection(socket, secure);

        // Build payload: [uint16BE(5) tag_len=5][3 bytes of tag][32 bytes point]
        // tagLen says 5, but we only provide 3 bytes of tag, then 32 bytes point
        // Total: 2 + 3 + 32 = 37, but expected: 2 + 5 + 32 = 39
        const tagLen = 5;
        const actualTagBytes = 3;
        const payload = Buffer.alloc(
          TAG_LEN_BYTES + actualTagBytes + SCALAR_BYTES,
        );
        payload.writeUInt16BE(tagLen, 0);
        Buffer.from("abc").copy(payload, TAG_LEN_BYTES);
        randomBytes(SCALAR_BYTES).copy(payload, TAG_LEN_BYTES + actualTagBytes);

        const frame = Buffer.alloc(LENGTH_PREFIX_BYTES + payload.length);
        frame.writeUInt32BE(payload.length, 0);
        payload.copy(frame, LENGTH_PREFIX_BYTES);
        socket.emit("data", frame);

        expect(written.length).toBe(1);
        expect(written[0]!.readUInt32BE(0)).toBe(0);
      } finally {
        cleanup();
      }
    });

    it("responds with error frame when taggedBlindEvaluate throws (invalid point)", () => {
      const { secure, cleanup } = buildSecureShareForTest();
      try {
        const { socket, written } = createMockSocket();
        handleConnection(socket, secure);

        // Build a well-formed tagged payload but with garbage point bytes
        // that will cause taggedBlindEvaluate to throw
        const tag = "test:invalid-point";
        const tagBuf = Buffer.from(tag, "utf8");
        const payload = Buffer.alloc(
          TAG_LEN_BYTES + tagBuf.length + SCALAR_BYTES,
        );
        payload.writeUInt16BE(tagBuf.length, 0);
        tagBuf.copy(payload, TAG_LEN_BYTES);
        // Fill point with 0xFF bytes (not a valid ristretto255 point)
        Buffer.alloc(SCALAR_BYTES, 0xff).copy(
          payload,
          TAG_LEN_BYTES + tagBuf.length,
        );

        const frame = Buffer.alloc(LENGTH_PREFIX_BYTES + payload.length);
        frame.writeUInt32BE(payload.length, 0);
        payload.copy(frame, LENGTH_PREFIX_BYTES);
        socket.emit("data", frame);

        expect(written.length).toBe(1);
        // evaluatePayload catches the crypto error and returns frameError()
        expect(written[0]!.readUInt32BE(0)).toBe(0);
      } finally {
        cleanup();
      }
    });
  },
);

describe.skipIf(!IS_LINUX)(
  "evaluatePayload canary corruption (Linux only)",
  () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("calls process.exit(1) when canary is corrupted", () => {
      const raw = Buffer.from(randomBytes(32));
      const secure = secureShare(raw);

      const exitSpy = vi
        .spyOn(process, "exit")
        .mockImplementation(() => undefined as never);
      const errorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);

      // Corrupt the canary reference so verifyCanary returns false
      randomBytes(8).copy(secure.canaryRef);

      const socket = (() => {
        const s = new Socket();
        s.destroy();
        s.write = ((
          _data: Uint8Array | string,
          encodingOrCb?: BufferEncoding | ((error?: Error | null) => void),
          cb?: (error?: Error | null) => void,
        ): boolean => {
          const callback =
            typeof encodingOrCb === "function" ? encodingOrCb : cb;
          if (callback != null) callback(null);
          return true;
        }) as typeof s.write;
        s.writable = true;
        s.on("error", () => undefined);
        return s;
      })();

      handleConnection(socket, secure);

      // Send a valid-looking tagged payload to trigger evaluatePayload
      const tag = "test:canary-check";
      const tagBuf = Buffer.from(tag, "utf8");
      const payload = Buffer.alloc(2 + tagBuf.length + 32);
      payload.writeUInt16BE(tagBuf.length, 0);
      tagBuf.copy(payload, 2);
      randomBytes(32).copy(payload, 2 + tagBuf.length);

      const frame = Buffer.alloc(4 + payload.length);
      frame.writeUInt32BE(payload.length, 0);
      payload.copy(frame, 4);
      socket.emit("data", frame);

      expect(exitSpy).toHaveBeenCalledWith(1);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Canary corruption"),
      );
    });
  },
);

describe.skipIf(!IS_LINUX)(
  "dropCredentials mixed empty/non-empty (Linux only)",
  () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("skips credential drop when dropUser is set but dropGroup is empty", async () => {
      const socketPath = join(
        tmpdir(),
        `oprf-dropcred-mixed-a-${Date.now()}.sock`,
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
        dropUser: "oprfuser",
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

    it("skips credential drop when dropGroup is set but dropUser is empty", async () => {
      const socketPath = join(
        tmpdir(),
        `oprf-dropcred-mixed-b-${Date.now()}.sock`,
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
        dropGroup: "oprfgroup",
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

    it("logs non-Error thrown value via String() fallback when setgid throws a string", async () => {
      const socketPath = join(
        tmpdir(),
        `oprf-dropcred-nonerr-${Date.now()}.sock`,
      );
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- deterministic temp path for test socket
      if (existsSync(socketPath)) unlinkSync(socketPath);

      const getuidSpy = vi.spyOn(process, "getuid").mockImplementation(() => 0);
      const setgidSpy = vi.spyOn(process, "setgid").mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error -- testing the String(err) fallback path
        throw "raw string rejection";
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
            "raw string rejection",
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
  },
);
