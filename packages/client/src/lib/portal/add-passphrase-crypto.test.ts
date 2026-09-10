import { describe, it, expect, vi, beforeAll } from "vitest";
import { getSodium, PORTAL_KEY_CHECK } from "@care-y/crypto";
import {
  makeRistrettoKeypair,
  decryptTripleB64,
  type TestKeypair,
} from "./test-helpers/crypto.js";
import {
  buildAddPassphrasePayload,
  type DecryptHandle,
  type PortalMessageWire,
} from "./add-passphrase-crypto.js";

// The "new keypair" the Worker would have derived. The suite only ever
// hands the public half to the module under test; the private half stays
// here to verify the seals by decryption.
let keypair: TestKeypair;

beforeAll(async () => {
  await getSodium();
  keypair = makeRistrettoKeypair();
});

function makeSession(_messages: readonly PortalMessageWire[]): DecryptHandle {
  return {
    decryptMessage: vi
      .fn()
      .mockImplementation(
        async (_ep: string, _n: string, _ct: string): Promise<string> => {
          return "decrypted text";
        },
      ),
  };
}

function makeMessages(count: number): PortalMessageWire[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `msg-${String(i)}`,
    direction: i % 2 === 0 ? "to_client" : "from_client",
    ephemeralPoint: "ep",
    nonce: "nn",
    ciphertext: "ct",
  }));
}

describe("buildAddPassphrasePayload", () => {
  it("seals a key check the new private key can decrypt", async () => {
    const messages = makeMessages(0);
    const session = makeSession(messages);

    const payload = await buildAddPassphrasePayload(
      keypair.publicB64,
      messages,
      session,
    );

    expect(payload.clientPublic).toBe(keypair.publicB64);
    expect(decryptTripleB64(payload.keyCheck, keypair.privateScalar)).toBe(
      PORTAL_KEY_CHECK,
    );
  });

  it("re-seals all portal messages regardless of direction", async () => {
    const messages = makeMessages(4);
    const session = makeSession(messages);

    const payload = await buildAddPassphrasePayload(
      keypair.publicB64,
      messages,
      session,
    );

    expect(payload.resealedMessages).toHaveLength(4);
    expect(session.decryptMessage).toHaveBeenCalledTimes(4);

    // All directions get re-sealed (both to_client and from_client),
    // and each copy must open under the new private key.
    const ids = payload.resealedMessages.map((m) => m.id);
    expect(ids).toEqual(["msg-0", "msg-1", "msg-2", "msg-3"]);
    for (const resealed of payload.resealedMessages) {
      expect(decryptTripleB64(resealed.copy, keypair.privateScalar)).toBe(
        "decrypted text",
      );
    }
  });

  it("skips messages that fail to decrypt", async () => {
    const messages = makeMessages(3);
    const session: DecryptHandle = {
      decryptMessage: vi
        .fn()
        .mockResolvedValueOnce("text 1")
        .mockRejectedValueOnce(new Error("decrypt fail"))
        .mockResolvedValueOnce("text 3"),
    };

    const payload = await buildAddPassphrasePayload(
      keypair.publicB64,
      messages,
      session,
    );

    // Only 2 out of 3 successfully decrypted
    expect(payload.resealedMessages).toHaveLength(2);
    expect(payload.resealedMessages[0]?.id).toBe("msg-0");
    expect(payload.resealedMessages[1]?.id).toBe("msg-2");
  });

  it("returns empty resealedMessages when no messages exist", async () => {
    const messages: PortalMessageWire[] = [];
    const session = makeSession(messages);

    const payload = await buildAddPassphrasePayload(
      keypair.publicB64,
      messages,
      session,
    );

    expect(payload.resealedMessages).toHaveLength(0);
  });
});
