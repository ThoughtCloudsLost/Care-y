# @care-y/server

Node.js + tRPC API server for CARE-Y. Handles auth, webhooks, and telephony relay endpoints.

The server stores only ciphertext and ECIES-wrapped ticket keys. It holds no volunteer key material. OPRF shares are held on separate threshold servers (single-server at launch, two-server target for production). Decryption keys are derived ephemerally via OPRF at volunteer login. This is intentionally architectural.

See the [root README](../../README.md) for full architecture, stack details, and setup instructions.

---

## Tech Stack

| Layer           | Technology                   | Role                                                                |
| --------------- | ---------------------------- | --------------------------------------------------------------------|
| Runtime         | Node.js 22 LTS               | Server runtime                                                      |
| API             | tRPC                         | End-to-end type-safe API (consumed by `@care-y/client`)             |
| Database        | PostgreSQL + Kysely           | SQL query builder, manual auditable migrations, bytea support      |
| Auth            | Cookie sessions (httpOnly, sameSite=strict) + CSRF tokens | Session management, IP/UA binding      |
| Crypto          | `@care-y/crypto` + `sodium-native` | Verify encrypted payloads, never decrypt PII                  |
| Telephony       | Twilio (provider interface)  | Inbound webhooks, outbound relay (SignalWire hybrid evaluated for self-hosted telephony) |
| Real-time       | SSE (built-in Node/SvelteKit) | Push metadata updates to clients                                   |
| Testing         | Vitest                       | Unit and integration tests (target: >=90% coverage)                 |

---

## Development

Run from the **monorepo root**:

```sh
pnpm dev
```

Or run only this package:

```sh
pnpm --filter @care-y/server dev
```

## Testing

```sh
# All server tests (from root)
pnpm vitest run packages/server

# Single directory
pnpm vitest run packages/server/src/auth
```

## Key Responsibilities

- **Auth:** cookie-based sessions, CSRF protection, 2FA enforcement, IP/UA binding
- **tRPC router:** all API procedures, input validation via Zod (`@care-y/shared` schemas)
- **Webhooks:** inbound Twilio SMS/call events, signature validation on every request
- **Telephony relay:** receives plaintext from browser, forwards to Twilio, zeros Buffer in `finally` block. Never stored, never logged
- **Database:** Kysely queries, encrypted blobs only, manual migrations

## Security Notes

- Never store plaintext from relay endpoints. Forward and zero the Buffer immediately
- Never use JavaScript strings for relay plaintext. Use Buffer (can be zeroed)
- Never log request/response bodies on relay endpoints
- Never skip webhook signature validation, even in development
- Never put the org private key or volunteer private keys on the server (server holds only OPRF shares and volunteer public keys)
