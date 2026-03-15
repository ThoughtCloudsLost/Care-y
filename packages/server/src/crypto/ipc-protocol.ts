/**
 * Length-prefixed IPC message framing.
 *
 * Both the OPRF IPC client (oprf-ipc.ts) and server (oprf-process.ts) use
 * the same wire format: 4-byte big-endian length prefix followed by payload
 * bytes. This module extracts that protocol so consumers focus on message
 * semantics, not byte assembly.
 *
 * Wire format: [uint32BE length][payload bytes]
 * A length of 0 signals an error response (no payload follows).
 */

const LENGTH_PREFIX_BYTES = 4;

/** Wraps a payload in a length-prefixed frame for sending over a stream. */
export function frameMessage(payload: Uint8Array): Buffer {
  const frame = Buffer.alloc(LENGTH_PREFIX_BYTES + payload.length);
  frame.writeUInt32BE(payload.length, 0);
  Buffer.from(payload).copy(frame, LENGTH_PREFIX_BYTES);
  return frame;
}

/** Builds a zero-length error frame (signals evaluation failure). */
export function frameError(): Buffer {
  const frame = Buffer.alloc(LENGTH_PREFIX_BYTES);
  frame.writeUInt32BE(0, 0);
  return frame;
}

/**
 * Parsed result from the framing layer.
 * `payload` is null when the length prefix is 0 (error signal).
 */
export interface FramedMessage {
  readonly payload: Buffer | null;
}

/**
 * Stateful accumulator for length-prefixed messages on a stream.
 *
 * Push incoming chunks via `push()`. When a complete message is available,
 * `read()` returns it. Handles partial reads across chunk boundaries.
 *
 * Usage:
 *   const reader = createMessageReader();
 *   socket.on("data", (chunk) => {
 *     reader.push(chunk);
 *     let msg;
 *     while ((msg = reader.read()) !== null) {
 *       handleMessage(msg);
 *     }
 *   });
 */
export interface MessageReader {
  /** Append incoming bytes to the internal buffer. */
  push(chunk: Buffer): void;
  /** Returns the next complete message, or null if not enough data yet. */
  read(): FramedMessage | null;
}

export function createMessageReader(): MessageReader {
  let buffer = Buffer.alloc(0);

  return {
    push(chunk: Buffer): void {
      buffer = Buffer.concat([buffer, chunk]);
    },

    read(): FramedMessage | null {
      if (buffer.length < LENGTH_PREFIX_BYTES) return null;

      const messageLength = buffer.readUInt32BE(0);
      const isErrorSignal = messageLength === 0;

      if (isErrorSignal) {
        buffer = buffer.subarray(LENGTH_PREFIX_BYTES);
        return { payload: null };
      }

      const totalFrameSize = LENGTH_PREFIX_BYTES + messageLength;
      if (buffer.length < totalFrameSize) return null;

      const payload = Buffer.from(
        buffer.subarray(LENGTH_PREFIX_BYTES, totalFrameSize),
      );
      buffer = buffer.subarray(totalFrameSize);
      return { payload };
    },
  };
}
