# CARE-Y

**Care Anonymized, Redacted, Encrypted - ████**

> **Pre-alpha.** Under active development. Not yet released.

A call intake and case management system for mutual aid organizations serving at-risk populations. Both clients and volunteers face real danger if their identities or case details are exposed. CARE-Y treats this as the primary design constraint, not an afterthought.

End-to-end encrypted. Self-hosted. Provider-agnostic telephony.

<p align="center">
  <img src="docs/images/iOS%20PWA%20Images/CARE-Y Home Dashboard.png" alt="CARE-Y dashboard showing shift status, queue counts, and priority tickets" width="200">
  <img src="docs/images/iOS%20PWA%20Images/CARE-Y Ticket List Filtered.png" alt="Ticket list with filter pills, priority badges, and message previews" width="200">
  <img src="docs/images/iOS%20PWA%20Images/CARE-Y Ticket Detail.png" alt="Ticket chat view with client messages, volunteer replies, and private notes" width="200">
  <img src="docs/images/iOS%20PWA%20Images/CARE-Y Knowledge Base Library.png" alt="Knowledge base with categorized articles and filters" width="200">
</p>

---

## What is CARE-Y?

CARE-Y is a rewrite of the Katie call intake system (Django 2.2, Twilio, Heroku) built for organizations where a database breach or legal subpoena could put real people in danger. Volunteers use CARE-Y to receive calls, manage cases, and coordinate responses through a mobile-first PWA. All client data is encrypted in the volunteer's browser before it reaches the server. The server stores ciphertext it cannot read.

The system is designed for small mutual aid nonprofits: crisis hotlines, legal aid referral networks, immigration support organizations. These groups handle sensitive information with limited technical resources and cannot afford the consequences of a data breach.

CARE-Y runs as a multi-tenant hosted service or a self-hosted single-tenant instance from the same codebase. Self-hosted deployments use BYOT (bring your own telephony) configuration.

---

## Why CARE-Y Exists

If a server can read the data it stores, so can anyone who compromises or subpoenas that server. For organizations where a breach means real people get hurt, that is not an acceptable tradeoff.

CARE-Y makes that scenario architecturally impossible. The server stores only ciphertext and encrypted key material. Decryption requires the volunteer's password plus cryptographic evaluation from two independent servers in separate legal jurisdictions. No single server, no single country, and no single breach can produce readable data. A subpoena to one hosting provider yields encrypted blobs and a single unusable key share.

**Threat model:**

- Database breach (full dump of all tables)
- Subpoena to hosting provider
- Subpoena to telephony provider (Twilio/SignalWire)
- Compromised volunteer device
- Rogue admin with server access
- State-level adversary with legal compulsion powers
- Network surveillance (identifying who connects to the service)

---

## Features

<p align="center">
  <img src="docs/images/iOS%20PWA%20Images/CARE-Y Light Mode.png" alt="CARE-Y dashboard in light mode" width="200">
  <img src="docs/images/iOS%20PWA%20Images/CARE-Y Admin User Panel.png" alt="Admin panel with user management, telephony, and org settings" width="200">
  <img src="docs/images/iOS%20PWA%20Images/CARE-Y Universal Search.png" alt="Cross-entity search across tickets and articles" width="200">
  <img src="docs/images/iOS%20PWA%20Images/CARE-Y KB Article Editor Typing.png" alt="Rich text editor with formatting toolbar and keyboard" width="200">
</p>

- **Encrypted case management.** Tickets, messages, case notes, and client data are encrypted in the browser. The server never sees plaintext.
- **SMS and voice integration.** Inbound texts are encrypted on arrival. Outbound messages pass through a stateless relay that zeros memory immediately after forwarding.
- **Knowledge base.** Rich text articles with categories, voting, and search. Content encrypted with the org key.
- **Queue-based routing.** Tickets are organized into org-defined queues with priority levels and assignment workflows.
- **Cross-entity search.** Unified search across tickets, knowledge base articles, and volunteers from a single interface. Provider-based architecture for adding new searchable entity types.
- **Role-based access.** Volunteer, Manager, and Admin roles with granular permissions. Encryption key status visible per user.
- **Mobile-first PWA.** Installable progressive web app with dark mode and offline asset caching. Encrypted content is never cached by the service worker.
- **i18n.** Compile-time translations via Paraglide JS. English and Spanish included, extensible to any language.

---

## Accessibility and Language

CARE-Y serves populations with varied technical literacy, device quality, and language needs. Accessibility is a design constraint, not an afterthought.

- **WCAG AA contrast enforcement.** Brand colors are adjusted algorithmically at runtime to meet 4.5:1 contrast ratios against all surface variants in both light and dark mode. This is not a one-time check. Every org's custom brand palette passes through the same contrast engine.
- **Focus management.** Modal sheets and dialogs use focus traps with Tab/Shift+Tab wrapping and focus restoration on dismiss. Keyboard activation (Enter/Space) on all interactive elements.
- **Reduced motion.** Animations respect `prefers-reduced-motion`. Users who need reduced motion get static alternatives.
- **Increased contrast.** `prefers-contrast: more` is respected across all interactive elements.
- **Screen reader support.** ARIA attributes across 50+ components, `aria-live` regions for dynamic content updates, and screen-reader-only text for context that relies on visual cues.
- **Multilingual.** English and Spanish translations via Paraglide JS (compile-time, tree-shaken). Adding a new language is a JSON file, not a code change.

