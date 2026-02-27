# CARE-Y

**Care Anonymized, Redacted, Encrypted - ████**

> **Pre-alpha.** This project is under active development. No code has been released yet.

CARE-Y is a call intake and support system for at-risk populations actively targeted by powerful groups. It serves mutual-aid nonprofits where clients' identity, contact information, and case details are dangerous in the wrong hands.

CARE-Y is a full rewrite of the Katie call intake system from DARIA Engineering (Django 2.2, Twilio, Heroku) with **security-first architecture**.

End-to-end encrypted, self-hosted, provider-agnostic telephony.

---

## Why CARE-Y Exists

CARE-Y makes bulk decryption architecturally impossible. The server stores only ciphertext and ECIES-wrapped ticket keys. Decryption keys are derived via a split-key OPRF protocol (RFC 9497) across two servers in separate jurisdictions. It **cannot decrypt PII alone** because decryption requires the volunteer's password plus OPRF evaluation from both servers. No single server can derive the decryption key. A subpoena to one hosting provider yields encrypted blobs and a single unusable OPRF share.

**Threat model:**

- Database breach (full dump of all tables)
- Subpoena to hosting provider
- Subpoena to telephony provider (Twilio/SignalWire)
- Compromised volunteer device
- Rogue admin with server access
- State-level adversary with legal compulsion powers

---

## Architecture

```
CLIENT (browser)                    SERVER (API)
────────────────                    ────────────
All encrypt/decrypt happens here    Stores only ciphertext
Keys derived via OPRF at login      Routes requests, manages auth
Crypto runs in Web Worker           Stateless relay for telephony
                                    Holds OPRF share (evaluated at login)
                                    Wraps tk via ECIES to volunteer public keys
```

Each organization gets an isolated PostgreSQL schema. Cross-org queries are structurally impossible at the SQL layer, not just access-controlled.

### How Your Data Is Protected

CARE-Y encrypts everything before it leaves the volunteer's browser. The server stores only scrambled data it cannot read. Even if someone seizes the server, they get nothing usable.

```mermaid
graph TD
    subgraph legend ["Legend"]
        direction LR
        L1["Password"]:::password ~~~ L2["Derived key"]:::derived ~~~ L3["Split verification"]:::oprf ~~~ L4["Client data"]:::pii ~~~ L5["Org resources"]:::org ~~~ L6["Public branding"]:::branding ~~~ L7["Server config"]:::ops
    end

    legend --> PW & OPS

    PW["<b>Volunteer's Password</b><br/>The only thing you need to remember"]:::password
    OPS["<b>Server Config Key</b><br/>Stored in a locked file on the server.<br/>Used only for phone system credentials."]:::ops
    OPSD["<b>Phone System Credentials</b><br/>Twilio account info, encrypted at rest"]:::ops

    OPS -->|encrypts| OPSD

    ST["<b>Hardened Password</b><br/>Your password is strengthened<br/>so it can't be guessed"]:::derived
    BL["<b>Disguised Password</b><br/>Scrambled so neither server<br/>can see the real password"]:::oprf

    PW -->|strengthen| ST -->|disguise| BL

    linkStyle 6 stroke:none,stroke-width:0
    linkStyle 7 stroke:none,stroke-width:0

    SA["<b>Server A</b><br/>Germany"]:::oprf
    SB["<b>Server B</b><br/>Iceland"]:::oprf
    OO["<b>Combined Result</b><br/>Neither server alone knows<br/>your secret. Both are needed."]:::oprf

    BL -->|"verify (partial)"| SA & SB
    SA & SB -->|combine| OO

    MK["<b>Your Secret Key</b><br/>Lives only in your browser.<br/>Never sent to any server."]:::derived

    OO -->|derive| MK

    VP["<b>Personal Private Key</b><br/>Unlocks tickets assigned to you"]:::derived
    VPub["<b>Personal Public Key</b><br/>Shared with the server so others<br/>can lock tickets for you"]:::derived
    OUK["<b>Org Unlock Key</b><br/>Unlocks shared org resources"]:::derived

    MK -->|derive| VP -->|publish| VPub
    MK -->|derive| OUK

    TK["<b>Ticket Key</b><br/>Each ticket has its own key.<br/>Locked individually for each volunteer."]:::pii
    OrgSK["<b>Org Private Key</b><br/>Unlocks KB articles and org settings"]:::org
    OrgPub["<b>Org Public Key</b><br/>Public. Used to derive the<br/>branding key below."]:::org
    BK["<b>Branding Key</b><br/>Derived from the org's public key.<br/>Public intake pages can read branding."]:::branding

    VPub -->|lock for you| TK
    VP -.->|you unlock| TK
    OUK -->|unlock| OrgSK
    OrgSK -.->|public counterpart| OrgPub
    OrgPub -->|derive| BK

    PIID["<b>Client Data (encrypted)</b><br/>Tickets, messages, case notes.<br/>Only assigned volunteers can read."]:::pii
    OrgData["<b>Org Resources (encrypted)</b><br/>KB articles, org config.<br/>Any logged-in volunteer can read."]:::org
    BD["<b>Public Branding</b><br/>Logo, name, color.<br/>Visible on intake pages."]:::branding

    TK -->|encrypts| PIID
    OrgSK -->|encrypts| OrgData
    BK -->|encrypts| BD

    classDef password fill:#fbbf24,stroke:#92400e,color:#000
    classDef derived fill:#60a5fa,stroke:#1e40af,color:#000
    classDef oprf fill:#f87171,stroke:#991b1b,color:#000
    classDef pii fill:#fb923c,stroke:#9a3412,color:#000
    classDef org fill:#a78bfa,stroke:#5b21b6,color:#000
    classDef branding fill:#34d399,stroke:#065f46,color:#000
    classDef ops fill:#94a3b8,stroke:#334155,color:#000
```

