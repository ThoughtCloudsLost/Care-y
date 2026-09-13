import { createConnection, type Socket } from "node:net";
import { lagrangeInterpolate, toRistrettoPoint } from "@care-y/crypto";
import { OprfError } from "../errors.js";
import { frameMessage, createMessageReader } from "./ipc-protocol.js";

const POINT_BYTES = 32;
const IPC_TIMEOUT_MS = 5_000;
const TAG_LEN_BYTES = 2;

/** Transport-agnostic OPRF evaluation interface. */
export interface OprfEvaluator {
  /**
   * Evaluates a blinded element under a per-tag derived key.
   * Fans out to both processes, combines via Lagrange interpolation.
   * @param blindedElement - 32-byte blinded ristretto255 point
   * @param tag - Public tag string (e.g. "volunteer:<userId>")
   * @returns The combined evaluated element
   * @throws OprfError if either process fails, times out, or returns invalid data
   */
  evaluate(blindedElement: Uint8Array, tag: string): Promise<Uint8Array>;
  /** Gracefully close connections */
  close(): void;
}

interface IpcConfig {
  readonly socketPathA: string;
  readonly socketPathB: string;
}

/**
 * Build the tagged IPC payload.
 * Wire format: [uint16BE tagLen][tag UTF-8 bytes][32-byte blinded element]
 */
function buildTaggedPayload(blindedElement: Uint8Array, tag: string): Buffer {
  const tagBuf = Buffer.from(tag, "utf8");
  const payload = Buffer.alloc(TAG_LEN_BYTES + tagBuf.length + POINT_BYTES);
  payload.writeUInt16BE(tagBuf.length, 0);
  tagBuf.copy(payload, TAG_LEN_BYTES);
  Buffer.from(blindedElement).copy(payload, TAG_LEN_BYTES + tagBuf.length);
  return payload;
}

/**
 * Sends a payload to an OPRF subprocess and waits for a single response.
 * Opens a fresh connection per call (negligible overhead at CARE-Y scale).
 */
async function sendToProcess(
  socketPath: string,
  payload: Buffer,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const socket: Socket = createConnection(socketPath);
    const reader = createMessageReader();

    const timeoutId = setTimeout(() => {
      socket.destroy();
      reject(new OprfError(`OPRF process timeout (${socketPath})`));
    }, IPC_TIMEOUT_MS);

    socket.write(frameMessage(payload));

    socket.on("data", (chunk: Buffer) => {
      reader.push(chunk);
      const message = reader.read();
      if (!message) return;

      clearTimeout(timeoutId);
      socket.destroy();

      if (message.payload === null) {
        reject(new OprfError(`OPRF process returned error (${socketPath})`));
        return;
      }

      resolve(message.payload);
    });

    socket.on("error", (err: Error) => {
      clearTimeout(timeoutId);
      reject(
        new OprfError(
          `OPRF process connection failed (${socketPath}): ${err.message}`,
        ),
      );
    });
  });
}

/**
 * Creates an OprfEvaluator that fans out to two OPRF processes via Unix sockets.
 * Each evaluation opens fresh connections (no persistent connection pool).
 * Fresh connections per evaluation avoid stale connection state and simplify
 * error handling. At CARE-Y's scale (< 100 logins/day), connection overhead
 * is negligible (~0.1ms per Unix socket connect).
 *
 * To scale beyond ~1k concurrent logins, replace with a persistent connection
 * pool (2 sockets per process, round-robin). The OprfEvaluator interface stays
 * the same, so callers need no changes.
 */
export function createIpcEvaluator(config: IpcConfig): OprfEvaluator {
  return {
    async evaluate(
      blindedElement: Uint8Array,
      tag: string,
    ): Promise<Uint8Array> {
      if (blindedElement.length !== POINT_BYTES) {
        throw new OprfError(
          `Blinded element must be ${String(POINT_BYTES)} bytes, got ${String(blindedElement.length)}`,
        );
      }

      const payload = buildTaggedPayload(blindedElement, tag);

      const [partialA, partialB] = await Promise.all([
        sendToProcess(config.socketPathA, payload),
        sendToProcess(config.socketPathB, payload),
      ]);

      const combined = lagrangeInterpolate(
        toRistrettoPoint(new Uint8Array(partialA)),
        toRistrettoPoint(new Uint8Array(partialB)),
      );

      return Buffer.from(combined);
    },

    close(): void {
      // No persistent connections to close in the per-request model
    },
  };
}

/**
 * Mock evaluator for tests. Takes the two Shamir shares (not the combined
 * key) and reproduces the real math: derives a tagged share from each
 * master share, evaluates each partial, then combines via Lagrange
 * interpolation, so mock and IPC evaluations agree for any tag.
 *
 * @param shareA - First Shamir share (evaluation point x=1)
 * @param shareB - Second Shamir share (evaluation point x=2)
 */
export function createMockEvaluator(
  shareA: Uint8Array,
  shareB: Uint8Array,
): OprfEvaluator {
  return {
    async evaluate(
      blindedElement: Uint8Array,
      tag: string,
    ): Promise<Uint8Array> {
      const { taggedBlindEvaluate } = await import("./oprf-server.js");

      const partialA = taggedBlindEvaluate(shareA, tag, blindedElement);
      const partialB = taggedBlindEvaluate(shareB, tag, blindedElement);

      const combined = lagrangeInterpolate(partialA, partialB);

      return Buffer.from(combined);
    },
    close(): void {
      // Mock has no resources to release
    },
  };
}
