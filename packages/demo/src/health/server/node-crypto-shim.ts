/**
 * Shim for node:crypto
 *
 * Implements the subset of node:crypto used by the reachable server graph:
 * randomBytes, randomInt, createHash, createHmac, timingSafeEqual,
 * hkdfSync, scrypt, promisify(scrypt).
 *
 * Backed by globalThis.crypto.getRandomValues + libsodium-wrappers-sumo.
 *
 * IMPORTANT: sodium must be initialized (await sodium.ready) before any
 * call here. bootHealthEngine does this first. If called before readiness,
 * functions throw SodiumNotReadyError.
 *
 * Mirrors: node:crypto (partial surface)
 */

import { HealthCheckError } from "../errors.js";
import _sodium from "libsodium-wrappers-sumo";

class SodiumNotReadyError extends Error {
  constructor() {
    super(
      "node:crypto shim called before sodium.ready was awaited. " +
        "bootHealthEngine must call await sodium.ready first.",
    );
    this.name = "SodiumNotReadyError";
  }
}

let sodiumReady = false;

/** Called by engine.ts after await sodium.ready */
export function markSodiumReady(): void {
  sodiumReady = true;
}

function assertReady(): void {
  if (!sodiumReady) throw new SodiumNotReadyError();
}

// ── randomBytes ──────────────────────────────────────────────────────

export function randomBytes(size: number): Buffer {
  const arr = new Uint8Array(size);
  globalThis.crypto.getRandomValues(arr);
  return Buffer.from(arr);
}

// ── randomInt ────────────────────────────────────────────────────────

export function randomInt(a: number, b?: number): number {
  const min = b === undefined ? 0 : a;
  const max = b ?? a;
  const range = max - min;
  if (range <= 0) return min;
  // Uniform via rejection sampling
  const arr = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / range) * range;
  let r: number;
  do {
    globalThis.crypto.getRandomValues(arr);
    const val = arr.at(0);
    if (val === undefined) {
      throw new HealthCheckError("getRandomValues returned empty Uint32Array");
    }
    r = val;
  } while (r >= limit);
  return min + (r % range);
}

// ── randomUUID ───────────────────────────────────────────────────────

export function randomUUID(): string {
  return globalThis.crypto.randomUUID();
}

// ── Hash / HMAC ──────────────────────────────────────────────────────

interface HashLike {
  update(data: string | Buffer): HashLike;
  digest(): Buffer;
  digest(encoding: "hex"): string;
}

export function createHash(algorithm: string): HashLike {
  assertReady();
  const chunks: Uint8Array[] = [];

  const self: HashLike = {
    update(data: string | Buffer): HashLike {
      if (typeof data === "string") {
        chunks.push(new TextEncoder().encode(data));
      } else {
        chunks.push(new Uint8Array(data));
      }
      return self;
    },
    digest(encoding?: string): Buffer | string {
      const totalLen = chunks.reduce((s, c) => s + c.length, 0);
      const combined = new Uint8Array(totalLen);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      let result: Uint8Array;
      if (algorithm === "sha256") {
        result = _sodium.crypto_hash_sha256(combined);
      } else if (algorithm === "sha512") {
        result = _sodium.crypto_hash_sha512(combined);
      } else {
        // BLAKE2b fallback for unexpected algorithms
        result = _sodium.crypto_generichash(32, combined);
      }

      const buf = Buffer.from(result);
      if (encoding === "hex") return buf.toString("hex");
      return buf;
    },
  };
  return self;
}

export function createHmac(algorithm: string, key: Buffer | string): HashLike {
  assertReady();
  const keyBuf =
    typeof key === "string" ? Buffer.from(key, "utf-8") : Buffer.from(key);
  const chunks: Uint8Array[] = [];

  const self: HashLike = {
    update(data: string | Buffer): HashLike {
      if (typeof data === "string") {
        chunks.push(new TextEncoder().encode(data));
      } else {
        chunks.push(new Uint8Array(data));
      }
      return self;
    },
    digest(encoding?: string): Buffer | string {
      const totalLen = chunks.reduce((s, c) => s + c.length, 0);
      const combined = new Uint8Array(totalLen);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      let hashLen: number;
      if (algorithm === "sha256") {
        hashLen = 32;
      } else if (algorithm === "sha512") {
        hashLen = 64;
      } else {
        hashLen = 32;
      }

      // HMAC via libsodium crypto_auth_hmacsha256 / crypto_auth_hmacsha512
      let result: Uint8Array;
      if (algorithm === "sha256" && keyBuf.length === 32) {
        result = _sodium.crypto_auth_hmacsha256(combined, keyBuf);
      } else {
        // RFC 2104 HMAC construction for arbitrary key sizes
        const blockSize = algorithm === "sha512" ? 128 : 64;
        let normalizedKey: Uint8Array;
        if (keyBuf.length > blockSize) {
          // Hash the key if too long
          if (algorithm === "sha512") {
            normalizedKey = _sodium.crypto_hash_sha512(keyBuf);
          } else {
            normalizedKey = _sodium.crypto_hash_sha256(keyBuf);
          }
        } else {
          normalizedKey = new Uint8Array(keyBuf);
        }
        // Pad key to block size
        const paddedKey = new Uint8Array(blockSize);
        paddedKey.set(normalizedKey);

        const ipad = Uint8Array.from(paddedKey, (byte) => byte ^ 0x36);
        const opad = Uint8Array.from(paddedKey, (byte) => byte ^ 0x5c);

        // inner hash = H(ipad || message)
        const innerInput = new Uint8Array(blockSize + combined.length);
        innerInput.set(ipad);
        innerInput.set(combined, blockSize);

        let innerHash: Uint8Array;
        if (algorithm === "sha512") {
          innerHash = _sodium.crypto_hash_sha512(innerInput);
        } else {
          innerHash = _sodium.crypto_hash_sha256(innerInput);
        }

        // outer hash = H(opad || inner_hash)
        const outerInput = new Uint8Array(blockSize + innerHash.length);
        outerInput.set(opad);
        outerInput.set(innerHash, blockSize);

        if (algorithm === "sha512") {
          result = _sodium.crypto_hash_sha512(outerInput);
        } else {
          result = _sodium.crypto_hash_sha256(outerInput);
        }

        // Truncate to requested hash length
        result = result.subarray(0, hashLen);
      }

      const buf = Buffer.from(result);
      if (encoding === "hex") return buf.toString("hex");
      return buf;
    },
  };
  return self;
}

