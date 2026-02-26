# CARE-Y

**Care Anonymized, Redacted, Encrypted - ████**

> **Pre-alpha** - This project is under active development. No code has been released yet.

CARE-Y is a call intake and support system for at-risk populations actively targeted by powerful groups. It serves mutual-aid nonprofits where clients' identity, contact information, and case details are dangerous in the wrong hands.

CARE-Y is a full rewrite of the Katie call intake system from DARIA Engineering (Django 2.2, Twilio, Heroku) with **security-first architecture**: end-to-end encrypted, self-hosted, provider-agnostic telephony.

---

## Why CARE-Y Exists

CARE-Y makes bulk decryption architecturally impossible. The server stores only ciphertext and never holds the decryption key. A subpoena to the hosting provider yields encrypted blobs - not because of policy, but because the server **cannot** decrypt them.
The threat model includes database breaches, subpoenas to hosting/telephony providers, compromised volunteer devices, and state-level adversaries.

---

## Architecture

```
CLIENT (browser)                    SERVER (API)
────────────────                    ────────────
All encrypt/decrypt happens here    Stores only ciphertext
Keys held in memory for session     Routes requests, manages auth
Crypto: libsodium                   Stateless relay for telephony
                                    Never holds the org private key
```

**Key hierarchy:** `Password → Argon2id → Account Key → Personal Private Key → Org Private Key → Data`

- **Web intake forms and case notes:** true end-to-end encryption. Plaintext never reaches the server.
- **Outbound SMS/calls:** volunteer's browser decrypts, sends to one-shot relay endpoint, server forwards to telephony provider and zeros the buffer immediately. Never stored, never logged.
- **Inbound SMS:** encrypted on receipt, plaintext purged. Telephony provider retains independently (~30 days).
- **Telephony abstraction:** Twilio initially, Fonoster (self-hosted) planned. Provider swap, not rewrite.

---

## Tech Stack

| Layer           | Technology                                                                   |
| --------------- | ---------------------------------------------------------------------------- |
| Language        | TypeScript (ESM, `strict: true`)                                             |
| Frontend        | SvelteKit (Svelte 5 runes) + Konsta UI (mobile) + Bits UI (accessible forms) |
| API             | tRPC (end-to-end type safety) + TanStack Query (caching)                     |
| Database        | PostgreSQL + Kysely (SQL query builder, manual migrations)                   |
| Crypto          | libsodium (`libsodium-wrappers` browser, `sodium-native` Node)               |
| Testing         | Vitest + fast-check (property-based) + Playwright + axe-core (a11y)          |
| Telephony       | Twilio (initial) → Fonoster (future, self-hosted)                            |
| Hosting         | Hetzner VPS (EU), LUKS full-disk encryption, Caddy reverse proxy             |
| Package manager | pnpm (strict, workspace monorepo)                                            |
| Real-time       | SSE (server-sent events, metadata only, never encrypted content)             |

---

## Monorepo Structure

```
packages/
  client/      - SvelteKit web app (volunteer + admin + client portal)
  server/      - Node.js + tRPC API, auth, webhooks, relay endpoints
  crypto/      - Shared isomorphic encryption library (browser + Node)
  shared/      - Shared types, Zod schemas, enums
```

---

## Prerequisites

Before setting up the development environment, ensure you have:

| Tool         | Version  | Install                                                                                                                                 |
| ------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Node.js**  | 22.x LTS | [nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows)                                       |
| **pnpm**     | 10.x     | `corepack enable && corepack prepare pnpm@latest --activate`                                                                            |
| **Docker**   | Latest   | [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)                                                      |
| **Gitleaks** | Latest   | `scoop install gitleaks` (Windows) / `brew install gitleaks` (macOS) / [GitHub releases](https://github.com/gitleaks/gitleaks/releases) |

---

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

Key security principles:

- **Server cannot decrypt** - the org private key never exists on the server
- **E2E for all client-authored content** - encrypted in the browser before transmission
- **Telephony relay zeroes memory** - `Buffer.fill(0)` in `finally` blocks, no strings, no logging
- **Webhook signatures always validated** - even in development
- **2FA mandatory** - all volunteers, all environments
- **EU hosting** - Hetzner VPS, LUKS full-disk encryption, outside US legal jurisdiction

---

## License

See [LICENSE](LICENSE) for details.
