/**
 * Browser shim for the `sodium-native` package itself.
 *
 * Some server files import sodium-native directly and are reachable in
 * the demo graph (migration 014's secretbox backfill above all). Rather
 * than alias each importer, this shim stands in for the whole package,
 * implementing exactly the subset those files use over
 * libsodium-wrappers-sumo. Any other property access throws with the
 * missing name (fail loud, no silent no-ops).
 *
 * sodium-native's API mutates caller-provided output Buffers and returns
 * booleans for open-variants; libsodium-wrappers returns new arrays. The
 * adapters below bridge that difference.
 *
 * Callers must not run before sodium is ready; bootDemoEngine awaits
 * readiness before anything else executes.
 */

import { DemoEngineError } from "../errors.js";
import _sodium from "libsodium-wrappers-sumo";
import { assertSodiumReady } from "./sodium-ready.js";

function ready(): typeof _sodium {
  assertSodiumReady();
  return _sodium;
}

interface SodiumNativeShim {
  readonly crypto_secretbox_NONCEBYTES: number;
  readonly crypto_secretbox_MACBYTES: number;
  readonly crypto_secretbox_KEYBYTES: number;
  readonly crypto_box_SEALBYTES: number;
  readonly crypto_box_PUBLICKEYBYTES: number;
  readonly crypto_box_SECRETKEYBYTES: number;
  crypto_secretbox_easy(
    cipher: Uint8Array,
    message: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): void;
  crypto_secretbox_open_easy(
    message: Uint8Array,
    cipher: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): boolean;
  crypto_box_seal(
    cipher: Uint8Array,
    message: Uint8Array,
    publicKey: Uint8Array,
  ): void;
  crypto_box_seal_open(
    message: Uint8Array,
    cipher: Uint8Array,
    publicKey: Uint8Array,
    secretKey: Uint8Array,
  ): boolean;
  randombytes_buf(buf: Uint8Array): void;
  sodium_malloc(size: number): Buffer;
  sodium_memzero(buf: Uint8Array): void;
  sodium_mlock(buf: Uint8Array): void;
  sodium_munlock(buf: Uint8Array): void;
  sodium_mprotect_readonly(buf: Uint8Array): void;
  sodium_mprotect_readwrite(buf: Uint8Array): void;
  sodium_mprotect_noaccess(buf: Uint8Array): void;
}

const impl: SodiumNativeShim = {
  get crypto_secretbox_NONCEBYTES(): number {
    return ready().crypto_secretbox_NONCEBYTES;
  },
  get crypto_secretbox_MACBYTES(): number {
    return ready().crypto_secretbox_MACBYTES;
  },
  get crypto_secretbox_KEYBYTES(): number {
    return ready().crypto_secretbox_KEYBYTES;
  },
  get crypto_box_SEALBYTES(): number {
    return ready().crypto_box_SEALBYTES;
  },
  get crypto_box_PUBLICKEYBYTES(): number {
    return ready().crypto_box_PUBLICKEYBYTES;
  },
  get crypto_box_SECRETKEYBYTES(): number {
    return ready().crypto_box_SECRETKEYBYTES;
  },
  crypto_secretbox_easy(cipher, message, nonce, key): void {
    cipher.set(ready().crypto_secretbox_easy(message, nonce, key));
  },
  crypto_secretbox_open_easy(message, cipher, nonce, key): boolean {
    try {
      message.set(ready().crypto_secretbox_open_easy(cipher, nonce, key));
      return true;
    } catch {
      return false;
    }
  },
  crypto_box_seal(cipher, message, publicKey): void {
    cipher.set(ready().crypto_box_seal(message, publicKey));
  },
  crypto_box_seal_open(message, cipher, publicKey, secretKey): boolean {
    try {
      message.set(ready().crypto_box_seal_open(cipher, publicKey, secretKey));
      return true;
    } catch {
      return false;
    }
  },
  randombytes_buf(buf): void {
    globalThis.crypto.getRandomValues(buf);
  },
  sodium_malloc(size): Buffer {
    return Buffer.alloc(size);
  },
  sodium_memzero(buf): void {
    buf.fill(0);
  },
  sodium_mlock(): void {
    // No browser equivalent; memory locking is a no-op here.
  },
  sodium_munlock(): void {
    // No browser equivalent.
  },
  sodium_mprotect_readonly(): void {
    // No browser equivalent.
  },
  sodium_mprotect_readwrite(): void {
    // No browser equivalent.
  },
  sodium_mprotect_noaccess(): void {
    // No browser equivalent.
  },
};

const shim: SodiumNativeShim = new Proxy(impl, {
  get(target, prop, receiver): unknown {
    if (prop in target || typeof prop === "symbol") {
      return Reflect.get(target, prop, receiver) as unknown;
    }
    throw new DemoEngineError(
      `sodium-native shim: "${prop}" is not implemented for the browser demo`,
    );
  },
});

export default shim;