**What this means in practice:**

| What's protected | Who can read it | What an attacker gets if they seize the server |
| --- | --- | --- |
| **Client data** (tickets, messages, case notes) | Only the specific volunteers assigned to that ticket | Nothing. Decryption requires the volunteer's password AND both servers in two countries cooperating. No single seizure is enough. |
| **Org resources** (KB articles, settings) | Any logged-in volunteer in that org | Nothing. Still requires a volunteer's password to unlock. |
| **Public branding** (logo, name, color) | Anyone who visits the intake page | Visual identity only. This is intentionally public so clients recognize the org. |
| **Phone credentials** (Twilio config) | The server itself (automated) | Phone system API access only. No client data, no volunteer keys. |

**Key guarantees:**

- **The server cannot read client data.** All decryption happens in the volunteer's browser. The server stores scrambled data it cannot unscramble.
- **No single country can force decryption.** The two verification servers are in different countries (Germany and Iceland). A court order in one country only gets half the puzzle.
- **The split changes daily.** Even if someone captures one server's half, it expires within 24 hours.
- **Phone calls and texts are not stored.** Outbound messages pass through the server and are erased from memory immediately. The server never saves them.
- **Inbound texts are encrypted on arrival.** The phone provider keeps its own copy for ~30 days (federal law requires this for all phone providers), but CARE-Y's copy is encrypted the moment it arrives.
- **Escrow for emergencies.** Four separate recovery keys are stored on offline USB drives held by different people. If both servers are lost, the org can recover.

---

- **Web intake forms and case notes:** true end-to-end encryption. Plaintext never reaches the server.
- **Outbound SMS/calls:** volunteer's browser decrypts, sends to one-shot relay endpoint, server forwards to telephony provider and zeros the buffer immediately. Never stored, never logged.
- **Inbound SMS:** encrypted on receipt, plaintext purged. Telephony provider retains independently (~30 days).
- **Telephony abstraction:** Twilio initially, SignalWire hybrid (self-hosted voice) planned. Provider swap, not rewrite.

---

<details>
<summary><b>E2EE Technical details</b></summary>

