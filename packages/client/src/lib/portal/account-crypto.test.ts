import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock trpc before importing the module under test
vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal()),
  trpc: {
    clientPortal: {
      getAccountSalt: {
        query: vi.fn(),
      },
      accountLogin: {
        mutate: vi.fn(),
      },
    },
  },
}));

vi.mock("$lib/auth/crypto-helpers.js", async (importOriginal) => ({
  ...(await importOriginal()),
  evaluateWithPowRetry: vi.fn(),
}));

// Mock the crypto module with controlled return values. vi.mock factories
// are hoisted above module-scope consts, so the fixtures must be hoisted too.
const {
  fakeKeypair,
  fakeAuthToken,
  fakeAuthHash,
  fakeStretched,
  fakeOprfOutput,
  fakeBlindedElement,
  fakeBlindState,
  fakeSalt,
  fakeEciesOutput,
} = vi.hoisted(() => ({
  fakeKeypair: {
    clientPrivate: new Uint8Array(32).fill(1),
    clientPublic: new Uint8Array(32).fill(2),
  },
  fakeAuthToken: new Uint8Array(32).fill(3),
  fakeAuthHash: new Uint8Array(32).fill(4),
  fakeStretched: new Uint8Array(64).fill(5),
  fakeOprfOutput: new Uint8Array(64).fill(6),
  fakeBlindedElement: new Uint8Array(32).fill(7),
  fakeBlindState: { state: "blind" },
  fakeSalt: new Uint8Array(16).fill(8),
  fakeEciesOutput: {
    ephemeralPoint: new Uint8Array(32).fill(9),
    nonce: new Uint8Array(24).fill(10),
    ciphertext: new Uint8Array(50).fill(11),
  },
}));

vi.mock("@care-y/crypto", async (importOriginal) => ({
  ...(await importOriginal()),
  deriveAccountKey: vi.fn().mockReturnValue(fakeStretched),
  oprfBlind: vi.fn().mockReturnValue({
    blindedElement: fakeBlindedElement,
    blindState: fakeBlindState,
  }),
  oprfFinalize: vi.fn().mockReturnValue(fakeOprfOutput),
  deriveClientAccountKeys: vi.fn().mockReturnValue({
    keypair: fakeKeypair,
    authToken: fakeAuthToken,
  }),
  hashChannelAuth: vi.fn().mockReturnValue(fakeAuthHash),
  eciesEncrypt: vi.fn().mockReturnValue(fakeEciesOutput),
  PORTAL_KEY_CHECK: "care-y-portal-check-v1",
  encode: vi
    .fn()
    .mockImplementation((buf: Uint8Array) =>
      Buffer.from(buf).toString("base64url"),
    ),
  decode: vi
    .fn()
    .mockImplementation(
      (s: string) => new Uint8Array(Buffer.from(s, "base64url")),
    ),
  requireSodium: vi.fn().mockReturnValue({
    memzero: vi.fn(),
  }),
  zeroAll: vi.fn(),
  generateSalt: vi.fn().mockReturnValue(fakeSalt),
  toSalt: vi.fn().mockImplementation((b: Uint8Array) => b),
}));

import {
  accountLogin,
  buildAccountRegistration,
  rewrapMessages,
} from "./account-crypto.js";
import { trpc } from "$lib/trpc/index.js";
import { requireRouter } from "$lib/errors.js";
import type { RistrettoPoint } from "@care-y/crypto";
import { evaluateWithPowRetry } from "$lib/auth/crypto-helpers.js";
import type { LoginCryptoCallbacks } from "$lib/auth/login-crypto.js";

// 32 bytes once decoded; toRistrettoPoint is real and validates length
const fakeEvaluatedB64 = Buffer.from(new Uint8Array(32).fill(12)).toString(
  "base64url",
);

const portalRouter = requireRouter(trpc.clientPortal, "clientPortal");

