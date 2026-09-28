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

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

interface SodiumNativeShim {
  readonly crypto_secretbox_NONCEBYTES: number;
  readonly crypto_secretbox_MACBYTES: number;
  readonly crypto_secretbox_KEYBYTES: number;
  readonly crypto_box_SEALBYTES: number;
  readonly crypto_box_PUBLICKEYBYTES: number;
  readonly crypto_box_SECRETKEYBYTES: number;
  // argon2id-hash.ts reads the limits at module scope for its test
  // params, and hashes and verifies through the async pair below.
  readonly crypto_pwhash_OPSLIMIT_MIN: number;
  readonly crypto_pwhash_MEMLIMIT_MIN: number;
  readonly crypto_pwhash_STRBYTES: number;
  crypto_pwhash_str_async(
    out: Uint8Array,
    passwd: Uint8Array,
    opslimit: number,
    memlimit: number,
  ): Promise<void>;
  crypto_pwhash_str_verify_async(
    str: Uint8Array,
    passwd: Uint8Array,
  ): Promise<boolean>;
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
  get crypto_pwhash_OPSLIMIT_MIN(): number {
    return ready().crypto_pwhash_OPSLIMIT_MIN;
  },
  get crypto_pwhash_MEMLIMIT_MIN(): number {
    return ready().crypto_pwhash_MEMLIMIT_MIN;
  },
  get crypto_pwhash_STRBYTES(): number {
    return ready().crypto_pwhash_STRBYTES;
  },
  // sodium-native writes the encoded hash into `out` and NUL-pads the
  // rest; libsodium.js returns it as a string, so it is copied in here.
  // The derivation runs on the calling thread (no thread pool in the
  // browser) and the promise settles once it finishes.
  async crypto_pwhash_str_async(
    out,
    passwd,
    opslimit,
    memlimit,
  ): Promise<void> {
    const sodium = ready();
    if (out.byteLength !== sodium.crypto_pwhash_STRBYTES) {
      throw new DemoEngineError(
        "sodium-native shim: out must be crypto_pwhash_STRBYTES bytes",
      );
    }
    if (passwd.byteLength === 0) {
      throw new DemoEngineError("sodium-native shim: passwd must not be empty");
    }
    const encoded = textEncoder.encode(
      sodium.crypto_pwhash_str(passwd, opslimit, memlimit),
    );
    // The string plus its NUL terminator must fit, as in libsodium.
    if (encoded.byteLength > out.byteLength - 1) {
      throw new DemoEngineError(
        "sodium-native shim: encoded hash exceeds crypto_pwhash_STRBYTES",
      );
    }
    out.fill(0);
    out.set(encoded);
    return Promise.resolve();
  },
  // `str` is the NUL-padded STRBYTES buffer sodium-native takes; the
  // encoded hash ends at the first NUL.
  async crypto_pwhash_str_verify_async(str, passwd): Promise<boolean> {
    const sodium = ready();
    if (str.byteLength !== sodium.crypto_pwhash_STRBYTES) {
      throw new DemoEngineError(
        "sodium-native shim: str must be crypto_pwhash_STRBYTES bytes",
      );
    }
    if (passwd.byteLength === 0) {
      throw new DemoEngineError("sodium-native shim: passwd must not be empty");
    }
    const end = str.indexOf(0);
    const encoded = textDecoder.decode(
      str.subarray(0, end === -1 ? str.byteLength : end),
    );
    return Promise.resolve(sodium.crypto_pwhash_str_verify(encoded, passwd));
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
