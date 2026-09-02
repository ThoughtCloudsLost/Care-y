import { describe, it, expect, vi, beforeEach } from "vitest";
import type * as CryptoPkg from "@care-y/crypto";

const { fakeEciesOutput } = vi.hoisted(() => ({
  fakeEciesOutput: {
    ephemeralPoint: new Uint8Array(32).fill(9),
    nonce: new Uint8Array(24).fill(10),
    ciphertext: new Uint8Array(50).fill(11),
  },
}));

vi.mock("@care-y/crypto", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoPkg>()),
  eciesEncrypt: vi.fn().mockReturnValue(fakeEciesOutput),
  PORTAL_KEY_CHECK: "care-y-portal-check-v1",
  encode: vi
    .fn()
    .mockImplementation((buf: Uint8Array) =>
      Buffer.from(buf).toString("base64url"),
    ),
  decode: vi
    .fn()
    .mockImplementation((s: string) => Buffer.from(s, "base64url")),
  toRistrettoPoint: vi.fn().mockImplementation((buf: Uint8Array) => buf),
}));

import {
  buildAddPassphrasePayload,
  type DecryptHandle,
  type PortalMessageWire,
} from "./add-passphrase-crypto.js";
import { eciesEncrypt } from "@care-y/crypto";

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

// A fake base64url client public key (32 bytes)
const fakeClientPublicB64 = Buffer.from(new Uint8Array(32).fill(4)).toString(
  "base64url",
);

describe("buildAddPassphrasePayload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a payload with clientPublic and keyCheck", async () => {
    const messages = makeMessages(0);
    const session = makeSession(messages);

    const payload = await buildAddPassphrasePayload(
      fakeClientPublicB64,
      messages,
      session,
    );

    expect(payload.clientPublic).toBe(fakeClientPublicB64);
    expect(payload.keyCheck).toBeDefined();
    expect(payload.keyCheck.ephemeralPoint).toBeDefined();
    expect(payload.keyCheck.nonce).toBeDefined();
    expect(payload.keyCheck.ciphertext).toBeDefined();
  });

  it("seals the key check to the decoded new public key", async () => {
    const messages = makeMessages(0);
    const session = makeSession(messages);

    await buildAddPassphrasePayload(fakeClientPublicB64, messages, session);

    expect(eciesEncrypt).toHaveBeenCalledWith(
      expect.any(Uint8Array),
      expect.any(Uint8Array),
    );
  });

  it("re-seals all portal messages regardless of direction", async () => {
    const messages = makeMessages(4);
    const session = makeSession(messages);

    const payload = await buildAddPassphrasePayload(
      fakeClientPublicB64,
      messages,
      session,
    );

    expect(payload.resealedMessages).toHaveLength(4);
    expect(session.decryptMessage).toHaveBeenCalledTimes(4);

    // All directions get re-sealed (both to_client and from_client)
    const ids = payload.resealedMessages.map((m) => m.id);
    expect(ids).toEqual(["msg-0", "msg-1", "msg-2", "msg-3"]);
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
      fakeClientPublicB64,
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
      fakeClientPublicB64,
      messages,
      session,
    );

    expect(payload.resealedMessages).toHaveLength(0);
  });

  it("passes the base64url public key through as clientPublic", async () => {
    const messages = makeMessages(0);
    const session = makeSession(messages);

    const payload = await buildAddPassphrasePayload(
      fakeClientPublicB64,
      messages,
      session,
    );

    expect(payload.clientPublic).toBe(fakeClientPublicB64);
  });
});