---

## Exposure System

The Exposure system helps volunteers understand their own protection level without requiring security expertise. Many mutual aid volunteers are not technical. They may not know what a VPN does, whether their browser is leaking data, or why 2FA matters. The Exposure system makes this visible.

A persistent animated icon in the navigation bar reflects the volunteer's current protection coverage. Tapping it opens a detail page with per-layer status cards covering connection security, key health, session integrity, and device signals. Each card uses a two-part format: "What's happening" and "Why you should care." Contextual hints appear as toasts when volunteers take security-relevant actions (opening a ticket on public Wi-Fi, for example). A login summary on each session shows what changed since the last visit.

The goal is education through ambient awareness, not alarm fatigue. Volunteers learn security concepts through their own real-time state, not a training module.

The Exposure system is under active development.

---

## Client Portal

The client-facing intake form and portal use a three-tier communication model. Clients choose their level of protection based on their device capabilities and risk tolerance.

- **SMS/Email (default).** Works on any phone. Feature phones and burner phones supported. Zero friction. Org-side storage is encrypted, but the SMS/email channel itself is plaintext.
- **Secure Link.** Volunteer generates a portal link with cryptographic key material in the URL fragment (never sent to the server, per RFC 3986). Client reads and sends messages in the browser with no account or password required. Optional spoken passphrase adds a second factor for high-risk clients.
- **Encrypted Account.** Client creates an account with a password. Password derives a keypair, messages encrypted end-to-end. Strongest option. Twilio/email subpoena gets only a login URL.

All tiers receive the same care. The difference is the channel's technical protection level, and clients are informed about what each tier means.

The client portal is under active development.

---

## How Your Data Is Protected

CARE-Y encrypts everything before it leaves the volunteer's browser. The server stores only scrambled data it cannot read. Even if someone seizes the server, they get nothing usable.

<img src="docs/images/crypto-v2/simplified-transparent-crypto-v2-mermaid.png" alt="CARE-Y simplified crypto hierarchy: volunteer password derives split keys across two OPRF servers, producing encryption keys for client data, org resources, and public branding" width="800">

**What this means in practice:**

| What's protected                                | Who can read it                                      | What an attacker gets if they seize the server                                                                                    |
| ----------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Client data** (tickets, messages, case notes) | Only the specific volunteers assigned to that ticket | Nothing. Decryption requires the volunteer's password AND both servers in two countries cooperating. No single seizure is enough. |
| **Org resources** (KB articles, settings)       | Any logged-in volunteer in that org                  | Nothing. Still requires a volunteer's password to unlock.                                                                         |
| **Public branding** (logo, name, color)         | Anyone who visits the intake page                    | Visual identity only. This is intentionally public so clients recognize the org.                                                  |
| **Phone credentials** (Twilio config)           | The server itself (automated)                        | Phone system API access only. No client data, no volunteer keys.                                                                  |

**Key guarantees:**

- **The server cannot read client data.** All decryption happens in the volunteer's browser.
- **No single country can force decryption.** The two OPRF servers are in different countries (Germany and Iceland). A court order in one country only gets half the puzzle.
- **The split changes daily.** Even if someone captures one server's share, it expires within 24 hours.
- **Phone calls and texts are not stored.** Outbound messages pass through the server and are erased from memory immediately.
- **Inbound texts are encrypted on arrival.** The phone provider retains its own copy for ~30 days (federal law), but CARE-Y's copy is encrypted the moment it arrives.
- **Escrow for emergencies.** Four separate recovery keys on offline USB drives held by different custodians.

<details>
<summary><b>E2EE Technical Details</b></summary>

#### Key Hierarchy (Dual-Tier, OPRF-Based)

CARE-Y uses a dual-tier encryption model. PII (tickets, client data) is protected by OPRF-based split-key derivation: the volunteer's password is hardened via a threshold OPRF protocol across two servers in separate jurisdictions, producing a `masterKey` that derives per-volunteer ECIES keys. No per-ticket server round-trip is needed for decryption. Non-PII shared resources (KB articles, org config) use a standard wrapped org key.

<img src="docs/images/crypto-v2/crypto-v2-mermaid-transparent.png" alt="CARE-Y full crypto key hierarchy: OPRF-based split-key derivation, ECIES per-volunteer wrapping, dual-tier encryption for PII and org data, and operational secrets" width="800">

