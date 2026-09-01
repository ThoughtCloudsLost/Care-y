import { describe, it, expect, vi, beforeEach } from "vitest";
import type * as CryptoPkg from "@care-y/crypto";

// Mock portal-crypto to control the OPRF round
const { fakeKeypairWithPass, fakeEciesOutput } = vi.hoisted(() => ({
  fakeKeypairWithPass: {
    clientPrivate: new Uint8Array(32).fill(3),
    clientPublic: new Uint8Array(32).fill(4),
  },
  fakeEciesOutput: {
    ephemeralPoint: new Uint8Array(32).fill(9),
    nonce: new Uint8Array(24).fill(10),
    ciphertext: new Uint8Array(50).fill(11),
  },
}));

vi.mock("$lib/portal/portal-crypto.js", async (importOriginal) => ({
  ...(await importOriginal()),
  performChannelOprf: vi.fn(),
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
  zeroAll: vi.fn(),
}));

import {
  buildAddPassphrasePayload,
  type DecryptHandle,
  type PortalMessageWire,
} from "./add-passphrase-crypto.js";
import { performChannelOprf } from "$lib/portal/portal-crypto.js";
import { eciesEncrypt, zeroAll } from "@care-y/crypto";
import type { PortalKeypair } from "@care-y/crypto";

function makeSeed(): Uint8Array {
  return new Uint8Array(24).fill(0xab);
}

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

const oprfOpts = {
  evaluate: vi.fn(),
  auth: "auth-b64",
  onPowRequired: vi.fn(),
};

describe("buildAddPassphrasePayload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(performChannelOprf).mockResolvedValue(
      fakeKeypairWithPass as unknown as PortalKeypair,
    );
  });

  it("calls performChannelOprf with the passphrase", async () => {
    const seed = makeSeed();
    const messages = makeMessages(0);
    const session = makeSession(messages);

    await buildAddPassphrasePayload(
      seed,
      "channel-id",
      "my passphrase",
      oprfOpts,
      messages,
      session,
    );

    expect(performChannelOprf).toHaveBeenCalledWith(seed, "channel-id", {
      passphrase: "my passphrase",
      evaluate: oprfOpts.evaluate,
      auth: oprfOpts.auth,
      onPowRequired: oprfOpts.onPowRequired,
    });
  });

  it("returns a payload with clientPublic and keyCheck", async () => {
    const seed = makeSeed();
    const messages = makeMessages(0);
    const session = makeSession(messages);

    const payload = await buildAddPassphrasePayload(
      seed,
      "channel-id",
      "my passphrase",
      oprfOpts,
      messages,
      session,
    );

    expect(payload.clientPublic).toBeDefined();
    expect(payload.keyCheck).toBeDefined();
    expect(payload.keyCheck.ephemeralPoint).toBeDefined();
    expect(payload.keyCheck.nonce).toBeDefined();
    expect(payload.keyCheck.ciphertext).toBeDefined();
  });

  it("seals the key check to the new public key", async () => {
    const seed = makeSeed();
    const messages = makeMessages(0);
    const session = makeSession(messages);

    await buildAddPassphrasePayload(
      seed,
      "channel-id",
      "my passphrase",
      oprfOpts,
      messages,
      session,
    );

    expect(eciesEncrypt).toHaveBeenCalledWith(
      expect.any(Uint8Array),
      fakeKeypairWithPass.clientPublic,
    );
  });

  it("re-seals all portal messages regardless of direction", async () => {
    const seed = makeSeed();
    const messages = makeMessages(4);
    const session = makeSession(messages);

    const payload = await buildAddPassphrasePayload(
      seed,
      "channel-id",
      "my passphrase",
      oprfOpts,
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
    const seed = makeSeed();
    const messages = makeMessages(3);
    const session: DecryptHandle = {
      decryptMessage: vi
        .fn()
        .mockResolvedValueOnce("text 1")
        .mockRejectedValueOnce(new Error("decrypt fail"))
        .mockResolvedValueOnce("text 3"),
    };

    const payload = await buildAddPassphrasePayload(
      seed,
      "channel-id",
      "my passphrase",
      oprfOpts,
      messages,
      session,
    );

    // Only 2 out of 3 successfully decrypted
    expect(payload.resealedMessages).toHaveLength(2);
    expect(payload.resealedMessages[0]?.id).toBe("msg-0");
    expect(payload.resealedMessages[1]?.id).toBe("msg-2");
  });

  it("zeros the private key in finally", async () => {
    const seed = makeSeed();
    const messages = makeMessages(0);
    const session = makeSession(messages);

    await buildAddPassphrasePayload(
      seed,
      "channel-id",
      "my passphrase",
      oprfOpts,
      messages,
      session,
    );

    expect(zeroAll).toHaveBeenCalledWith(fakeKeypairWithPass.clientPrivate);
  });

  it("zeros the private key even when an error occurs", async () => {
    vi.mocked(performChannelOprf).mockResolvedValue(
      fakeKeypairWithPass as unknown as PortalKeypair,
    );
    // Force eciesEncrypt to throw
    vi.mocked(eciesEncrypt).mockImplementationOnce(() => {
      throw new Error("ecies fail");
    });

    const seed = makeSeed();
    const messages = makeMessages(0);
    const session = makeSession(messages);

    await expect(
      buildAddPassphrasePayload(
        seed,
        "channel-id",
        "my passphrase",
        oprfOpts,
        messages,
        session,
      ),
    ).rejects.toThrow("ecies fail");

    expect(zeroAll).toHaveBeenCalledWith(fakeKeypairWithPass.clientPrivate);
  });

  it("derivation with passphrase differs from seed-only", async () => {
    // The OPRF round with passphrase produces a different keypair
    // than without. We verify that performChannelOprf receives
    // the passphrase parameter, which folds the Argon2id stretch.
    const seed = makeSeed();
    const messages = makeMessages(0);
    const session = makeSession(messages);

    await buildAddPassphrasePayload(
      seed,
      "channel-id",
      "my passphrase",
      oprfOpts,
      messages,
      session,
    );

    const call = vi.mocked(performChannelOprf).mock.calls[0];
    expect(call?.[2]).toHaveProperty("passphrase", "my passphrase");
  });

  it("returns empty resealedMessages when no messages exist", async () => {
    const seed = makeSeed();
    const messages: PortalMessageWire[] = [];
    const session = makeSession(messages);

    const payload = await buildAddPassphrasePayload(
      seed,
      "channel-id",
      "my passphrase",
      oprfOpts,
      messages,
      session,
    );

    expect(payload.resealedMessages).toHaveLength(0);
  });
});