#### Key Hierarchy (Dual-Tier, OPRF-Based)

CARE-Y uses a dual-tier encryption model. PII (tickets, client data) is protected by OPRF-based split-key derivation: the volunteer's password is hardened via a threshold OPRF protocol across two servers in separate jurisdictions, producing a `masterKey` that derives per-volunteer ECIES keys. No per-ticket server round-trip is needed for decryption. Non-PII shared resources (KB articles, org config) use a standard wrapped org key.

```mermaid
graph TD
    subgraph legend ["Legend"]
        direction LR
        L1["Password"]:::password ~~~ L2["Derived key"]:::derived ~~~ L3["OPRF"]:::oprf ~~~ L4["PII tier"]:::pii ~~~ L5["Org tier"]:::org ~~~ L6["Branding tier"]:::branding ~~~ L7["Operational"]:::ops
    end

    legend --> PW & OPS

    PW["<b>Password</b>"]:::password
    OPS["<b>OPS_SECRETS_KEY</b><br/>256-bit, secrets file, server-only"]:::ops
    OPSD["<b>Operational Secrets</b><br/>Telephony creds, config"]:::ops

    OPS -->|XSalsa20-Poly1305| OPSD

    ST["<b>stretched</b><br/>Argon2id(password, salt)"]:::derived
    BL["<b>blinded</b><br/>OPRF.Blind(stretched)"]:::oprf

    PW -->|Argon2id| ST -->|Blind| BL

    linkStyle 6 stroke:none,stroke-width:0
    linkStyle 7 stroke:none,stroke-width:0

    SA["<b>Server A</b><br/>OPRF share A, Hetzner DE"]:::oprf
    SB["<b>Server B</b><br/>OPRF share B, Iceland"]:::oprf
    OO["<b>oprf_output</b><br/>OPRF.Finalize(combined)"]:::oprf

    BL -->|PartialEval| SA & SB
    SA & SB -->|Lagrange interpolate| OO

    MK["<b>master_key</b><br/>HKDF(oprf_output), Web Worker"]:::derived

    OO -->|HKDF-SHA512| MK

    VP["<b>vol_private</b><br/>ristretto255 scalar"]:::derived
    VPub["<b>vol_public</b><br/>ristretto255 point, published"]:::derived
    OUK["<b>org_unwrap_key</b><br/>symmetric unwrap key"]:::derived

    MK -->|"HKDF(ecies-private)"| VP -->|"scalar × base"| VPub
    MK -->|"HKDF(org-key-unwrap)"| OUK

    TK["<b>tk</b> (ticket key)<br/>256-bit symmetric"]:::pii
    OrgSK["<b>Org Private Key</b><br/>wrapped per-volunteer"]:::org
    OrgPub["<b>Org Public Key</b><br/>published"]:::org
    BK["<b>Branding Key</b><br/>generichash(org public key)"]:::branding

    VPub -->|ECIES wrap| TK
    VP -.->|ECIES unwrap| TK
    OUK -->|unwrap| OrgSK
    OrgSK -.->|public counterpart| OrgPub
    OrgPub -->|generichash| BK

    PIID["<b>PII Ciphertext</b><br/>Tickets, client data, messages"]:::pii
    OrgData["<b>Non-PII Ciphertext</b><br/>KB articles, org config"]:::org
    BD["<b>Client Branding</b><br/>Logo, name, color"]:::branding

    TK -->|XSalsa20-Poly1305| PIID
    OrgSK -->|XSalsa20-Poly1305| OrgData
    BK -->|XSalsa20-Poly1305| BD

    classDef password fill:#fbbf24,stroke:#92400e,color:#000
    classDef derived fill:#60a5fa,stroke:#1e40af,color:#000
    classDef oprf fill:#f87171,stroke:#991b1b,color:#000
    classDef pii fill:#fb923c,stroke:#9a3412,color:#000
    classDef org fill:#a78bfa,stroke:#5b21b6,color:#000
    classDef branding fill:#34d399,stroke:#065f46,color:#000
    classDef ops fill:#94a3b8,stroke:#334155,color:#000
```

