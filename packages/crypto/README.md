# @care-y/crypto

Isomorphic encryption library for CARE-Y. Runs in both browser and Node.js via environment-specific libsodium bindings.

See the [root README](../../README.md) for full architecture, stack details, and setup instructions.

---

## Tech Stack

| Layer   | Technology           | Role                                                        |
| ------- | -------------------- | ----------------------------------------------------------- |
| Crypto  | libsodium            | All cryptographic primitives                                |
| Browser | `libsodium-wrappers` | WASM-compiled libsodium for browser environments            |
| Node.js | `sodium-native`      | Native bindings for server-side use                         |
| Testing | Vitest + fast-check  | Unit tests + property-based testing (target: 100% coverage) |

---

## Development

```sh
pnpm vitest run packages/crypto
```

## Key Responsibilities

- **Key derivation:** Argon2id (password → account key)
- **Keypair generation:** personal keypair per volunteer
- **Asymmetric encryption:** org private key wrapped per-user with their personal public key
- **Symmetric encryption:** ticket content, case notes, PII encrypted with org key
- **Key versioning:** ciphertext tagged with key version for rotation support

## Design Principles

- **Pure functions only:** no stateful patterns, no side effects. Every function takes inputs and returns outputs.
- **No key material in strings:** keys and plaintext use `Uint8Array` (can be zeroed). Strings are immutable in the V8 heap.
- **Environment detection:** automatically uses `sodium-native` in Node.js, `libsodium-wrappers` in browser

## Security Notes

- 100% test coverage is enforced in CI. Every code path must be verified.
- Never log key material or plaintext, even in tests
- Zero sensitive buffers after use - `buffer.fill(0)` in `finally` blocks
