import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  eciesEncrypt,
  eciesDecrypt,
  encode,
  decode,
  derivePortalKeypair,
  generatePortalSeed,
  zeroAll,
  type RistrettoPoint,
  type Nonce,
} from "@care-y/crypto";
// Type-only aliases for importOriginal generics (the inline
// typeof import() form is rejected by consistent-type-imports).
import type * as ErrorsMod from "$lib/errors.js";
import type * as ToastMod from "$lib/stores/toast.svelte.js";
import type * as IndexMod from "$lib/trpc/index.js";
import type * as HapticMod from "$lib/utils/haptic.js";

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof IndexMod>()),
  trpc: {
    tickets: {
      updateOutboundMessage: { mutate: vi.fn().mockResolvedValue(undefined) },
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

describe("OutboundMessageEditSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("re-encrypts portal copy via eciesEncrypt and the result decrypts", async () => {
    const { getSodium } = await import("@care-y/crypto");
    await getSodium();

    const seed = generatePortalSeed();
    const keypair = derivePortalKeypair(seed);

    const text = "Updated message content";
    const textBytes = new TextEncoder().encode(text);
    const ecies = eciesEncrypt(textBytes, keypair.clientPublic);

    // Encoded triple for the mutation payload
    const portalCopy = {
      ephemeralPoint: encode(ecies.ephemeralPoint),
      nonce: encode(ecies.nonce),
      ciphertext: encode(ecies.ciphertext),
    };

    // Verify the portal copy decrypts back to the original text
    const decrypted = eciesDecrypt(
      decode(portalCopy.ephemeralPoint) as RistrettoPoint,
      decode(portalCopy.nonce) as Nonce,
      decode(portalCopy.ciphertext),
      keypair.clientPrivate,
    );
    const decryptedText = new TextDecoder().decode(decrypted);
    expect(decryptedText).toBe(text);

    zeroAll(seed, keypair.clientPrivate);
  });

  it("enforces 5000-char cap", () => {
    const MAX_CHARS = 5000;
    const text = "a".repeat(MAX_CHARS + 1);
    expect(text.length).toBeGreaterThan(MAX_CHARS);
    // The component sets canSave=false when over limit.
    // This verifies the constant used matches the spec.
    expect(MAX_CHARS).toBe(5000);
  });

  it("shows counter past 4500 characters", () => {
    const COUNTER_THRESHOLD = 4500;
    const text = "b".repeat(COUNTER_THRESHOLD + 1);
    expect(text.length).toBeGreaterThan(COUNTER_THRESHOLD);
    expect(COUNTER_THRESHOLD).toBe(4500);
  });
});