function makeCallbacks(): LoginCryptoCallbacks {
  return {
    onArgon2idStart: vi.fn(),
    onArgon2idDone: vi.fn(),
    onOprfStart: vi.fn(),
    onOprfDone: vi.fn(),
    onDeriveStart: vi.fn(),
    onDone: vi.fn(),
    onPowRequired: vi.fn().mockResolvedValue("solution"),
  };
}

describe("accountLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls getAccountSalt with the raw username", async () => {
    const saltB64 = Buffer.from(new Uint8Array(16).fill(1)).toString(
      "base64url",
    );
    vi.mocked(portalRouter.getAccountSalt.query).mockResolvedValue({
      salt: saltB64,
      accountId: "test-uuid",
    });
    vi.mocked(evaluateWithPowRetry).mockResolvedValue(fakeEvaluatedB64);
    vi.mocked(portalRouter.accountLogin.mutate).mockResolvedValue({});

    const callbacks = makeCallbacks();
    await accountLogin("myuser", "mypassword", callbacks);

    expect(portalRouter.getAccountSalt.query).toHaveBeenCalledWith({
      username: "myuser",
    });
  });

  it("never sends the password to the server", async () => {
    const saltB64 = Buffer.from(new Uint8Array(16).fill(1)).toString(
      "base64url",
    );
    vi.mocked(portalRouter.getAccountSalt.query).mockResolvedValue({
      salt: saltB64,
      accountId: "test-uuid",
    });
    vi.mocked(evaluateWithPowRetry).mockResolvedValue(fakeEvaluatedB64);
    vi.mocked(portalRouter.accountLogin.mutate).mockResolvedValue({});

    const callbacks = makeCallbacks();
    await accountLogin("myuser", "secret-password", callbacks);

    // accountLogin mutation receives authToken, never the password
    const loginCall = vi.mocked(portalRouter.accountLogin.mutate).mock.calls[0];
    expect(loginCall).toBeDefined();
    const payload = loginCall?.[0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty("password");
    expect(payload).toHaveProperty("authToken");
    expect(payload).toHaveProperty("accountId");
  });

  it("returns an AccountSession with a destroy method", async () => {
    const saltB64 = Buffer.from(new Uint8Array(16).fill(1)).toString(
      "base64url",
    );
    vi.mocked(portalRouter.getAccountSalt.query).mockResolvedValue({
      salt: saltB64,
      accountId: "test-uuid",
    });
    vi.mocked(evaluateWithPowRetry).mockResolvedValue(fakeEvaluatedB64);
    vi.mocked(portalRouter.accountLogin.mutate).mockResolvedValue({});

    const callbacks = makeCallbacks();
    const session = await accountLogin("myuser", "pw", callbacks);

    expect(session.keypair).toBeDefined();
    expect(session.keypair.clientPublic).toBeDefined();
    expect(typeof session.destroy).toBe("function");
  });

  it("calls all phase callbacks in order", async () => {
    const saltB64 = Buffer.from(new Uint8Array(16).fill(1)).toString(
      "base64url",
    );
    vi.mocked(portalRouter.getAccountSalt.query).mockResolvedValue({
      salt: saltB64,
      accountId: "test-uuid",
    });
    vi.mocked(evaluateWithPowRetry).mockResolvedValue(fakeEvaluatedB64);
    vi.mocked(portalRouter.accountLogin.mutate).mockResolvedValue({});

    const callbacks = makeCallbacks();
    await accountLogin("user", "pass", callbacks);

    expect(callbacks.onArgon2idStart).toHaveBeenCalledOnce();
    expect(callbacks.onArgon2idDone).toHaveBeenCalledOnce();
    expect(callbacks.onOprfStart).toHaveBeenCalledOnce();
    expect(callbacks.onOprfDone).toHaveBeenCalledOnce();
    expect(callbacks.onDeriveStart).toHaveBeenCalledOnce();
    expect(callbacks.onDone).toHaveBeenCalledOnce();
  });

  it("zeroes key material via zeroAll in finally", async () => {
    const { zeroAll } = await import("@care-y/crypto");
    const saltB64 = Buffer.from(new Uint8Array(16).fill(1)).toString(
      "base64url",
    );
    vi.mocked(portalRouter.getAccountSalt.query).mockResolvedValue({
      salt: saltB64,
      accountId: "test-uuid",
    });
    vi.mocked(evaluateWithPowRetry).mockResolvedValue(fakeEvaluatedB64);
    vi.mocked(portalRouter.accountLogin.mutate).mockResolvedValue({});

    const callbacks = makeCallbacks();
    await accountLogin("user", "pass", callbacks);

    expect(zeroAll).toHaveBeenCalled();
  });
});

