/**
 * Stub for @care-y/crypto.
 *
 * Copies the pure slot-name helpers that client components import.
 * Everything else in the real package requires libsodium; those
 * exports throw if called so unexpected usage surfaces immediately.
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