// ── timingSafeEqual ──────────────────────────────────────────────────

export function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  // Use sodium's constant-time comparison
  assertReady();
  return _sodium.memcmp(new Uint8Array(a), new Uint8Array(b));
}

// ── hkdfSync (RFC 5869) ─────────────────────────────────────────────

export function hkdfSync(
  hash: string,
  ikm: Buffer | string,
  salt: Buffer | string,
  info: string,
  keylen: number,
): ArrayBuffer {
  assertReady();
  const ikmBuf = typeof ikm === "string" ? Buffer.from(ikm, "utf-8") : ikm;
  const saltBuf =
    typeof salt === "string"
      ? Buffer.from(salt, "utf-8")
      : salt.length === 0
        ? Buffer.alloc(hash === "sha512" ? 64 : 32)
        : salt;
  const infoBuf = Buffer.from(info, "utf-8");

  // HKDF-Extract: PRK = HMAC-Hash(salt, IKM)
  const prk = createHmac(hash === "sha512" ? "sha512" : "sha256", saltBuf)
    .update(ikmBuf)
    .digest();

  // HKDF-Expand
  const hashLen = hash === "sha512" ? 64 : 32;
  const n = Math.ceil(keylen / hashLen);
  const okm = Buffer.alloc(n * hashLen);
  let prev = Buffer.alloc(0);

  for (let i = 1; i <= n; i++) {
    const hmac = createHmac(hash === "sha512" ? "sha512" : "sha256", prk);
    hmac.update(prev);
    hmac.update(infoBuf);
    hmac.update(Buffer.from([i]));
    prev = hmac.digest();
    prev.copy(okm, (i - 1) * hashLen);
  }

  return okm.buffer.slice(okm.byteOffset, okm.byteOffset + keylen);
}

// ── hkdf (async version, used by salt-defense.ts) ────────────────────

export function hkdf(
  hash: string,
  ikm: Buffer | string,
  salt: Buffer | string,
  info: string,
  keylen: number,
  callback: (err: Error | null, derivedKey: ArrayBuffer) => void,
): void {
  try {
    const result = hkdfSync(hash, ikm, salt, info, keylen);
    callback(null, result);
  } catch (err: unknown) {
    callback(
      err instanceof Error ? err : new Error(String(err)),
      new ArrayBuffer(0),
    );
  }
}

// ── scrypt ───────────────────────────────────────────────────────────
// Uses libsodium-wrappers-sumo crypto_pwhash_scryptsalsa208sha256_ll
// which is the raw scrypt function matching Node's crypto.scrypt params.

export function scrypt(
  password: string | Buffer,
  salt: Buffer,
  keylen: number,
  callback: (err: Error | null, derivedKey: Buffer) => void,
): void {
  assertReady();
  try {
    const passBuf =
      typeof password === "string"
        ? new TextEncoder().encode(password)
        : new Uint8Array(password);
    const saltU8 = new Uint8Array(salt);

    // Node's default scrypt params: N=16384, r=8, p=1
    const result = _sodium.crypto_pwhash_scryptsalsa208sha256_ll(
      passBuf,
      saltU8,
      16384, // N
      8, // r
      1, // p
      keylen,
    );

    callback(null, Buffer.from(result));
  } catch (err: unknown) {
    callback(
      err instanceof Error ? err : new Error(String(err)),
      Buffer.alloc(0),
    );
  }
}

// ── promisify helper (for scrypt-hash.ts compatibility) ──────────────

export function promisify<TArgs extends unknown[], TResult>(
  fn: (
    ...args: [...TArgs, (err: Error | null, result: TResult) => void]
  ) => void,
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> =>
    new Promise((resolve, reject) => {
      fn(...args, (err: Error | null, result: TResult) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
}

// ── Re-exports for modules that do `import { createSign } from "node:crypto"` ──
// push-crypto.ts uses createSign and generateKeyPairSync, which are not
// reachable in the demo (push sender is a no-op). Throw on actual use.

export function createSign(): never {
  throw new HealthCheckError(
    "createSign is not available in the browser demo (push-crypto is not reachable)",
  );
}

export function generateKeyPairSync(): never {
  throw new HealthCheckError(
    "generateKeyPairSync is not available in the browser demo",
  );
}

// ── webcrypto re-export (in case any module references it) ───────────

export const webcrypto = globalThis.crypto;

export default {
  randomBytes,
  randomInt,
  randomUUID,
  createHash,
  createHmac,
  timingSafeEqual,
  hkdfSync,
  hkdf,
  scrypt,
  promisify,
  createSign,
  generateKeyPairSync,
  webcrypto,
};
