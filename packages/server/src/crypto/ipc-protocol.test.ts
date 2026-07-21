import { describe, it, expect } from "vitest";
import {
  frameMessage,
  frameError,
  createMessageReader,
} from "./ipc-protocol.js";

describe("frameMessage", () => {
  // Wire format: [uint32BE length][payload bytes]. Guards compatibility with OPRF subprocess IPC.
  it("produces 4-byte length prefix followed by payload", () => {
    const payload = new Uint8Array([0x01, 0x02, 0x03]);
    const frame = frameMessage(payload);

    expect(frame.length).toBe(4 + 3);
    expect(frame.readUInt32BE(0)).toBe(3);
    expect(frame.subarray(4)).toEqual(Buffer.from([0x01, 0x02, 0x03]));
  });

  it("handles empty payload", () => {
    const frame = frameMessage(new Uint8Array(0));

    expect(frame.length).toBe(4);
    expect(frame.readUInt32BE(0)).toBe(0);
  });

  it("handles 32-byte payload (typical OPRF point)", () => {
    const payload = new Uint8Array(32).fill(0xab);
    const frame = frameMessage(payload);

    expect(frame.readUInt32BE(0)).toBe(32);
    expect(frame.length).toBe(36);
  });
});

describe("frameError", () => {
  it("produces 4-byte frame with zero length", () => {
    const frame = frameError();

    expect(frame.length).toBe(4);
    expect(frame.readUInt32BE(0)).toBe(0);
  });
});

describe("createMessageReader", () => {
  it("reads a complete message from a single chunk", () => {
    const reader = createMessageReader();
    const payload = Buffer.from([0x01, 0x02, 0x03]);
    reader.push(frameMessage(payload));

    const msg = reader.read();
    expect(msg).not.toBeNull();
    expect(msg!.payload).toEqual(payload);
  });

  it("returns null when buffer has insufficient data", () => {
    const reader = createMessageReader();

    expect(reader.read()).toBeNull();

    // Push only 2 of the 4 length-prefix bytes
    reader.push(Buffer.from([0x00, 0x00]));
    expect(reader.read()).toBeNull();
  });

  it("returns null when length prefix is received but payload is incomplete", () => {
    const reader = createMessageReader();

    // Length prefix says 32 bytes, but only 10 arrive
    const partial = Buffer.alloc(4 + 10);
    partial.writeUInt32BE(32, 0);
    reader.push(partial);

    expect(reader.read()).toBeNull();
  });

  it("assembles a message from multiple partial chunks", () => {
    const reader = createMessageReader();
    const payload = Buffer.from("hello-oprf");
    const frame = frameMessage(payload);

    // Split the frame into 3 chunks
    reader.push(frame.subarray(0, 2)); // partial length prefix
    expect(reader.read()).toBeNull();

    reader.push(frame.subarray(2, 6)); // rest of prefix + 2 payload bytes
    expect(reader.read()).toBeNull();

    reader.push(frame.subarray(6)); // remaining payload
    const msg = reader.read();
    expect(msg).not.toBeNull();
    expect(msg!.payload).toEqual(payload);
  });

  it("reads multiple messages from a single chunk", () => {
    const reader = createMessageReader();
    const msg1 = frameMessage(Buffer.from([0x01]));
    const msg2 = frameMessage(Buffer.from([0x02]));

    reader.push(Buffer.concat([msg1, msg2]));

    const first = reader.read();
    expect(first).not.toBeNull();
    expect(first!.payload).toEqual(Buffer.from([0x01]));

    const second = reader.read();
    expect(second).not.toBeNull();
    expect(second!.payload).toEqual(Buffer.from([0x02]));

    expect(reader.read()).toBeNull();
  });

  it("returns null payload for error signal (zero-length frame)", () => {
    const reader = createMessageReader();
    reader.push(frameError());

    const msg = reader.read();
    expect(msg).not.toBeNull();
    expect(msg!.payload).toBeNull();
  });

  it("reads error signal followed by valid message", () => {
    const reader = createMessageReader();
    const errFrame = frameError();
    const okFrame = frameMessage(Buffer.from([0xff]));

    reader.push(Buffer.concat([errFrame, okFrame]));

    const first = reader.read();
    expect(first!.payload).toBeNull();

    const second = reader.read();
    expect(second!.payload).toEqual(Buffer.from([0xff]));
  });

  it("consumes buffer correctly and returns null after all messages read", () => {
    const reader = createMessageReader();
    reader.push(frameMessage(Buffer.from([0x42])));

    expect(reader.read()).not.toBeNull();
    expect(reader.read()).toBeNull();
    expect(reader.read()).toBeNull();
  });
});