| Tier                   | Data                                                                      | Decryption requires                                                                                                                            | What's exposed if compromised                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **PII** (OPRF + ECIES) | Tickets, client data, messages                                            | OPRF-derived `masterKey` (via volunteer password + both OPRF servers) + ECIES per-volunteer wrapping of `tk`. No per-ticket server round-trip. | Nothing. No single server holds enough to decrypt PII.                                                                                                             |
| **Non-PII** (org key)  | KB articles, org config                                                   | Volunteer's `org_unwrap_key` (derived from `masterKey`) to unwrap org private key                                                              | Org configuration only. No PII.                                                                                                                                    |
| **Client branding**    | Public-facing branding                                                    | Org public key (intentionally public)                                                                                                          | Visual assets only (logo, name, color). Already public by design.                                                                                                  |
| **Operational**        | Telephony creds, provider config, volunteer identifiers, session metadata | `OPS_SECRETS_KEY` (server secrets file)                                                                                                        | Telephony API access and encrypted volunteer/session metadata. No volunteer key material. Full server compromise required to decrypt (DB alone yields ciphertext). |

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

---

## Architecture

```
CLIENT (browser)                    SERVER (API)
All encrypt/decrypt happens here    Stores only ciphertext
Keys derived via OPRF at login      Routes requests, manages auth
Crypto runs in Web Worker           Stateless relay for telephony
                                    Holds OPRF share (evaluated at login)
                                    Wraps tk via ECIES to volunteer public keys
```

Each organization gets an isolated PostgreSQL schema (`org_<uuid>`). Cross-org queries are structurally impossible at the SQL layer via Kysely `.withSchema()` AST transformation. No session state, no `SET search_path`.

**Data flow:**

- **Web intake forms and case notes:** true end-to-end encryption. Plaintext never reaches the server.
- **Outbound SMS/calls:** volunteer's browser decrypts, sends to one-shot relay endpoint, server forwards to telephony provider and zeros the buffer immediately. Never stored, never logged.
- **Inbound SMS:** encrypted on receipt, plaintext purged. Telephony provider retains independently (~30 days).
- **Telephony abstraction:** Twilio initially, SignalWire hybrid (self-hosted voice) planned. Provider swap, not rewrite.

---

## Tech Stack

| Layer           | Technology                                                                   |
| --------------- | ---------------------------------------------------------------------------- |
| Language        | TypeScript (ESM, `strict: true`)                                             |
| Frontend        | SvelteKit (Svelte 5 runes) + Konsta UI (mobile) + Bits UI (accessible forms) |
| Rich text       | ProseMirror (knowledge base editor)                                          |
| Styling         | Tailwind CSS v4 + Lucide icons                                               |
| API             | tRPC v11 + @tanstack/svelte-query v6 (stale-while-revalidate caching)        |
| Validation      | Zod v4 (shared schemas between client and server)                            |
| Database        | PostgreSQL + Kysely (SQL query builder, manual migrations)                   |
| Crypto          | libsodium (`libsodium-wrappers-sumo` browser, `sodium-native` Node)          |
| Sanitization    | DOMPurify (XSS protection for rendered content)                              |
| i18n            | Paraglide JS v2 (compile-time translations, tree-shaking, SSR)               |
| Testing         | Vitest + fast-check (property-based) + Playwright + axe-core (a11y)          |
| Telephony       | Twilio (initial), SignalWire (future, self-hosted voice)                     |
| Hosting         | Hetzner VPS (EU), LUKS full-disk encryption, Caddy reverse proxy             |
| PWA             | @vite-pwa/sveltekit (service worker, offline caching via Workbox)            |
| Real-time       | SSE (server-sent events, metadata only, never encrypted content)             |
| Package manager | pnpm (strict, workspace monorepo)                                            |

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

| Tool         | Version  | Install                                                                                                                                 |
| ------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Node.js**  | 22.x LTS | [nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows)                                       |
| **pnpm**     | 10.x     | `corepack enable && corepack prepare pnpm@latest --activate`                                                                            |
| **Docker**   | Latest   | [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)                                                      |
| **Gitleaks** | Latest   | `scoop install gitleaks` (Windows) / `brew install gitleaks` (macOS) / [GitHub releases](https://github.com/gitleaks/gitleaks/releases) |

---

## Status

CARE-Y is in active development. The backend (auth, crypto, telephony, ticket system) is functionally complete with telephony hardening still pending. The frontend volunteer app is roughly halfway through implementation (design system, dashboard, ticket views, knowledge base, and parts of admin are built; onboarding, client portal, shift scheduling, and production infrastructure remain).

---

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

Key security principles:

- **Server cannot decrypt client data.** Decryption requires the volunteer's password plus OPRF evaluation from both threshold servers.
- **E2E for all client-authored content.** Encrypted in the browser before transmission.
- **Telephony relay zeroes memory.** `Buffer.fill(0)` in `finally` blocks, no strings, no logging.
- **Webhook signatures always validated**, even in development.
- **2FA mandatory for data access.** All volunteers, all environments. Authentication succeeds without 2FA, but accessing any encrypted data requires a verified second factor.
- **EU hosting.** Hetzner VPS, LUKS full-disk encryption, outside US legal jurisdiction.

---

## License

AGPL-3.0-only. See [LICENSE](LICENSE) for details.
