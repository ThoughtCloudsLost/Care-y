# @care-y/crypto

Isomorphic encryption library for CARE-Y. Runs in both browser and Node.js via environment-specific libsodium bindings.

See the [root README](../../README.md) for full architecture, stack details, and setup instructions.

---

## Tech Stack

| Layer   | Technology                | Role                                                        |
| ------- | ------------------------- | ----------------------------------------------------------- |
| Crypto  | libsodium                 | All cryptographic primitives                                |
| Browser | `libsodium-wrappers-sumo` | WASM-compiled libsodium (sumo build for ristretto255 API)   |
| Node.js | `sodium-native`           | Native bindings for server-side use                         |
| Testing | Vitest + fast-check       | Unit tests + property-based testing (target: 100% coverage) |

---

## Development

```sh
pnpm vitest run packages/crypto
```

## Key Responsibilities

- **Key derivation:** Argon2id (password → account key)
- **OPRF protocol:** Blind/Finalize on ristretto255 for key derivation. Threshold Lagrange interpolation for split-server OPRF.
- **Key derivation:** HKDF from OPRF output to `master_key`, `vol_private`, `vol_public`
- **PII tier (ECIES):** ECIES per-volunteer wrapping on ristretto255 for per-ticket content key (`tk`) encryption. No per-ticket server round-trip.
- **Non-PII tier (org key):** org private key wrapped per-volunteer with their personal public key
- **Symmetric encryption:** XSalsa20-Poly1305 for content, shards, and branding
- **Key versioning:** ciphertext tagged with key version for rotation support

## Design Principles

- **Pure functions only:** no stateful patterns, no side effects. Every function takes inputs and returns outputs.
- **No key material in strings:** keys and plaintext use `Uint8Array` (can be zeroed). Strings are immutable in the V8 heap.
- **Environment detection:** automatically uses `sodium-native` in Node.js, `libsodium-wrappers-sumo` in browser

## Security Notes

- 100% test coverage is enforced in CI. Every code path must be verified.
- Never log key material or plaintext, even in tests
- Zero sensitive buffers after use. `buffer.fill(0)` in `finally` blocks.