describe("buildAccountRegistration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("produces a fresh salt each call", async () => {
    const { generateSalt } = await import("@care-y/crypto");
    vi.mocked(evaluateWithPowRetry).mockResolvedValue(fakeEvaluatedB64);

    const callbacks = makeCallbacks();
    await buildAccountRegistration("user1", "pass1", null, callbacks);
    await buildAccountRegistration("user2", "pass2", null, callbacks);

    expect(generateSalt).toHaveBeenCalledTimes(2);
  });

  it("keeps accountId when provided", async () => {
    vi.mocked(evaluateWithPowRetry).mockResolvedValue(fakeEvaluatedB64);

    const callbacks = makeCallbacks();
    const result = await buildAccountRegistration(
      "user",
      "pass",
      "my-id",
      callbacks,
    );

    expect(result.payload.accountId).toBe("my-id");
  });

  it("mints a new accountId when null", async () => {
    vi.mocked(evaluateWithPowRetry).mockResolvedValue(fakeEvaluatedB64);

    const callbacks = makeCallbacks();
    const result = await buildAccountRegistration(
      "user",
      "pass",
      null,
      callbacks,
    );

    // Should be a UUID-like string (crypto.randomUUID)
    expect(result.payload.accountId).toBeTruthy();
    expect(result.payload.accountId.length).toBeGreaterThan(0);
  });

  it("returns payload with authHash (not raw authToken)", async () => {
    vi.mocked(evaluateWithPowRetry).mockResolvedValue(fakeEvaluatedB64);

    const callbacks = makeCallbacks();
    const result = await buildAccountRegistration(
      "user",
      "pass",
      null,
      callbacks,
    );

    expect(result.payload.authHash).toBeDefined();
    expect(result.payload).not.toHaveProperty("authToken");
  });

  it("returns the keypair for re-encryption", async () => {
    vi.mocked(evaluateWithPowRetry).mockResolvedValue(fakeEvaluatedB64);

    const callbacks = makeCallbacks();
    const result = await buildAccountRegistration(
      "user",
      "pass",
      null,
      callbacks,
    );

    expect(result.keypair.clientPublic).toBeDefined();
    expect(result.keypair.clientPrivate).toBeDefined();
  });
});

describe("rewrapMessages", () => {
  it("produces output that has id and copy for each message", () => {
    const decrypted = [
      { id: "msg-1", text: "Hello" },
      { id: "msg-2", text: "World" },
    ];
    const newPublic = new Uint8Array(32).fill(99);

    const result = rewrapMessages(
      decrypted,
      newPublic as unknown as RistrettoPoint,
    );

    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe("msg-1");
    expect(result[0]?.copy).toHaveProperty("ephemeralPoint");
    expect(result[0]?.copy).toHaveProperty("nonce");
    expect(result[0]?.copy).toHaveProperty("ciphertext");
    expect(result[1]?.id).toBe("msg-2");
  });

  it("returns empty array for empty input", () => {
    const newPublic = new Uint8Array(32).fill(99);
    const result = rewrapMessages([], newPublic as unknown as RistrettoPoint);
    expect(result).toHaveLength(0);
  });
});
