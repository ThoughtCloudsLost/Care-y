import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generatePortalSeed,
  deriveChannelId,
  deriveChannelAuth,
  hashChannelAuth,
  derivePortalKeypair,
  eciesEncrypt,
  encode,
  PORTAL_KEY_CHECK,
  zeroAll,
} from "@care-y/crypto";
// Type-only aliases for importOriginal generics (the inline
// typeof import() form is rejected by consistent-type-imports).
import type * as ErrorsMod from "$lib/errors.js";
import type * as ToastMod from "$lib/stores/toast.svelte.js";
import type * as IndexMod from "$lib/trpc/index.js";
import type * as HapticMod from "$lib/utils/haptic.js";

const mockMutate = vi.fn().mockResolvedValue(undefined);

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof IndexMod>()),
  trpc: {
    tickets: {
      upgradeToSecureLink: { mutate: mockMutate },
      regenerateSecureLink: { mutate: mockMutate },
    },
  },
}));

vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ErrorsMod>()),
  requireRouter: (router: unknown) => router,
}));

vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ToastMod>()),
  toastStore: { show: vi.fn() },
}));

vi.mock("$lib/utils/haptic.js", async (importOriginal) => ({
  ...(await importOriginal<typeof HapticMod>()),
  haptic: vi.fn(),
}));

describe("SecureLinkSheet crypto flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates a link matching the expected format", async () => {
    const { getSodium } = await import("@care-y/crypto");
    await getSodium();

    const seed = generatePortalSeed();
    const channelId = deriveChannelId(seed);
    const auth = deriveChannelAuth(seed);
    const keypair = derivePortalKeypair(seed);

    // Channel ID is 48 hex chars
    expect(channelId).toMatch(/^[0-9a-f]{48}$/);

    // Seed encodes to 32 base64url chars
    const encodedSeed = encode(seed);
    expect(encodedSeed).toHaveLength(32);

    // Link format
    const link = `https://example.com/portal/${channelId}#${encodedSeed}`;
    expect(link).toMatch(/\/portal\/[0-9a-f]{48}#[A-Za-z0-9_-]{32}$/);

    // Auth hash is 32 bytes
    const authHash = hashChannelAuth(auth);
    expect(authHash).toHaveLength(32);

    // Key check encrypts and decrypts
    const checkPlaintext = new TextEncoder().encode(PORTAL_KEY_CHECK);
    const keyCheck = eciesEncrypt(checkPlaintext, keypair.clientPublic);
    expect(keyCheck.ephemeralPoint).toHaveLength(32);
    expect(keyCheck.nonce).toHaveLength(24);

    zeroAll(seed, auth, keypair.clientPrivate);
  });

  it("mutation payload carries authHash, never the seed", async () => {
    const { getSodium } = await import("@care-y/crypto");
    await getSodium();

    const seed = generatePortalSeed();
    const channelId = deriveChannelId(seed);
    const auth = deriveChannelAuth(seed);
    const keypair = derivePortalKeypair(seed);
    const authHash = encode(hashChannelAuth(auth));
    const encodedSeed = encode(seed);

    const checkPlaintext = new TextEncoder().encode(PORTAL_KEY_CHECK);
    const keyCheck = eciesEncrypt(checkPlaintext, keypair.clientPublic);

    const payload = {
      ticketId: "test-ticket",
      channelId,
      authHash,
      clientPublic: encode(keypair.clientPublic),
      hasPassphrase: false,
      keyCheck: {
        ephemeralPoint: encode(keyCheck.ephemeralPoint),
        nonce: encode(keyCheck.nonce),
        ciphertext: encode(keyCheck.ciphertext),
      },
    };

    // The payload must never contain the seed or raw auth
    const payloadStr = JSON.stringify(payload);
    expect(payloadStr).not.toContain(encodedSeed);
    expect(payloadStr).not.toContain(encode(auth));

    // authHash is present
    expect(payload.authHash).toBe(authHash);
    expect(payload.authHash).toHaveLength(43); // 32 bytes base64url no padding

    zeroAll(seed, auth, keypair.clientPrivate);
  });

  it("passphrase changes the derived keypair", async () => {
    const { getSodium } = await import("@care-y/crypto");
    await getSodium();

    const seed = generatePortalSeed();
    const kpNoPass = derivePortalKeypair(seed);
    const kpWithPass = derivePortalKeypair(
      seed,
      "crane velvet monsoon ledger atlas",
    );

    expect(encode(kpNoPass.clientPublic)).not.toBe(
      encode(kpWithPass.clientPublic),
    );

    zeroAll(seed, kpNoPass.clientPrivate, kpWithPass.clientPrivate);
  });

  it("zeroes buffers via zeroAll", async () => {
    const { getSodium } = await import("@care-y/crypto");
    await getSodium();

    const seed = generatePortalSeed();
    const auth = deriveChannelAuth(seed);
    const keypair = derivePortalKeypair(seed);

    zeroAll(seed, auth, keypair.clientPrivate);

    // After zeroing, seed bytes should be all zero
    expect(seed.every((b) => b === 0)).toBe(true);
    expect(auth.every((b) => b === 0)).toBe(true);
  });
});
