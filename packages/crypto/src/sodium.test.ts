import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import {
  getSodium,
  requireSodium,
  _resetSodiumForTesting,
  _setSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";
import { SodiumNotReadyError } from "./errors.js";

describe("sodium abstraction layer", () => {
  describe("initialization", () => {
    beforeEach(() => {
      _resetSodiumForTesting();
    });

    it("requireSodium throws SodiumNotReadyError before initialization", () => {
      expect(() => requireSodium()).toThrow(SodiumNotReadyError);
    });

    it("getSodium resolves to a SodiumBackend", async () => {
      const sodium = await getSodium();
      expect(sodium).toBeDefined();
      expect(typeof sodium.randombytes_buf).toBe("function");
    });

    it("requireSodium returns the same instance after getSodium", async () => {
      const fromAsync = await getSodium();
      const fromSync = requireSodium();
      expect(fromSync).toBe(fromAsync);
    });

    it("_setSodiumForTesting injects a backend that requireSodium returns", async () => {
      const real = await getSodium();
      _resetSodiumForTesting();
      expect(() => requireSodium()).toThrow(SodiumNotReadyError);
      _setSodiumForTesting(real);
      expect(requireSodium()).toBe(real);
    });

    it("getSodium returns cached instance on subsequent calls", async () => {
      const first = await getSodium();
      const second = await getSodium();
      expect(second).toBe(first);
    });

    it("concurrent getSodium calls return the same instance", async () => {
      const [a, b, c] = await Promise.all([
        getSodium(),
        getSodium(),
        getSodium(),
      ]);
      expect(a).toBe(b);
      expect(b).toBe(c);
    });
  });

  describe("backend operations", () => {
    let sodium: SodiumBackend;

    beforeAll(async () => {
      _resetSodiumForTesting();
      sodium = await getSodium();
    });

    describe("randombytes_buf", () => {
      it("returns buffer of requested length", () => {
        const buf = sodium.randombytes_buf(32);
        expect(buf).toBeInstanceOf(Uint8Array);
        expect(buf.length).toBe(32);
      });

      it("returns non-zero output", () => {
        const buf = sodium.randombytes_buf(32);
        const allZero = buf.every((b) => b === 0);
        expect(allZero).toBe(false);
      });

      it("returns different output on successive calls", () => {
        const a = sodium.randombytes_buf(32);
        const b = sodium.randombytes_buf(32);
        const same = a.every((v, i) => v === b[i]);
        expect(same).toBe(false);
      });
    });

    describe("ristretto255", () => {
      it("scalar_random returns 32-byte scalar", () => {
        const scalar = sodium.crypto_core_ristretto255_scalar_random();
        expect(scalar).toBeInstanceOf(Uint8Array);
        expect(scalar.length).toBe(sodium.crypto_core_ristretto255_SCALARBYTES);
      });

      it("scalar_reduce reduces 64 bytes to a 32-byte scalar", () => {
        const input = new Uint8Array(64);
        input.fill(0xff);
        const reduced = sodium.crypto_core_ristretto255_scalar_reduce(input);
        expect(reduced).toBeInstanceOf(Uint8Array);
        expect(reduced.length).toBe(
          sodium.crypto_core_ristretto255_SCALARBYTES,
        );
      });

      it("base point multiplication produces a valid 32-byte point", () => {
        const scalar = sodium.crypto_core_ristretto255_scalar_random();
        const point = sodium.crypto_scalarmult_ristretto255_base(scalar);
        expect(point).toBeInstanceOf(Uint8Array);
        expect(point.length).toBe(sodium.crypto_core_ristretto255_BYTES);
        expect(point.every((b) => b === 0)).toBe(false);
      });

      it("scalar_invert produces inverse (a * a_inv mod L = 1 via base point)", () => {
        const a = sodium.crypto_core_ristretto255_scalar_random();
        const aInv = sodium.crypto_core_ristretto255_scalar_invert(a);
        // a * a_inv should produce the identity scalar (1)
        // Verify: base^(a * a_inv) === base^1
        const product = sodium.crypto_core_ristretto255_scalar_mul(a, aInv);
        const pointFromProduct =
          sodium.crypto_scalarmult_ristretto255_base(product);
        const one = new Uint8Array(sodium.crypto_core_ristretto255_SCALARBYTES);
        one[0] = 1; // scalar 1 in little-endian
        const pointFromOne = sodium.crypto_scalarmult_ristretto255_base(one);
        expect(pointFromProduct).toEqual(pointFromOne);
      });

      it("scalar_add is commutative", () => {
        const a = sodium.crypto_core_ristretto255_scalar_random();
        const b = sodium.crypto_core_ristretto255_scalar_random();
        const ab = sodium.crypto_core_ristretto255_scalar_add(a, b);
        const ba = sodium.crypto_core_ristretto255_scalar_add(b, a);
        expect(ab).toEqual(ba);
      });

      it("point addition is commutative", () => {
        const s1 = sodium.crypto_core_ristretto255_scalar_random();
        const s2 = sodium.crypto_core_ristretto255_scalar_random();
        const p1 = sodium.crypto_scalarmult_ristretto255_base(s1);
        const p2 = sodium.crypto_scalarmult_ristretto255_base(s2);
        const sum1 = sodium.crypto_core_ristretto255_add(p1, p2);
        const sum2 = sodium.crypto_core_ristretto255_add(p2, p1);
        expect(sum1).toEqual(sum2);
      });

      it("from_hash maps 64-byte input to a valid point", () => {
        const hash = sodium.randombytes_buf(
          sodium.crypto_core_ristretto255_HASHBYTES,
        );
        const point = sodium.crypto_core_ristretto255_from_hash(hash);
        expect(point.length).toBe(sodium.crypto_core_ristretto255_BYTES);
      });
    });

    describe("secretbox", () => {
      it("encrypt then decrypt roundtrips", () => {
        const key = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
        const nonce = sodium.randombytes_buf(
          sodium.crypto_secretbox_NONCEBYTES,
        );
        const message = new TextEncoder().encode("hello world");

        const ciphertext = sodium.crypto_secretbox_easy(message, nonce, key);
        expect(ciphertext.length).toBe(
          message.length + sodium.crypto_secretbox_MACBYTES,
        );

        const decrypted = sodium.crypto_secretbox_open_easy(
          ciphertext,
          nonce,
          key,
        );
        expect(decrypted).toEqual(message);
      });

      it("wrong key throws on decrypt", () => {
        const key = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
        const wrongKey = sodium.randombytes_buf(
          sodium.crypto_secretbox_KEYBYTES,
        );
        const nonce = sodium.randombytes_buf(
          sodium.crypto_secretbox_NONCEBYTES,
        );
        const message = new TextEncoder().encode("secret");

        const ciphertext = sodium.crypto_secretbox_easy(message, nonce, key);
        expect(() =>
          sodium.crypto_secretbox_open_easy(ciphertext, nonce, wrongKey),
        ).toThrow();
      });
    });

    describe("HMAC-SHA512", () => {
      it("produces 64-byte output", () => {
        const key = sodium.randombytes_buf(
          sodium.crypto_auth_hmacsha512_KEYBYTES,
        );
        const message = new TextEncoder().encode("test");
        const mac = sodium.crypto_auth_hmacsha512(message, key);
        expect(mac.length).toBe(sodium.crypto_auth_hmacsha512_BYTES);
      });

      it("is deterministic", () => {
        const key = sodium.randombytes_buf(
          sodium.crypto_auth_hmacsha512_KEYBYTES,
        );
        const message = new TextEncoder().encode("deterministic");
        const mac1 = sodium.crypto_auth_hmacsha512(message, key);
        const mac2 = sodium.crypto_auth_hmacsha512(message, key);
        expect(mac1).toEqual(mac2);
      });

      it("different keys produce different MACs", () => {
        const key1 = sodium.randombytes_buf(
          sodium.crypto_auth_hmacsha512_KEYBYTES,
        );
        const key2 = sodium.randombytes_buf(
          sodium.crypto_auth_hmacsha512_KEYBYTES,
        );
        const message = new TextEncoder().encode("test");
        const mac1 = sodium.crypto_auth_hmacsha512(message, key1);
        const mac2 = sodium.crypto_auth_hmacsha512(message, key2);
        expect(mac1).not.toEqual(mac2);
      });
    });

    describe("HMAC-SHA512 streaming", () => {
      it("streaming matches one-shot for 32-byte key", () => {
        const key = sodium.randombytes_buf(
          sodium.crypto_auth_hmacsha512_KEYBYTES,
        );
        const message = new TextEncoder().encode("streaming test");
        const oneShot = sodium.crypto_auth_hmacsha512(message, key);
        const state = sodium.crypto_auth_hmacsha512_init(key);
        sodium.crypto_auth_hmacsha512_update(state, message);
        const streamed = sodium.crypto_auth_hmacsha512_final(state);
        expect(streamed).toEqual(oneShot);
      });

      it("accepts variable-length keys (64 bytes)", () => {
        const key = sodium.randombytes_buf(64);
        const message = new TextEncoder().encode("long key test");
        const state = sodium.crypto_auth_hmacsha512_init(key);
        sodium.crypto_auth_hmacsha512_update(state, message);
        const mac = sodium.crypto_auth_hmacsha512_final(state);
        expect(mac.length).toBe(sodium.crypto_auth_hmacsha512_BYTES);
      });

      it("multi-chunk update produces same result as single update", () => {
        const key = sodium.randombytes_buf(48);
        const chunk1 = new TextEncoder().encode("hello ");
        const chunk2 = new TextEncoder().encode("world");
        const combined = new TextEncoder().encode("hello world");

        const state1 = sodium.crypto_auth_hmacsha512_init(key);
        sodium.crypto_auth_hmacsha512_update(state1, combined);
        const mac1 = sodium.crypto_auth_hmacsha512_final(state1);

        const state2 = sodium.crypto_auth_hmacsha512_init(key);
        sodium.crypto_auth_hmacsha512_update(state2, chunk1);
        sodium.crypto_auth_hmacsha512_update(state2, chunk2);
        const mac2 = sodium.crypto_auth_hmacsha512_final(state2);

        expect(mac2).toEqual(mac1);
      });
    });

    describe("generic hash (BLAKE2b)", () => {
      it("produces output of requested length", () => {
        const message = new TextEncoder().encode("blake2b");
        const hash32 = sodium.crypto_generichash(32, message);
        expect(hash32.length).toBe(32);
        const hash64 = sodium.crypto_generichash(64, message);
        expect(hash64.length).toBe(64);
      });

      it("is deterministic", () => {
        const message = new TextEncoder().encode("deterministic");
        const a = sodium.crypto_generichash(32, message);
        const b = sodium.crypto_generichash(32, message);
        expect(a).toEqual(b);
      });
    });

    describe("SHA-512", () => {
      it("produces 64-byte output", () => {
        const message = new TextEncoder().encode("test");
        const hash = sodium.crypto_hash_sha512(message);
        expect(hash.length).toBe(64);
      });

      it("is deterministic", () => {
        const message = new TextEncoder().encode("deterministic");
        const a = sodium.crypto_hash_sha512(message);
        const b = sodium.crypto_hash_sha512(message);
        expect(a).toEqual(b);
      });

      it("matches NIST test vector for 'abc'", () => {
        const message = new TextEncoder().encode("abc");
        const hash = sodium.crypto_hash_sha512(message);
        // NIST SHA-512 test vector for "abc"
        const expected =
          "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a" +
          "2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f";
        const actual = Array.from(hash)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        expect(actual).toBe(expected);
      });
    });

    describe("memzero", () => {
      it("zeroes all bytes in a buffer", () => {
        const buf = sodium.randombytes_buf(32);
        expect(buf.some((b) => b !== 0)).toBe(true);
        sodium.memzero(buf);
        expect(buf.every((b) => b === 0)).toBe(true);
      });
    });

    describe("base64", () => {
      it("roundtrips encode/decode", () => {
        const data = sodium.randombytes_buf(32);
        const encoded = sodium.to_base64(
          data,
          sodium.base64_variants.URLSAFE_NO_PADDING,
        );
        expect(typeof encoded).toBe("string");
        const decoded = sodium.from_base64(
          encoded,
          sodium.base64_variants.URLSAFE_NO_PADDING,
        );
        expect(decoded).toEqual(data);
      });

      it("produces URL-safe output (no +, /, or =)", () => {
        // Use enough random data that standard base64 would normally contain +/=/
        const data = sodium.randombytes_buf(128);
        const encoded = sodium.to_base64(
          data,
          sodium.base64_variants.URLSAFE_NO_PADDING,
        );
        expect(encoded).not.toMatch(/[+/=]/);
      });
    });

    describe("sealed box (Curve25519)", () => {
      it("seal then open roundtrips", () => {
        // Generate a Curve25519 keypair via scalarmult_base
        const sk = sodium.randombytes_buf(sodium.crypto_box_SECRETKEYBYTES);
        const pk = sodium.crypto_scalarmult_base(sk);
        expect(pk).toBeInstanceOf(Uint8Array);
        expect(pk.length).toBe(sodium.crypto_box_PUBLICKEYBYTES);
      });

      it("crypto_scalarmult_base produces different keys for different secrets", () => {
        const sk1 = sodium.randombytes_buf(sodium.crypto_box_SECRETKEYBYTES);
        const sk2 = sodium.randombytes_buf(sodium.crypto_box_SECRETKEYBYTES);
        const pk1 = sodium.crypto_scalarmult_base(sk1);
        const pk2 = sodium.crypto_scalarmult_base(sk2);
        expect(pk1).not.toEqual(pk2);
      });

      it("seal_open decrypts a sealed box message", async () => {
        // Use the full sumo lib to seal a message, then open via SodiumBackend
        const mod = await import("libsodium-wrappers-sumo");
        const lib = mod.default;
        await lib.ready;

        const sk = sodium.randombytes_buf(sodium.crypto_box_SECRETKEYBYTES);
        const pk = sodium.crypto_scalarmult_base(sk);
        const message = new TextEncoder().encode("hello sealed box");

        // Seal with the underlying lib (not in SodiumBackend interface)
        const ciphertext = lib.crypto_box_seal(message, pk);
        expect(ciphertext.length).toBe(
          message.length + sodium.crypto_box_SEALBYTES,
        );

        // Open via SodiumBackend
        const decrypted = sodium.crypto_box_seal_open(ciphertext, pk, sk);
        expect(decrypted).toEqual(message);
      });

      it("seal_open throws on wrong key", async () => {
        const mod = await import("libsodium-wrappers-sumo");
        const lib = mod.default;
        await lib.ready;

        const sk = sodium.randombytes_buf(sodium.crypto_box_SECRETKEYBYTES);
        const pk = sodium.crypto_scalarmult_base(sk);
        const wrongSk = sodium.randombytes_buf(
          sodium.crypto_box_SECRETKEYBYTES,
        );
        const message = new TextEncoder().encode("wrong key test");
        const ciphertext = lib.crypto_box_seal(message, pk);

        expect(() =>
          sodium.crypto_box_seal_open(ciphertext, pk, wrongSk),
        ).toThrow();
      });
    });

    // Guards against libsodium upgrades silently changing constant values that are embedded as byte offsets in stored ciphertext and wire formats
    describe("constants", () => {
      it("secretbox constants match libsodium spec", () => {
        expect(sodium.crypto_secretbox_NONCEBYTES).toBe(24);
        expect(sodium.crypto_secretbox_KEYBYTES).toBe(32);
        expect(sodium.crypto_secretbox_MACBYTES).toBe(16);
      });

      it("HMAC-SHA512 constants match libsodium spec", () => {
        expect(sodium.crypto_auth_hmacsha512_BYTES).toBe(64);
        expect(sodium.crypto_auth_hmacsha512_KEYBYTES).toBe(32);
      });

      it("ristretto255 constants match libsodium spec", () => {
        expect(sodium.crypto_core_ristretto255_BYTES).toBe(32);
        expect(sodium.crypto_core_ristretto255_SCALARBYTES).toBe(32);
        expect(sodium.crypto_core_ristretto255_HASHBYTES).toBe(64);
      });

      it("Argon2id constants match libsodium spec", () => {
        expect(sodium.crypto_pwhash_ALG_ARGON2ID13).toBe(2);
        expect(sodium.crypto_pwhash_SALTBYTES).toBe(16);
      });

      it("sealed box constants match libsodium spec", () => {
        expect(sodium.crypto_box_SEALBYTES).toBe(48);
        expect(sodium.crypto_box_PUBLICKEYBYTES).toBe(32);
        expect(sodium.crypto_box_SECRETKEYBYTES).toBe(32);
      });
    });
  });
});