| Tier | Data | Decryption requires | What's exposed if compromised |
| ---- | ---- | ------------------- | ----------------------------- |
| **PII** (OPRF + ECIES) | Tickets, client data, messages | OPRF-derived `masterKey` (via volunteer password + both OPRF servers) + ECIES per-volunteer wrapping of `tk`. No per-ticket server round-trip. | Nothing. No single server holds enough to decrypt PII. |
| **Non-PII** (org key) | KB articles, org config | Volunteer's `org_unwrap_key` (derived from `masterKey`) to unwrap org private key | Org configuration only. No PII. |
| **Client branding** | Public-facing branding | Org public key (intentionally public) | Visual assets only (logo, name, color). Already public by design. |
| **Operational** | Telephony creds, provider config | `OPS_SECRETS_KEY` (server secrets file) | Telephony provider API access only. No volunteer key material. |

**How PII decryption works (per ticket):**

1. At login, volunteer derives `masterKey` via OPRF (password -> Argon2id -> OPRF evaluation from both servers -> HKDF)
2. Web Worker derives `volPrivate` from `masterKey` (one-time, cached for session)
3. To view a ticket, Worker fetches the ECIES-wrapped `tk` from `ticket_key_wraps` via tRPC
4. Worker unwraps `tk` using ECIES: computes shared secret from `volPrivate` and the stored ephemeral point, derives K, decrypts `tk`
5. Worker decrypts ticket content with `tk` (XSalsa20-Poly1305)
6. Plaintext exists only in the Worker's memory for the duration of the session. No server round-trip per ticket.

**Seizure resistance:** OPRF key is split across two servers in separate jurisdictions (EU + non-EU). Shares are refreshed every 24 hours. A seized share from one epoch is useless in the next. See `docs/design-ref/crypto-architecture-v2.md` section 9.

**Post-quantum hybrid:** Classical OPRF at launch. HKDF interface designed for ML-KEM-768 hybrid layer (v1.1). The system is secure if either classical OPRF or ML-KEM holds.

**Escrow:** Four separate passphrase-encrypted escrow files on separate offline USB drives, held by different custodians: (1) OPRF key (full key reconstructed from shares for escrow only), (2) org private key, (3) `OPS_SECRETS_KEY`, (4) [future] ML-KEM master. Never bundled.

</details>

## Tech Stack

| Layer           | Technology                                                                   |
| --------------- | ---------------------------------------------------------------------------- |
| Language        | TypeScript (ESM, `strict: true`)                                             |
| Frontend        | SvelteKit (Svelte 5 runes) + Konsta UI (mobile) + Bits UI (accessible forms) |
| API             | tRPC (end-to-end type safety) + TanStack Query (caching)                     |
| Database        | PostgreSQL + Kysely (SQL query builder, manual migrations)                   |
| Crypto          | libsodium (`libsodium-wrappers-sumo` browser, `sodium-native` Node)           |
| Testing         | Vitest + fast-check (property-based) + Playwright + axe-core (a11y)          |
| Telephony       | Twilio (initial) → SignalWire (future, self-hosted voice)                    |
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

- **Server cannot decrypt alone:** PII decryption requires the volunteer's password plus OPRF evaluation from both servers. No single server can derive the decryption key.
- **E2E for all client-authored content:** encrypted in the browser before transmission
- **Telephony relay zeroes memory:** `Buffer.fill(0)` in `finally` blocks, no strings, no logging
- **Webhook signatures always validated**, even in development
- **2FA mandatory:** all volunteers, all environments
- **EU hosting:** Hetzner VPS, LUKS full-disk encryption, outside US legal jurisdiction

---

## License

AGPL-3.0-only. See [LICENSE](LICENSE) for details.

CARE-Y supports both hosted multi-tenant deployment and self-hosted single-tenant deployment from the same codebase. Self-hosted instances use BYOT (bring your own telephony) configuration.
