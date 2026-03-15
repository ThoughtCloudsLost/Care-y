import sodium from "sodium-native";
import { createServer, type Socket, type Server } from "node:net";
import { timingSafeEqual, randomBytes } from "node:crypto";
import { getSodium } from "@care-y/crypto";
import { blindEvaluate } from "./oprf-server.js";
import { CryptoError } from "../errors.js";

const SCALAR_BYTES = 32;
const CANARY_BYTES = 8;
const POINT_BYTES = 32;

/** IPC message format: 4-byte length prefix + payload */
const LENGTH_PREFIX_BYTES = 4;

export interface ProcessConfig {
  readonly socketPath: string;
  readonly shareHex?: string;
  readonly shareFilePath?: string;
  readonly dropUser?: string;
  readonly dropGroup?: string;
}

export interface SecureShare {
  /** sodium_malloc'd buffer: [share(32) | canary(8)] */
  readonly buffer: Buffer;
  /** Canary reference for verification */
  readonly canaryRef: Buffer;
}

export async function loadShare(config: ProcessConfig): Promise<Buffer> {
  if (config.shareHex != null && config.shareHex.length > 0) {
    const buf = Buffer.from(config.shareHex, "hex");
    if (buf.length !== SCALAR_BYTES) {
      throw new CryptoError(
        `Share must be ${String(SCALAR_BYTES)} bytes, got ${String(buf.length)}`,
      );
    }
    return buf;
  }
  if (config.shareFilePath != null && config.shareFilePath.length > 0) {
    const { readFileSync } = await import("node:fs");
    const raw = readFileSync(config.shareFilePath);
    if (raw.length !== SCALAR_BYTES) {
      throw new CryptoError(
        `Share file must contain exactly ${String(SCALAR_BYTES)} bytes`,
      );
    }
    return raw;
  }
  throw new CryptoError("Either OPRF_SHARE_HEX or OPRF_SHARE_FILE must be set");
}

export function secureShare(rawShare: Buffer): SecureShare {
  const totalSize = SCALAR_BYTES + CANARY_BYTES;
  const buffer = sodium.sodium_malloc(totalSize);

  rawShare.copy(buffer, 0);
  rawShare.fill(0);

  const canaryRef = randomBytes(CANARY_BYTES);
  canaryRef.copy(buffer, SCALAR_BYTES);

  sodium.sodium_mlock(buffer);
  sodium.sodium_mprotect_readonly(buffer);

  return { buffer, canaryRef };
}

export function verifyCanary(secure: SecureShare): boolean {
  const currentCanary = secure.buffer.subarray(
    SCALAR_BYTES,
    SCALAR_BYTES + CANARY_BYTES,
  );
  return timingSafeEqual(currentCanary, secure.canaryRef);
}

export function getShare(secure: SecureShare): Buffer {
  return secure.buffer.subarray(0, SCALAR_BYTES);
}

export function zeroAndExit(secure: SecureShare, reason: string): never {
  console.error(`OPRF process terminating: ${reason}`);
  sodium.sodium_mprotect_readwrite(secure.buffer);
  sodium.sodium_memzero(secure.buffer);
  process.exit(1);
}

export function handleConnection(socket: Socket, secure: SecureShare): void {
  let pendingData = Buffer.alloc(0);

  socket.on("data", (chunk: Buffer) => {
    pendingData = Buffer.concat([pendingData, chunk]);

    while (pendingData.length >= LENGTH_PREFIX_BYTES) {
      const msgLen = pendingData.readUInt32BE(0);
      if (pendingData.length < LENGTH_PREFIX_BYTES + msgLen) break;

      const payload = pendingData.subarray(
        LENGTH_PREFIX_BYTES,
        LENGTH_PREFIX_BYTES + msgLen,
      );
      pendingData = pendingData.subarray(LENGTH_PREFIX_BYTES + msgLen);

      // Verify canary before every evaluation
      if (!verifyCanary(secure)) {
        zeroAndExit(secure, "Canary corruption detected");
      }

      if (payload.length !== POINT_BYTES) {
        const errBuf = Buffer.alloc(LENGTH_PREFIX_BYTES);
        errBuf.writeUInt32BE(0, 0);
        socket.write(errBuf);
        continue;
      }

      try {
        const share = getShare(secure);
        const result = blindEvaluate(share, payload);

        const response = Buffer.alloc(LENGTH_PREFIX_BYTES + POINT_BYTES);
        response.writeUInt32BE(POINT_BYTES, 0);
        Buffer.from(result).copy(response, LENGTH_PREFIX_BYTES);
        socket.write(response);
      } catch {
        const errBuf = Buffer.alloc(LENGTH_PREFIX_BYTES);
        errBuf.writeUInt32BE(0, 0);
        socket.write(errBuf);
      }
    }
  });
}

function dropCredentials(config: ProcessConfig): void {
  if (config.dropUser == null || config.dropGroup == null) return;
  if (config.dropUser.length === 0 || config.dropGroup.length === 0) return;
  const uid = process.getuid?.();
  if (uid == null || uid !== 0) return;

  try {
    process.setgid?.(config.dropGroup);
    process.setuid?.(config.dropUser);
    console.log(
      `Credentials dropped to ${config.dropUser}:${config.dropGroup}`,
    );
  } catch (err) {
    console.error(
      "Credential drop failed:",
      err instanceof Error ? err.message : String(err),
    );
    process.exit(1);
  }
}

export async function startOprfProcess(config: ProcessConfig): Promise<Server> {
  await getSodium();

  const rawShare = await loadShare(config);
  const secure = secureShare(rawShare);

  const server = createServer((socket) => {
    handleConnection(socket, secure);
  });

  server.listen(config.socketPath, () => {
    console.log(`OPRF process listening on ${config.socketPath}`);
    dropCredentials(config);
  });

  function shutdown(): void {
    server.close();
    sodium.sodium_mprotect_readwrite(secure.buffer);
    sodium.sodium_memzero(secure.buffer);
    process.exit(0);
  }

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  return server;
}

// --- Entrypoint (when run directly) ---
const entryArg = process.argv[1] ?? "";
if (
  entryArg.endsWith("oprf-process.ts") ||
  entryArg.endsWith("oprf-process.js")
) {
  const socketPath = process.env.OPRF_SOCKET_PATH;
  if (socketPath == null || socketPath.length === 0) {
    console.error("OPRF_SOCKET_PATH is required");
    process.exit(1);
  }

  void startOprfProcess({
    socketPath,
    shareHex: process.env.OPRF_SHARE_HEX,
    shareFilePath: process.env.OPRF_SHARE_FILE,
    dropUser: process.env.OPRF_DROP_USER,
    dropGroup: process.env.OPRF_DROP_GROUP,
  });
}
