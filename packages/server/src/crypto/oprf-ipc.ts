import { createConnection, type Socket } from "node:net";
import { lagrangeInterpolate, toRistrettoPoint } from "@care-y/crypto";
import { OprfError } from "../errors.js";

const LENGTH_PREFIX_BYTES = 4;
const POINT_BYTES = 32;
const IPC_TIMEOUT_MS = 5_000;

/** Transport-agnostic OPRF evaluation interface. */
export interface OprfEvaluator {
  /**
   * Evaluates a blinded element against the threshold OPRF key.
   * Fans out to both processes, combines via Lagrange interpolation.
   * @returns The combined evaluated element (identical to fullKey * blindedElement)
   * @throws OprfError if either process fails, times out, or returns invalid data
   */
  evaluate(blindedElement: Uint8Array): Promise<Uint8Array>;
  /** Gracefully close connections */
  close(): void;
}

interface IpcConfig {
  readonly socketPathA: string;
  readonly socketPathB: string;
}

async function sendToProcess(
  socketPath: string,
  payload: Buffer,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const socket: Socket = createConnection(socketPath);
    const timeoutId = setTimeout(() => {
      socket.destroy();
      reject(new OprfError(`OPRF process timeout (${socketPath})`));
    }, IPC_TIMEOUT_MS);

    const msg = Buffer.alloc(LENGTH_PREFIX_BYTES + payload.length);
    msg.writeUInt32BE(payload.length, 0);
    payload.copy(msg, LENGTH_PREFIX_BYTES);
    socket.write(msg);

    let received = Buffer.alloc(0);
    socket.on("data", (chunk: Buffer) => {
      received = Buffer.concat([received, chunk]);

      if (received.length >= LENGTH_PREFIX_BYTES) {
        const respLen = received.readUInt32BE(0);
        if (respLen === 0) {
          clearTimeout(timeoutId);
          socket.destroy();
          reject(new OprfError(`OPRF process returned error (${socketPath})`));
          return;
        }
        if (received.length >= LENGTH_PREFIX_BYTES + respLen) {
          clearTimeout(timeoutId);
          const result = received.subarray(
            LENGTH_PREFIX_BYTES,
            LENGTH_PREFIX_BYTES + respLen,
          );
          socket.destroy();
          resolve(Buffer.from(result));
        }
      }
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
    async evaluate(blindedElement: Uint8Array): Promise<Uint8Array> {
      if (blindedElement.length !== POINT_BYTES) {
        throw new OprfError(
          `Blinded element must be ${String(POINT_BYTES)} bytes, got ${String(blindedElement.length)}`,
        );
      }

      const payload = Buffer.from(blindedElement);

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
 * Mock evaluator for unit tests. Uses a single key (no threshold split).
 * Performs blindEvaluate directly without IPC.
 */
export function createMockEvaluator(fullKey: Uint8Array): OprfEvaluator {
  return {
    async evaluate(blindedElement: Uint8Array): Promise<Uint8Array> {
      const { blindEvaluate } = await import("./oprf-server.js");
      return blindEvaluate(fullKey, blindedElement);
    },
    close(): void {
      // Mock has no resources to release
    },
  };
}
