/**
 * Tests for the portal Worker message handler.
 *
 * Strategy: mock the Worker global context (self.addEventListener,
 * self.postMessage), capture the message handler at import time,
 * then invoke it directly with crafted request objects.
 *
 * Uses the real @care-y/crypto library (WASM backend) for crypto
 * correctness. The Worker's state machine and message protocol
 * are the primary test targets.
 */

import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import {
  getSodium,
  requireSodium,
  encode,
  decode,
  generatePortalSeed,
  eciesEncrypt,
  toRistrettoPoint,
} from "@care-y/crypto";
import type {
  PortalWorkerResponse,
  PortalWorkerEvent,
  PortalErrorResponse,
  PortalInitResponse,
  ChannelSessionStartResponse,
  ChannelSessionFinishResponse,
  DecryptMessageResponse,
} from "./portal-protocol.js";
import { CryptoWorkerTestError } from "$lib/errors.js";

// -- Worker global mock setup -------------------------------------------------

type MessageHandler = (event: MessageEvent) => void;

let messageHandler: MessageHandler | null = null;
const posted: (PortalWorkerResponse | PortalWorkerEvent)[] = [];

const mockSelf = {
  addEventListener: vi.fn((type: string, handler: MessageHandler) => {
    if (type === "message") {
      messageHandler = handler;
    }
  }),
  postMessage: vi.fn((msg: PortalWorkerResponse | PortalWorkerEvent) => {
    posted.push(msg);
  }),
};

(globalThis as Record<string, unknown>).self = mockSelf;
(globalThis as Record<string, unknown>).addEventListener =
  mockSelf.addEventListener;
(globalThis as Record<string, unknown>).postMessage = mockSelf.postMessage;

// -- Helpers ------------------------------------------------------------------

async function sendAndWait(
  data: Record<string, unknown>,
): Promise<PortalWorkerResponse> {
  if (!messageHandler)
    throw new CryptoWorkerTestError("Worker handler not registered");
  const countBefore = posted.length;
  messageHandler(new MessageEvent("message", { data }));
  await new Promise((r) => setTimeout(r, 50));
  // Find the first response (has "id") from the dispatch point
  for (let i = countBefore; i < posted.length; i++) {
    const msg = posted[i];
    if (msg && "id" in msg) return msg;
  }
  throw new CryptoWorkerTestError("No response posted");
}

function simulateOprfEvaluate(
  blindedElementB64: string,
  oprfKey: Uint8Array,
): string {
  const sodium = requireSodium();
  const blindedElem = decode(blindedElementB64);
  const evaluated = sodium.crypto_scalarmult_ristretto255(oprfKey, blindedElem);
  return encode(evaluated);
}

async function fullChannelSession(
  seed: Uint8Array,
  oprfKey: Uint8Array,
): Promise<{ clientPublic: string }> {
  await sendAndWait({ type: "init", id: 100 });

  const seedCopy = new Uint8Array(seed.length);
  seedCopy.set(seed);
  const startResp = (await sendAndWait({
    type: "channelSessionStart",
    id: 101,
    seed: seedCopy.buffer,
  })) as ChannelSessionStartResponse;

  const evaluatedB64 = simulateOprfEvaluate(startResp.blindedElement, oprfKey);

  const finishResp = (await sendAndWait({
    type: "channelSessionFinish",
    id: 102,
    evaluated: evaluatedB64,
  })) as ChannelSessionFinishResponse;

  return { clientPublic: finishResp.clientPublic };
}

// -- Test suite ---------------------------------------------------------------

describe("portal.worker", () => {
  beforeAll(async () => {
    await getSodium();
    await import("./portal.worker.js");
    expect(messageHandler).not.toBeNull();
  });

  beforeEach(() => {
    posted.length = 0;
  });

  describe("init", () => {
    it("initializes libsodium and transitions to READY", async () => {
      const resp = await sendAndWait({ type: "init", id: 1 });
      expect(resp).toEqual({
        id: 1,
        ok: true,
        type: "init",
      } satisfies PortalInitResponse);
    });
  });

  describe("channel session + decrypt", () => {
    it("full channel session derives keys and decrypts a message", async () => {
      await sendAndWait({ type: "zeroAll", id: 900 });
      const sodium = requireSodium();
      const seed = generatePortalSeed();
      const oprfKey = sodium.crypto_core_ristretto255_scalar_random();

      const { clientPublic } = await fullChannelSession(seed, oprfKey);

      // Encrypt a message to clientPublic
      const clientPub = toRistrettoPoint(decode(clientPublic));
      const triple = eciesEncrypt(
        new TextEncoder().encode("Worker message test"),
        clientPub,
      );

      const resp = (await sendAndWait({
        type: "decryptMessage",
        id: 200,
        ephemeralPoint: encode(triple.ephemeralPoint),
        nonce: encode(triple.nonce),
        ciphertext: encode(triple.ciphertext),
      })) as DecryptMessageResponse;

      expect(resp.ok).toBe(true);
      expect(resp.plaintext).toBe("Worker message test");

      sodium.memzero(oprfKey);
    });
  });

  describe("state machine", () => {
    it("rejects channelSessionStart when not READY", async () => {
      // Still CHANNEL_KEYED from previous test
      const seed = generatePortalSeed();
      const seedCopy = new Uint8Array(seed.length);
      seedCopy.set(seed);

      const resp = await sendAndWait({
        type: "channelSessionStart",
        id: 300,
        seed: seedCopy.buffer,
      });
      expect(resp.ok).toBe(false);
      expect((resp as PortalErrorResponse).code).toBe("INVALID_STATE");
    });

    it("rejects decryptMessage when not CHANNEL_KEYED", async () => {
      await sendAndWait({ type: "zeroAll", id: 310 });
      await sendAndWait({ type: "init", id: 311 });

      const resp = await sendAndWait({
        type: "decryptMessage",
        id: 312,
        ephemeralPoint: encode(new Uint8Array(32)),
        nonce: encode(new Uint8Array(24)),
        ciphertext: encode(new Uint8Array(48)),
      });
      expect(resp.ok).toBe(false);
      expect((resp as PortalErrorResponse).code).toBe("NOT_READY");
    });
  });

  describe("zeroAll", () => {
    it("zeros all key material and transitions to READY", async () => {
      const resp = await sendAndWait({ type: "zeroAll", id: 400 });
      expect(resp).toEqual({ id: 400, ok: true, type: "zeroAll" });

      const decResp = await sendAndWait({
        type: "decryptMessage",
        id: 401,
        ephemeralPoint: encode(new Uint8Array(32)),
        nonce: encode(new Uint8Array(24)),
        ciphertext: encode(new Uint8Array(48)),
      });
      expect(decResp.ok).toBe(false);
      expect((decResp as PortalErrorResponse).code).toBe("NOT_READY");
    });
  });
});
