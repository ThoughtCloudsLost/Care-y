# CARE-Y

**Care Anonymized, Redacted, Encrypted - ████**

[![CI](https://github.com/ThoughtCloudsLost/Care-y/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ThoughtCloudsLost/Care-y/actions/workflows/ci.yml)
[![Security Scan](https://github.com/ThoughtCloudsLost/Care-y/actions/workflows/security-scan.yml/badge.svg?branch=main)](https://github.com/ThoughtCloudsLost/Care-y/actions/workflows/security-scan.yml)
[![License: AGPL-3.0](https://img.shields.io/github/license/ThoughtCloudsLost/Care-y)](LICENSE)

> **Pre-alpha.** Under active development. Not yet released.

A call intake and case management system for mutual aid organizations serving at-risk populations. Both clients and volunteers face real danger if their identities or case details are exposed. CARE-Y is built so that even a seized server reveals nothing about who sought help or who provided it.

**[Try the interactive handbook](https://handbook.care-y.org)** to read the documentation and try the real application running fully locally in your browser.

The handbook runs the real frontend, server, and PostgreSQL database (via WebAssembly) entirely in your browser. Every interaction fires actual API calls against that database, and ticket decryption happens client-side with real keys. Organizations considering CARE-Y can operate the product themselves before trusting it, and volunteers use the handbook for onboarding.

<p align="center">
  <img src="docs/images/ios-pwa/care-y-home-dashboard.png" alt="CARE-Y dashboard showing shift status, queue counts, and priority tickets" width="200">
  <img src="docs/images/ios-pwa/care-y-ticket-list-filtered.png" alt="Ticket list with filter pills, priority badges, and message previews" width="200">
  <img src="docs/images/ios-pwa/care-y-ticket-detail.png" alt="Ticket chat view with client messages, volunteer replies, and private notes" width="200">
  <img src="docs/images/ios-pwa/care-y-knowledge-base-library.png" alt="Knowledge base with categorized articles and search" width="200">
</p>

---

## What is CARE-Y?

CARE-Y is built for organizations where a database breach or legal subpoena could put real people in danger. Volunteers use CARE-Y to receive calls, manage cases, and coordinate responses through a mobile-first PWA. All client data is encrypted in the volunteer's browser before it reaches the server. The server stores ciphertext it cannot read.

The system is designed for small mutual aid organizations and nonprofits. These groups handle sensitive information with limited technical resources, and a data breach can have devastating consequences to both the members of the organization and the people they provide aid to.

CARE-Y runs as a multi-tenant hosted service or a self-hosted single-tenant instance from the same codebase. Self-hosted deployments use BYOT (bring your own telephony) configuration. ([handbook: telephony provider setup](https://handbook.care-y.org/#admin-comms/provider))

---

## Why CARE-Y Exists

If a server can read the data it stores, so can anyone who compromises or subpoenas that server. For organizations where a breach means real people could get hurt, that is not an acceptable tradeoff.

CARE-Y makes that scenario architecturally impossible. The server stores only ciphertext and encrypted key material. Decryption requires the volunteer's password plus cryptographic evaluation from two independent servers in separate legal jurisdictions. A breach of any one component produces nothing readable. A subpoena to one hosting provider gets encrypted blobs and a single unusable key share.

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
  <img src="docs/images/ios-pwa/care-y-dark-mode.png" alt="CARE-Y dashboard in dark mode with table view and queue overview" width="200">
  <img src="docs/images/ios-pwa/care-y-admin-panel.png" alt="Admin navigation panel with people, communications, and org settings" width="200">
  <img src="docs/images/ios-pwa/care-y-org-settings.png" alt="Organization settings with branding, colors, and custom terminology" width="200">
  <img src="docs/images/ios-pwa/care-y-universal-search.png" alt="Cross-entity search across tickets, articles, and volunteers" width="200">
</p>

<p align="center">
  <img src="docs/images/ios-pwa/care-y-desktop-dashboard.png" alt="Desktop dashboard with two-column layout, sidebar navigation, and table views" width="100%">
</p>
<p align="center">
  <img src="docs/images/ios-pwa/care-y-desktop-tickets.png" alt="Desktop split view with ticket list and ticket detail side by side" width="100%">
</p>

- **Encrypted case management.** Tickets, messages, case notes, and client data are encrypted with per-ticket keys in the browser before reaching the server. ([handbook: ticket decryption](https://handbook.care-y.org/#tickets/decryption), [ticket detail](https://handbook.care-y.org/#ticket-detail))
- Inbound texts are **encrypted on arrival**. Outbound messages pass through a stateless relay that zeros memory after forwarding. ([handbook: conversation](https://handbook.care-y.org/#ticket-detail/conversation))
- **Knowledge base** with rich text articles, categories, voting, and search. Content encrypted with the org key before reaching the server. ([handbook: library](https://handbook.care-y.org/#library))
- **Queue-based routing.** Tickets go into org-defined queues with priority levels and assignment workflows. ([handbook: queue management](https://handbook.care-y.org/#admin-people/queues))
- **Unified search** across tickets, knowledge base articles, and volunteers from a single interface. ([handbook: search](https://handbook.care-y.org/#search))
- **Role-based access.** Volunteer, Manager, and Admin roles with granular permissions. Encryption key status visible per user. ([handbook: roles](https://handbook.care-y.org/#admin-people/roles))
- Installable **PWA** with dark mode and offline asset caching. The service worker never caches encrypted content.
- **i18n** via Paraglide JS (compile-time, tree-shaken). English and Spanish included. ([handbook: language selection](https://handbook.care-y.org/#login/language))

---

## Accessibility and Language

CARE-Y serves populations with varied technical backgrounds and language needs.

- **WCAG AA contrast enforcement.** Each org sets its own brand colors. A contrast engine adjusts them at runtime to meet 4.5:1 ratios in both light and dark mode. ([handbook: branding](https://handbook.care-y.org/#admin-org/branding))
- **Focus management.** Modal sheets and dialogs use focus traps with Tab/Shift+Tab wrapping and focus restoration on dismiss. Keyboard activation (Enter/Space) on all interactive elements.
- **Reduced motion.** Animations respect `prefers-reduced-motion`. Users who need reduced motion get static alternatives.
- **Increased contrast.** `prefers-contrast: more` is respected across all interactive elements.
- **Screen reader support.** All interactive elements carry ARIA labels. Dynamic content changes are announced, and visual-only cues have text equivalents.
- **Multilingual.** English and Spanish translations via Paraglide JS (compile-time, tree-shaken). Adding a new language requires only adding JSON file. ([handbook: language selection](https://handbook.care-y.org/#login/language))

---

## Exposure System

Many of CARE-Y's users are not technical. The Exposure system teaches security through the volunteer's own session instead of a training module.

**What the system protects.** CARE-Y encrypts all client data in the browser. The server stores ciphertext it cannot read. The Exposure system explains this in plain language so volunteers understand what is protected and why it matters.

**How much of that protection the volunteer is using.** Some protections are architectural and always active (encryption). Others depend on choices the volunteer or their admin makes. A hardware security key prevents phishing. A Tor connection hides who is using the service. Self-hosted voice keeps call audio off third-party servers. The Exposure system shows which protections are active and what can be done to turn on the rest.

**What the system cannot protect.** A compromised device or a malicious browser extension can read decrypted content, and CARE-Y cannot prevent that. The onboarding walkthrough and login summary name these risks directly and tell volunteers what to do about them. Contextual notifications reinforce this at the moment it matters. Opening an SMS-originated ticket, for example, reminds the volunteer that the original text passed through the phone provider before it was encrypted. ([handbook: exposure hints](https://handbook.care-y.org/#ticket-detail/exposure-hints))

The Exposure system is partially built and expanding. See [Roadmap](#roadmap) for status.

---

## Client Portal

The client-facing intake form and portal use a three-tier communication model. Clients choose their level of protection based on their device capabilities and risk tolerance.

- **SMS/Email (default).** Works on any phone. Org-side storage is encrypted, but the SMS/email channel itself is plaintext.
- **Secure Link.** Volunteer generates a portal link with cryptographic key material in the URL fragment (never sent to the server, per RFC 3986). Client reads and sends messages in the browser with no account or password required. Optional link passphrase adds a second factor for high-risk clients.
- **Encrypted Account.** Client creates an account with a password. Password derives a keypair, messages encrypted end-to-end. This is the strongest option for high-risk clients. All communication goes through the client portal. Text and email notifications send only "You have a new message" with a sign-in link. A Twilio or email subpoena gets only a login URL.

The tiers differ in channel protection, not in service quality. Clients are told what each tier's protection level means.

---

## Fund Accounting

Organizations define funds available per client intake queue and show each fund's available balance on the dashboard and on each case, at the moment it matters. Client intake queues can be linked to the funding buckets designated for specific client needs, such as grant-restricted funds or donations earmarked for a particular cause. When a case enters the appropriate queue, those funds are automatically associated with the case, allowing organizations to see exactly how much funding is available for that need. Volunteers can record disbursements directly from a case. Financial data is encrypted in the browser before it reaches the server, so a seized database reveals no dollar amounts, no fund balances, and no record of which person received money.

- **Fundraising platforms.** Orgs can connect donation platforms like [Givebutter](https://help.givebutter.com/en/articles/5489015-how-to-access-the-givebutter-public-api-key) so that incoming totals update automatically. Donor names and contact details never enter CARE-Y. Everything also works with no platform connected, with volunteers recording transactions by hand.
- **Direct aid delivery (future).** On the same foundation, a later feature will let volunteers send aid from within a case through providers like [Tremendous](https://developers.tremendous.com/docs/introduction?_gl=1*c9kll1*_gcl_aw*R0NMLjE3ODk2MTYzOTkuRUFJYUlRb2JDaE1JMFltSjNkajBsZ01WMHpNSUJSMWpOQXBYRUFBWUFpQUFFZ0tVRWZEX0J3RQ..*_gcl_au*MTk2NDE1NDc1Mi4xNzg5NjE2Mzk5) with configurable approval workflows, with recipient details encrypted like other case data.

Fund accounting is not yet implemented. See [Roadmap](#roadmap) for status.

---

## How Your Data Is Protected

CARE-Y encrypts data in the volunteer's browser. The server stores only ciphertext it cannot read. ([handbook: key derivation](https://handbook.care-y.org/#login/key-derivation))

<img src="docs/images/crypto-v2/simplified-transparent-crypto-v2-mermaid.png" alt="CARE-Y simplified crypto hierarchy: volunteer password derives split keys across two OPRF servers, producing encryption keys for client data, org resources, and public branding" width="800">

**Protection by data type:**

| What's protected                                | Who can read it                                                                                                                        | What an attacker gets if they seize the server                                                                                                                                                                                                                                                              |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Client data** (tickets, messages, case notes) | Only the specific volunteers assigned to that ticket                                                                                   | Nothing. Decryption requires the volunteer's password AND both servers in two countries cooperating. No single seizure is enough.                                                                                                                                                                           |
| **Org resources** (KB articles, settings)       | Any logged-in volunteer in that org                                                                                                    | Nothing. Still requires a volunteer's password to unlock.                                                                                                                                                                                                                                                   |
| **Public branding** (logo, name, color)         | Anyone who visits the intake page                                                                                                      | Visual identity only. This is intentionally public so clients recognize the org.                                                                                                                                                                                                                            |
| **Phone credentials** (Twilio config)           | The server itself (automated)                                                                                                          | Phone system API access only. No client data, no volunteer keys.                                                                                                                                                                                                                                            |
| **Fund data** (planned)                         | Fund balances are readable by any logged-in volunteer. Which case received money is readable only by volunteers assigned to that case. | Entry counts and timestamps per fund (metadata only). No readable amounts, no fund balances, no money-to-person link. Balances are computed in the volunteer's browser, never on the server. A full server compromise also yields donation platform API access (same situation as phone credentials above). |

**Key guarantees:**

- **The server cannot read client data.** All decryption happens in the volunteer's browser.
- **No single country can force decryption.** The two OPRF servers are in different countries (Germany and Iceland). A court order in one country only gets half the puzzle.
- **The split changes daily.** Even if someone captures one server's share, it expires within 24 hours.
- **Phone calls and texts are not stored.** Outbound messages pass through the server and are erased from memory immediately.
- **Inbound texts are encrypted on arrival.** The phone provider retains its own copy for ~30 days (federal law), but CARE-Y's copy is encrypted the moment it arrives.
- **Escrow for emergencies.** Four separate recovery keys on offline USB drives held by different custodians. ([handbook: key management](https://handbook.care-y.org/#admin-org/keys))

<details>
<summary><b>E2EE Technical Details</b></summary>

#### Key Hierarchy (Dual-Tier, OPRF-Based)

CARE-Y uses a dual-tier encryption model. PII (tickets, client data) is protected by OPRF-based split-key derivation. The volunteer's password is hardened via a threshold OPRF protocol across two servers in separate jurisdictions, producing a `masterKey` that derives per-volunteer ECIES keys. No per-ticket server round-trip is needed for decryption. Non-PII shared resources (KB articles, org config) use a standard wrapped org key.

<img src="docs/images/crypto-v2/crypto-v2-mermaid-transparent.png" alt="CARE-Y full crypto key hierarchy: OPRF-based split-key derivation, ECIES per-volunteer wrapping, dual-tier encryption for PII and org data, and operational secrets" width="800">

| Tier                   | Data                                                                      | Decryption requires                                                                                                                           | What's exposed if compromised                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **PII** (OPRF + ECIES) | Tickets, client data, messages                                            | OPRF-derived`masterKey` (via volunteer password + both OPRF servers) + ECIES per-volunteer wrapping of `tk`. No per-ticket server round-trip. | Nothing. No single server holds enough to decrypt PII.                                                                                |
| **Non-PII** (org key)  | KB articles, org config                                                   | Volunteer's`org_unwrap_key` (derived from `masterKey`) to unwrap org private key                                                              | Org configuration only. No PII.                                                                                                       |
| **Client branding**    | Public-facing branding                                                    | Org public key (intentionally public)                                                                                                         | Visual assets only (logo, name, color). Already public by design.                                                                     |
| **Operational**        | Telephony creds, provider config, volunteer identifiers, session metadata | `OPS_SECRETS_KEY` (server secrets file)                                                                                                       | Telephony API access and encrypted volunteer/session metadata. No volunteer key material. Full server compromise required to decrypt. |

**How PII decryption works (per ticket):**

1. At login, volunteer derives `masterKey` via OPRF (password -> Argon2id -> OPRF evaluation from both servers -> HKDF)
2. Web Worker derives `volPrivate` from `masterKey` (one-time, cached for session)
3. To view a ticket, Worker fetches the ECIES-wrapped `tk` from `ticket_key_wraps` via tRPC
4. Worker unwraps `tk` using ECIES: computes shared secret from `volPrivate` and the stored ephemeral point, derives K, decrypts `tk`
5. Worker decrypts ticket content with `tk` (XSalsa20-Poly1305)
6. Plaintext exists only in the Worker's memory for the duration of the session. No server round-trip per ticket.

**Seizure resistance:** OPRF key is split across two servers in separate jurisdictions (EU + non-EU). Shares are refreshed every 24 hours. A seized share from one epoch is useless in the next.

**Post-quantum hybrid:** Classical OPRF at launch. HKDF interface designed for ML-KEM-768 hybrid layer (v1.1). The system is secure if either classical OPRF or ML-KEM holds. See [Roadmap](#roadmap) for status.

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

- **Web intake forms and case notes:** true end-to-end encryption. Plaintext never reaches the server. ([handbook: ticket decryption](https://handbook.care-y.org/#tickets/decryption))
- **Outbound SMS/calls:** volunteer's browser decrypts, sends to one-shot relay endpoint, server forwards to telephony provider and zeros the buffer immediately. The server does not store or log the content. ([handbook: reply](https://handbook.care-y.org/#ticket-detail/reply))
- **Inbound SMS:** encrypted on receipt, plaintext purged. Telephony provider retains independently (~30 days).
- **Telephony abstraction:** [Twilio](https://www.twilio.com/docs/iam/api-keys/keys-in-console) initially, [SignalWire](https://signalwire.com/docs) hybrid (self-hosted voice) planned. Switching providers requires configuration changes only. ([handbook: telephony provider](https://handbook.care-y.org/#admin-comms/provider))
- **Fund accounting (planned):** ledger amounts encrypted in the browser before reaching the server. Balances computed in the browser from decrypted records and donation platform totals fetched on demand through the relay, never stored. The money to case connection is readable only with per-ticket case access.

---

## Tech Stack

| Layer           | Technology                                                                   |
| --------------- | ---------------------------------------------------------------------------- |
| Language        | TypeScript (ESM,`strict: true`)                                              |
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

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

Key security principles:

- **Server cannot decrypt client data.** Decryption requires the volunteer's password plus OPRF evaluation from both threshold servers. ([handbook: key derivation](https://handbook.care-y.org/#login/key-derivation))
- **E2E for all client-authored content.** Encrypted in the browser before transmission. ([handbook: ticket decryption](https://handbook.care-y.org/#tickets/decryption))
- **Telephony relay zeroes memory.** `Buffer.fill(0)` in `finally` blocks. Plaintext is never held as a JS string and relay requests are not logged.
- **Webhook signatures always validated**, even in development.
- **2FA mandatory for data access.** All volunteers, all environments. Authentication succeeds without 2FA, but accessing any encrypted data requires a verified second factor. ([handbook: two-factor auth](https://handbook.care-y.org/#login/two-factor))
- **EU hosting.** Hetzner VPS, LUKS full-disk encryption, outside US legal jurisdiction.

---

## Roadmap

CARE-Y is pre-alpha. This list reflects current plans, and ordering can shift.

<table>
  <thead>
    <tr>
  <th colspan="3">
    <img src="https://img.shields.io/badge/Built-2DA44E?style=flat" alt="Built">
  </th>
  <th>
    <img src="https://img.shields.io/badge/Now-0969DA?style=flat" alt="Now">
  </th>
  <th>
    <img src="https://img.shields.io/badge/Next-BF8700?style=flat" alt="Next">
  </th>
  <th>
    <img src="https://img.shields.io/badge/Later-6E7781?style=flat" alt="Later">
  </th>
</tr>
  </thead>
  <tbody>
    <tr>
      <td valign="top">
        <img src="https://img.shields.io/badge/-Encrypted case management-2DA44E?style=flat" alt="Encrypted case management"> - Tickets, case notes, and outgoing messages encrypted in the volunteer's browser; incoming texts encrypted the moment they arrive.
        <br><br>
        <img src="https://img.shields.io/badge/-Unified Case Thread-2DA44E?style=flat" alt="Unified Case Thread"> - Single volunteer timeline across SMS, email, portal, calls, and notes.
        <br><br>
        <img src="https://img.shields.io/badge/-Client communication-2DA44E?style=flat" alt="Client communication"> - Emails, SMS texts, phone calling, encrypted client-portal messages, and secure one-time message links.
        <br><br>
        <img src="https://img.shields.io/badge/-Encrypted telephony-2DA44E?style=flat" alt="Encrypted telephony"> - Calls and texts through the org's phone number, inbound texts encrypted on arrival, outbound through a stateless relay that zeros memory, provider-abstracted (Twilio).
        <br><br>
        <img src="https://img.shields.io/badge/-Encrypted voicemail-2DA44E?style=flat" alt="Encrypted voicemail"> - Recordings encrypted and queued for volunteer review.
        <br><br>
        <img src="https://img.shields.io/badge/-Automated ticket creation-2DA44E?style=flat" alt="Automated ticket creation"> - Cases open from inbound calls, texts, emails, and intake form submissions, each channel org-configurable.
      </td>
      <td valign="top">
        <img src="https://img.shields.io/badge/-Encrypted intake forms-2DA44E?style=flat" alt="Encrypted intake forms"> - Client-facing forms with custom fields and conditional pages, submissions encrypted before storage.
        <br><br>
        <img src="https://img.shields.io/badge/-Encrypted knowledge base-2DA44E?style=flat" alt="Encrypted knowledge base"> - Rich text articles, categories, voting, and search, all encrypted with the org key.
        <br><br>
        <img src="https://img.shields.io/badge/-Queue routing-2DA44E?style=flat" alt="Queue routing"> - Tickets routed into org-defined queues with priority levels and assignment workflows.
        <br><br>
        <img src="https://img.shields.io/badge/-Encrypted search-2DA44E?style=flat" alt="Encrypted search"> - Unified search across tickets, articles, and volunteers, run client-side over decrypted data.
        <br><br>
        <img src="https://img.shields.io/badge/-Org customization-2DA44E?style=flat" alt="Org customization"> - Branding with automatic contrast enforcement, and custom terminology throughout.
        <br><br>
        <img src="https://img.shields.io/badge/-Multi method 2FA-2DA44E?style=flat" alt="Multi-method 2FA"> - Passkeys, TOTP, and backup codes, mandatory for accessing any encrypted data.
      </td>
      <td valign="top">
        <img src="https://img.shields.io/badge/-Roles and permissions-2DA44E?style=flat" alt="Roles and permissions"> - Volunteer, Manager, and Admin roles with granular permissions and per-user key status.
        <br><br>
        <img src="https://img.shields.io/badge/-Admin-2DA44E?style=flat" alt="Admin"> - Organization settings, people management, and communications configuration.
        <br><br>
        <img src="https://img.shields.io/badge/-WCAG AA accessibility-2DA44E?style=flat" alt="WCAG AA accessibility"> - Automatic contrast enforcement, focus management, motion and contrast preferences, and screen reader support.
        <br><br>
        <img src="https://img.shields.io/badge/-PWA-2DA44E?style=flat" alt="PWA"> - Installable with dark mode and offline asset caching, never caches encrypted content.
        <br><br>
        <img src="https://img.shields.io/badge/-i18n-2DA44E?style=flat" alt="i18n"> - English and Spanish via compile-time translations, adding a language requires only a JSON file.
      </td>
      <td valign="top">
        <img src="https://img.shields.io/badge/-Production infrastructure-0969DA?style=flat" alt="Production infrastructure"> - Hardened servers, automated backups, encrypted data lifecycle, and deployment pipeline for the alpha launch.
        <br><br>
        <img src="https://img.shields.io/badge/-Self hosting toolkit-0969DA?style=flat" alt="Self-hosting toolkit"> - Deployment tooling for orgs running their own single-tenant instance from the same codebase.
        <br><br>
        <img src="https://img.shields.io/badge/-Interactive handbook-0969DA?style=flat" alt="Interactive handbook"> - Runs the real application (frontend, server, and PostgreSQL via WebAssembly) entirely in the browser at <a href="https://handbook.care-y.org">handbook.care-y.org</a>. Volunteers use it for onboarding, and orgs considering the platform can operate it themselves before committing.
      </td>
      <td valign="top">
        <img src="https://img.shields.io/badge/-Fund accounting-BF8700?style=flat" alt="Fund accounting"> - Encrypted fund tracking with balances on the dashboard and on each case. Donation platforms (Givebutter first) connect as live inflow sources. Donor data never enters CARE-Y.
        <br><br>
        <img src="https://img.shields.io/badge/-Direct aid delivery-BF8700?style=flat" alt="Direct aid delivery"> - Sending aid to clients from within a case through swappable providers with approval workflows. Recipient details encrypted like other case data.
        <br><br>
        <img src="https://img.shields.io/badge/-Reproducible builds-BF8700?style=flat" alt="Reproducible builds"> - Verifiable client builds so deployments can be audited against published source.
        <br><br>
        <img src="https://img.shields.io/badge/-Tor hidden service-BF8700?style=flat" alt="Tor hidden service"> - Onion address access so volunteers and clients can connect without revealing that they use the service.
      </td>
      <td valign="top">
        <img src="https://img.shields.io/badge/-Ticket board view-6E7781?style=flat" alt="Ticket board view"> - A board style view for working tickets by status.
        <br><br>
        <img src="https://img.shields.io/badge/-Pinning-6E7781?style=flat" alt="Pinning"> - Pin tickets and knowledge base articles for quick access, with per-volunteer ordering.
        <br><br>
        <img src="https://img.shields.io/badge/-Shift scheduling-6E7781?style=flat" alt="Shift scheduling"> - Volunteer shift calendar with coverage tracking and rotation management.
        <br><br>
        <img src="https://img.shields.io/badge/-Analytics and reports-6E7781?style=flat" alt="Analytics and reports"> - Aggregate reporting across cases, queues, and funds with encrypted data export and integrity verification.
        <br><br>
        <img src="https://img.shields.io/badge/-Guided walkthrough-6E7781?style=flat" alt="Guided walkthrough"> - Interactive onboarding tour and appearance preferences for new volunteers.
        <br><br>
        <img src="https://img.shields.io/badge/-Exposure system-6E7781?style=flat" alt="Exposure system"> - Security education through the volunteer's own session. Partially built, expanding to cover all protection layers.
        <br><br>
        <img src="https://img.shields.io/badge/-Self hosted voice-6E7781?style=flat" alt="Self-hosted voice"> - SignalWire integration to keep call audio off third-party servers.
        <br><br>
        <img src="https://img.shields.io/badge/-Video calling-6E7781?style=flat" alt="Video calling"> - Scheduled calls with end-to-end encrypted audio and video, self-hosted.
        <br><br>
        <img src="https://img.shields.io/badge/-Post quantum key layer-6E7781?style=flat" alt="Post-quantum key layer"> - ML-KEM-768 hybrid alongside the classical OPRF, so the system is secure if either holds.
        <br><br>
        <img src="https://img.shields.io/badge/-Local first encrypted sync-6E7781?style=flat" alt="Local-first encrypted sync"> - Client works offline with encrypted local storage and syncs when connectivity returns. Org opt-in.
      </td>
    </tr>
  </tbody>
</table>

## License

AGPL-3.0-only. See [LICENSE](LICENSE) for details.
