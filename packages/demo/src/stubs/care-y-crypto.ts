/**
 * Stub for @care-y/crypto.
 *
 * Copies the pure slot-name helpers that client components import.
 * Everything else in the real package requires libsodium; those
 * exports throw if called so unexpected usage surfaces immediately.
 *
 * decryptClientBranding is a working passthrough: the trpc mock's
 * clientEncryptedBranding is base64-of-JSON, public-branding.ts
 * does the base64 decode before calling this, and then TextDecoder
 * parses the result. Returning the bytes unchanged is correct.
 */

// --- Pure slot helpers (copied from packages/crypto/src/content.ts) ---

export function followupSlot(followupId: string): string {
  return `followup:${followupId}`;
}

export function blobSlot(blobRowId: string): string {
  return `blob:${blobRowId}`;
}

export function filenameSlot(attachmentId: string): string {
  return `filename:${attachmentId}`;
}

export function cursorSlot(userId: string): string {
  return `cursor:${userId}`;
}

export function fieldSlot(name: string): string {
  return `field:${name}`;
}

// --- Fail-loud stubs for crypto operations ---
// These are exported so module resolution succeeds if a transitive
// import reaches them, but calling them is a bug in the demo wiring.

class DemoStubError extends Error {
  override readonly name = "DemoStubError";
  constructor(fnName: string) {
    super(`${fnName} is stubbed out in the demo: real crypto is not available`);
  }
}

export function encode(_data: Uint8Array): never {
  throw new DemoStubError("encode");
}

export function decode(_b64: string): never {
  throw new DemoStubError("decode");
}

export function requireSodium(): never {
  throw new DemoStubError("requireSodium");
}

export function getSodium(): never {
  throw new DemoStubError("getSodium");
}

export function wrapKey(..._args: unknown[]): never {
  throw new DemoStubError("wrapKey");
}

export function unwrapKey(..._args: unknown[]): never {
  throw new DemoStubError("unwrapKey");
}

export function eciesEncrypt(..._args: unknown[]): never {
  throw new DemoStubError("eciesEncrypt");
}

export function eciesDecrypt(..._args: unknown[]): never {
  throw new DemoStubError("eciesDecrypt");
}

// --- register-crypto.ts value-imports these at module scope ---
// They throw because registerCrypto never runs (hasKeys=true).

export function generateSalt(): never {
  throw new DemoStubError("generateSalt");
}

export function deriveAccountKey(..._args: unknown[]): never {
  throw new DemoStubError("deriveAccountKey");
}

export function oprfBlind(..._args: unknown[]): never {
  throw new DemoStubError("oprfBlind");
}

export function oprfFinalize(..._args: unknown[]): never {
  throw new DemoStubError("oprfFinalize");
}

export function deriveMasterKey(..._args: unknown[]): never {
  throw new DemoStubError("deriveMasterKey");
}

export function deriveVolunteerPrivateKey(..._args: unknown[]): never {
  throw new DemoStubError("deriveVolunteerPrivateKey");
}

export function deriveVolunteerPublicKey(..._args: unknown[]): never {
  throw new DemoStubError("deriveVolunteerPublicKey");
}

export function zeroAll(..._args: unknown[]): never {
  throw new DemoStubError("zeroAll");
}

export function toRistrettoPoint(..._args: unknown[]): never {
  throw new DemoStubError("toRistrettoPoint");
}

// --- Working passthrough for branding decryption ---
// public-branding.ts calls base64ToUint8Array on the mock's
// clientEncryptedBranding, then passes the result to this function.
// The mock's value is base64-of-plain-JSON, so returning bytes
// unchanged lets TextDecoder + JSON.parse succeed.

/**
 * Branded Uint8Array type alias (structural match for the real
 * Ciphertext branded type from the crypto package).
 */
type Ciphertext = Uint8Array & { readonly __brand: "Ciphertext" };

export function decryptClientBranding(
  blob: Ciphertext,
  _orgPubKey: Uint8Array,
): Uint8Array {
  return blob;
}
