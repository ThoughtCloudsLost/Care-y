import sodium from "sodium-native";
import { createServer, type Socket, type Server } from "node:net";
import { chmodSync, lstatSync, unlinkSync } from "node:fs";
import { timingSafeEqual, randomBytes } from "node:crypto";
import { getSodium } from "@care-y/crypto";
import { taggedBlindEvaluate } from "./oprf-server.js";
import { ConfigError, CryptoError } from "../errors.js";
import {
  frameMessage,
  frameError,
  createMessageReader,
} from "./ipc-protocol.js";

const SCALAR_BYTES = 32;
const CANARY_BYTES = 8;
const POINT_BYTES = 32;

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

/**
 * Parse a tagged IPC payload.
 *
 * Wire format: [uint16BE tagLen][tag UTF-8 bytes][32-byte blinded element]
 * A payload of exactly POINT_BYTES (32) with no tag prefix is rejected
 * because all evaluations now require a tag (ADR-091).
 */
function parseTaggedPayload(
  payload: Buffer,
): { tag: string; blindedElement: Buffer } | null {
  const TAG_LEN_BYTES = 2;
  if (payload.length < TAG_LEN_BYTES + POINT_BYTES) return null;

  const tagLen = payload.readUInt16BE(0);
  if (tagLen === 0) return null;
  if (payload.length !== TAG_LEN_BYTES + tagLen + POINT_BYTES) return null;

  const tag = payload
    .subarray(TAG_LEN_BYTES, TAG_LEN_BYTES + tagLen)
    .toString("utf8");
  const blindedElement = payload.subarray(TAG_LEN_BYTES + tagLen);
  return { tag, blindedElement };
}

/**
 * Evaluates a single blinded element against the share, deriving a
 * per-tag working share in-process (the master share never leaves).
 * Returns the framed response (success or error).
 */
function evaluatePayload(payload: Buffer, secure: SecureShare): Buffer {
  if (!verifyCanary(secure)) {
    zeroAndExit(secure, "Canary corruption detected");
  }

  const parsed = parseTaggedPayload(payload);
  if (parsed === null) return frameError();

  try {
    const share = getShare(secure);
    const result = taggedBlindEvaluate(
      share,
      parsed.tag,
      parsed.blindedElement,
    );
    return frameMessage(new Uint8Array(result));
  } catch {
    return frameError();
  }
}

export function handleConnection(socket: Socket, secure: SecureShare): void {
  const reader = createMessageReader();

  socket.on("data", (chunk: Buffer) => {
    reader.push(chunk);

    let message = reader.read();
    while (message !== null) {
      if (message.payload === null) {
        socket.write(frameError());
      } else {
        socket.write(evaluatePayload(message.payload, secure));
      }
      message = reader.read();
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

/**
 * Remove a socket file left at the listen path by a previous process.
 *
 * The socket lives in a volume that outlives the container, and a process
 * stopped by SIGKILL (or one that exits before close finishes) leaves the
 * file behind, so the next listen fails with EADDRINUSE. Only a socket is
 * removed; any other file at the path is refused, since this process owns
 * the path and nothing else should be there.
 */
export function removeStaleSocket(socketPath: string): void {
  let isSocket: boolean;
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- operator-controlled socket path from env
    isSocket = lstatSync(socketPath).isSocket();
  } catch (err) {
    if (err instanceof Error && "code" in err && err.code === "ENOENT") return;
    throw err;
  }
  if (!isSocket) {
    throw new ConfigError(
      `OPRF socket path is occupied by a file that is not a socket: ${socketPath}`,
    );
  }
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- operator-controlled socket path from env
  unlinkSync(socketPath);
}

export async function startOprfProcess(config: ProcessConfig): Promise<Server> {
  await getSodium();

  const rawShare = await loadShare(config);
  const secure = secureShare(rawShare);

  const server = createServer((socket) => {
    handleConnection(socket, secure);
  });

  removeStaleSocket(config.socketPath);
  server.listen(config.socketPath, () => {
    // Node creates sockets with umask-derived permissions (typically 0755).
    // Unix socket connect requires write permission. Restrict to owner+group
    // so only the shared oprf-ipc group (GID 3001) can connect.
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- operator-controlled socket path from env
    chmodSync(config.socketPath, 0o770);
    console.log(`OPRF process listening on ${config.socketPath}`);
    dropCredentials(config);
  });

  // Zero the share, then exit once close has removed the socket file.
  // Exiting in the same tick as close() left the file behind. close()
  // waits for open connections, so a fallback exit bounds the wait; a
  // file left by that path is removed at the next start.
  function shutdown(): void {
    sodium.sodium_mprotect_readwrite(secure.buffer);
    sodium.sodium_memzero(secure.buffer);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 2_000).unref();
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
