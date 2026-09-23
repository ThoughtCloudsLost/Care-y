 

# CARE-Y

**Care Anonymized, Redacted, Encrypted - ████**

[![CI](https://github.com/ThoughtCloudsLost/Care-y/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ThoughtCloudsLost/Care-y/actions/workflows/ci.yml)
[![Security Scan](https://github.com/ThoughtCloudsLost/Care-y/actions/workflows/security-scan.yml/badge.svg?branch=main)](https://github.com/ThoughtCloudsLost/Care-y/actions/workflows/security-scan.yml)
[![License: AGPL-3.0](https://img.shields.io/github/license/ThoughtCloudsLost/Care-y)](LICENSE)

> **Pre-alpha.** Under active development. Not yet released.

[Features](#features) · [Case Thread](#unified-case-thread) · [Communications](#communications) · [Client Portal](#client-portal) · [KB Library](#knowledge-base-library) · [Queues](#queue-based-routing) · [Notifications](#notifications) · [Accessibility](#accessibility-and-language) · [Exposure](#exposure-system) · [Fund Accounting](#fund-accounting) · [Encryption](#how-your-data-is-protected) · [Architecture](#architecture) · [Security](#security) · [Tech Stack](#tech-stack) · [Dev Setup](#development-setup) · [Contributing](#contributing) · [Roadmap](#roadmap)

A call intake and case management system for mutual aid organizations serving at-risk populations. Both clients and members face real danger if their identities or case details are exposed. CARE-Y is built so that even a seized server reveals nothing about who sought help or who provided it.

**[Try the interactive handbook](https://handbook.care-y.org)** to read the documentation and try the real application in your browser.

---

## What is CARE-Y?

Team members at mutual aid organizations and nonprofits use CARE-Y to manage cases for at-risk clients. They receive calls, texts and emails, track client needs, coordinate responses, look up resources in the knowledge base, and route tickets through queues. The interface is a mobile first PWA that works on a phone or a desktop browser.

CARE-Y runs as a multi tenant hosted service or a self hosted single tenant instance from the same codebase, and self hosted deployments use BYOT (bring your own telephony) configuration. ([handbook: telephony provider setup](https://handbook.care-y.org/#admin-comms/provider))

All client data is encrypted in the team member's browser before it reaches the server. The server stores only ciphertext it cannot read.

<div align="center">
  <img src="docs/images/ios-pwa/care-y-home-dashboard.png" alt="CARE-Y dashboard showing shift status, queue counts, and priority tickets" width="200">
  <img src="docs/images/ios-pwa/care-y-dark-mode.png" alt="CARE-Y dashboard in dark mode with table view and queue overview" width="200">
</div>

---

## Why CARE-Y Exists

If a server can read the data it stores, so can anyone who compromises or subpoenas that server. For organizations where a breach means real people could get hurt, that is not an acceptable tradeoff.

CARE-Y makes that scenario architecturally impossible. The server stores only ciphertext and encrypted key material. Decryption requires the member's password plus cryptographic evaluation from two independent servers in separate legal jurisdictions. A breach of any one component produces nothing readable. A subpoena to one hosting provider gets encrypted blobs and a single unusable key share.

**Threat model:**

- Database breach (full dump of all tables)
- Subpoena to hosting provider
- Subpoena to telephony provider (Twilio/SignalWire)
- Compromised org team member device
- Rogue admin with server access
- State-level adversary with legal compulsion powers
- Network surveillance (identifying who connects to the service)

---

## Features

- [**Encrypted case management.**](#how-your-data-is-protected) Tickets, messages, case notes, and client data are encrypted with per-ticket keys in the browser before reaching the server. ([handbook: ticket decryption](https://handbook.care-y.org/#tickets/decryption), [ticket detail](https://handbook.care-y.org/#ticket-detail))
- [**Unified case thread.**](#unified-case-thread) SMS, email, portal messages, phone calls, voicemails, and internal notes appear in a single chronological timeline per case. Content entries are encrypted and decrypted client-side for display. ([handbook: conversation](https://handbook.care-y.org/#ticket-detail/conversation))
- [**Communications.**](#communications) All outbound channels pass through a stateless relay that zeros memory after forwarding to the telephony or email provider. The browser encrypts and stores a copy on the case thread. ([handbook: telephony provider](https://handbook.care-y.org/#admin-comms/provider))
- [**Client portal.**](#client-portal) Direct communication channels that work without telephony or email server setup and bypass any third party seeing client messages. Clients choose their protection level through a three tier communication model based on device capabilities and risk tolerance. ([handbook: client portal](https://handbook.care-y.org/#client-portal))
- [**Knowledge base.**](#knowledge-base-library) Internal library for resource directories, procedure guides, referral lists, and onboarding materials. Content encrypted with the org key before reaching the server. ([handbook: library](https://handbook.care-y.org/#library))
- [**Queue based routing.**](#queue-based-routing) Tickets go into org defined queues with priority levels and assignment workflows. ([handbook: queue management](https://handbook.care-y.org/#admin-people/queues))
- **Unified search** across tickets, knowledge base articles, and members from a single interface. Content is decrypted and searched client-side; the server cannot search encrypted data. ([handbook: search](https://handbook.care-y.org/#search))
- [**Notifications.**](#notifications) Four channels, none carrying case content. All case data is encrypted, so the server cannot include details even if it tried. Members configure which channels are active in their preferences. ([handbook: notification preferences](https://handbook.care-y.org/#settings/notifications))
- **Role-based access.** Volunteer, Manager, and Admin roles with granular permissions. Encryption key status visible per user. ([handbook: roles](https://handbook.care-y.org/#admin-people/roles))
- Installable **PWA** with dark mode and offline asset caching. The service worker never caches encrypted content.
- [**Fund accounting.**](#fund-accounting) Encrypted fund tracking tied to cases and queues. Donation platform integration with no donor data entering CARE-Y. ([planned](#roadmap))
- [**Exposure system.**](#exposure-system) Security education through the member's own session, showing what is protected, what depends on their choices, and what the system cannot protect. ([partially built](#roadmap))
- [**i18n.**](#accessibility-and-language) English and Spanish via Paraglide JS (compile-time, tree shaken). Adding a language requires only a JSON file. ([handbook: language selection](https://handbook.care-y.org/#settings/language))
- **[Interactive handbook.](https://handbook.care-y.org)** Runs the real frontend, server, and PostgreSQL database (via WebAssembly) entirely in the browser. Every interaction fires actual API calls against that database, and ticket decryption happens client-side with real keys. Organizations considering CARE-Y can operate the product themselves before trusting it, and organizations can use the handbook for onboarding new members.

---

## Unified Case Thread

All channels feed into one encrypted timeline per case, decrypted client-side for display. Members switch between two views of the same data. ([handbook: conversation](https://handbook.care-y.org/#ticket-detail/conversation))

- **Message view** shows the thread as a familiar message bubble interface.
- **Timeline view** shows a compact list with date headers and expandable message clusters, for scanning long cases without scrolling through every entry.

Entry types in the thread:

- [**Messages**](#communications) from members and clients across all channels (portal, SMS, email), each stored as its own entry.
- [**Phone calls**](#communications) with duration and status.
- [**Voicemails**](#communications) with encrypted audio playback.
- **Internal notes** visible only to members, never shown to clients. @mentions notify the mentioned member. Orgs define custom note types with configurable icons (e.g., "follow up needed," "supervisor review"). Some types can be marked as required when closing a ticket. Notes can be edited after posting and can trigger escalation notifications to specific roles, permissions, queues, or anyone with ticket access.
- [**Secure links**](#client-portal) sent to clients, recorded on the thread.
- **Contact corrections** from clients requesting a phone or email update.
- **System events** for assignment changes, status changes, priority changes, queue transfers, holds, and ticket merges.

All content entries (messages, notes, voicemails, emails, secure links, contact corrections) are encrypted with per-ticket keys and decrypted client-side. System events and call metadata are plaintext since they contain no client content.

<div align="center">
  <img src="docs/images/ios-pwa/care-y-ticket-list-filtered.png" alt="Ticket list with filter pills, priority badges, and message previews" width="200">
  <img src="docs/images/ios-pwa/care-y-ticket-detail.png" alt="Ticket chat view with client messages, volunteer replies, and private notes" width="200">
</div>
<div align="center">
  <img src="docs/images/ios-pwa/care-y-desktop-tickets.png" alt="Desktop split view with ticket list and ticket detail side by side" width="100%">
</div>

---

## Communications

Each channel below passes through a stateless relay or encrypted receiver. The browser encrypts and stores a copy on the case thread.

- **Outbound SMS:** relay forwards to the telephony provider and zeros the buffer.
- **Inbound SMS:** encrypted on arrival via webhook, plaintext purged. CARE-Y requests deletion of the message log from the telephony provider immediately after processing, with a retry queue if the request fails. The provider may still retain data as required by their own legal obligations ([retention policy](https://support.twilio.com/hc/en-us/articles/4410585868443-Data-Retention-and-Deletion-in-Twilio-Products), [SMS storage](https://help.twilio.com/articles/223181008-Twilio-SMS-message-and-traffic-storage), [DPA](https://www.twilio.com/en-us/legal/data-protection-addendum)).
- **Outbound email:** relay constructs org branded HTML with i18n support, sends via SMTP, and zeros the buffer.
- **Inbound email:** a separate SMTP receiver process (runs beside the API, never inside it) accepts replies, encrypts the body on arrival, and stores only ciphertext. Reply-to addresses carry hashed tokens so replies route to the correct ticket without exposing ticket metadata.
- **Outbound calls:** relay initiates the call through the telephony provider. Client phone numbers are decrypted server-side for the duration of the call and zeroed afterward.
- **Inbound calls:** routed to a member through the telephony provider. Voicemails are recorded, encrypted, and queued for review.
- **Portal messages:** encrypted in the client's browser before submission. The server stores only ciphertext.

Telephony is provider abstracted. [Twilio](https://www.twilio.com/docs/iam/api-keys/keys-in-console) initially, [SignalWire](https://signalwire.com/docs) hybrid (self-hosted voice) planned. Switching providers requires configuration changes only. ([handbook: telephony provider](https://handbook.care-y.org/#admin-comms/provider))

---

## Client Portal

Clients have the option to communicate directly through the browser without telephony or email server setup, bypassing any third party seeing their messages. The tiers differ in channel protection, not in service quality, and clients are told what each tier's protection level means.

- **SMS/Email (default).** Works on any phone. Org side storage is encrypted, but the SMS/email channel itself is plaintext.
- **One-time message links.** A member sends a single encrypted message to a client. The link expires after 72 hours or one read, whichever comes first. Used for secure communication over insecure channels like SMS or email.
- **Secure link channels.** A reusable link for ongoing encrypted messaging for the duration of the case. The client reads and sends messages in the browser with no account or password required. Optional link passphrase for high risk clients. Cryptographic key material lives in the URL fragment (never sent to the server, per RFC 3986).
- **Encrypted accounts.** The client creates a username and password. The password derives a keypair using the same OPRF based key derivation as the member portal, providing end-to-end encrypted messaging. Auth uses timing safe comparisons and enumeration defense. Account tier clients can install the portal as a PWA for repeat access. A Twilio or email subpoena gets only a login URL.
- **Intake forms.** Custom fields, conditional pages, encrypted submissions, and case routing to specific queues. Field labels and config are encrypted ciphertext the server never decrypts.
- **Portal messaging.** Both secure link and account tiers. Clients see messages, voicemails, and call entries in the same familiar message bubble interface as members. Supports file attachments, SMS notification on new messages ("You have a new message waiting for you."), and 30-day lazy expiry for inactive link channels.

---

## Knowledge Base Library

An internal library where members publish and organize information they need during cases. ([handbook: library](https://handbook.care-y.org/#library))

**What goes here.** Resource directories, procedure guides, referral lists, policy references, and onboarding materials. Anything a member might need to reference while working a case.

**How it works.** Articles support rich text editing, categories, voting, and search. Members create and manage content directly in the browser.

**Encryption.** All content is encrypted with the org key before reaching the server. The server stores and returns encrypted blobs without ever reading them.

<div align="center">
  <img src="docs/images/ios-pwa/care-y-knowledge-base-library.png" alt="Knowledge base with categorized articles and search" width="200">
</div>

---

## Queue Based Routing

Tickets go into org defined queues with priority levels and assignment workflows. Intake forms can route submissions to specific queues automatically, and queue names are encrypted at rest. ([handbook: queue management](https://handbook.care-y.org/#admin-people/queues))

- **Round-robin assignment** assigns incoming tickets to the on-shift member with the fewest open tickets in that queue.
- **Self-assignment** lets members take unassigned tickets from any queue they belong to.
- **Release** lets members return a ticket to the unassigned pool if they cannot continue with it.
- **Escalation rules** fire notifications when tickets meet configurable conditions, such as time spent in queue or priority level, so nothing sits unhandled without someone being told about it.

<div align="center">
  <img src="docs/images/ios-pwa/care-y-desktop-dashboard.png" alt="Desktop dashboard with two-column layout, sidebar navigation, and table views" width="100%">
</div>

---

## Notifications

All case data is encrypted, so notifications carry event types only, never case content. Members choose which of the four channels are active in their preferences. ([handbook: notification preferences](https://handbook.care-y.org/#settings/notifications))

- **Email** sends a login link with a message like "A ticket has been assigned to you. Log in to view it," "A new ticket has arrived," "A ticket has been escalated," "A ticket you are following has a new update," "You were mentioned in a ticket note," or "A voicemail could not be routed automatically and was quarantined."
- **SMS** sends "You have a new notification. Visit [login link]."
- **Web Push** sends an empty body (the browser shows a generic badge). DIY using VAPID keys and the Web Push protocol directly, no third party push service.
- **SSE** carries only IDs. The client resolves human readable names from its local decrypt cache.

---

## Fund Accounting

Encrypted fund tracking tied to cases and queues. Financial data is encrypted in the browser before it reaches the server, so a seized database reveals no dollar amounts, no fund balances, and no record of which person received money.

- **Fund balances** appear on the dashboard and on each case. Queues can be linked to funding buckets for specific client needs (grant-restricted funds, donations earmarked for a cause). When a case enters the queue, those funds are automatically associated.
- **Disbursements** are recorded directly from a case by members.
- **Fundraising platforms.** Orgs can connect donation platforms like [Givebutter](https://help.givebutter.com/en/articles/5489015-how-to-access-the-givebutter-public-api-key) so incoming totals update automatically. Donor names and contact details never enter CARE-Y. Everything also works with no platform connected, with members recording transactions by hand.
- **Direct aid delivery (future).** Sending aid to clients from within a case through providers like [Tremendous](https://developers.tremendous.com/docs/introduction) with configurable approval workflows. Recipient details encrypted like other case data.

Fund accounting is not yet implemented. See [Roadmap](#roadmap) for status.

---

## Accessibility and Language

CARE-Y serves populations with varied technical backgrounds and language needs.

- **WCAG AA contrast enforcement.** Each org sets its own brand colors. A contrast engine adjusts them at runtime to meet 4.5:1 ratios in both light and dark mode. ([handbook: branding](https://handbook.care-y.org/#admin-org/branding))
- **Focus management.** Modal sheets and dialogs use focus traps with Tab/Shift+Tab wrapping and focus restoration on dismiss. Keyboard activation (Enter/Space) on all interactive elements.
- **Reduced motion.** Animations respect `prefers-reduced-motion`. Users who need reduced motion get static alternatives.
- **Increased contrast.** `prefers-contrast: more` is respected across all interactive elements.
- **Screen reader support.** All interactive elements carry ARIA labels. Dynamic content changes are announced, and visual-only cues have text equivalents.
- **Multilingual.** English and Spanish translations via Paraglide JS (compile-time, tree shaken). Adding a new language requires only adding JSON file. ([handbook: language selection](https://handbook.care-y.org/#settings/language))

---

## Exposure System

Many of CARE-Y's users are not technical. The Exposure system teaches security through the member's own session instead of a training module.

**What the system protects.** CARE-Y encrypts all client data in the browser. The server stores ciphertext it cannot read. The Exposure system explains this in plain language so members understand what is protected and why it matters.

**How much of that protection the member is using.** Some protections are architectural and always active (encryption). Others depend on choices the member or their admin makes. A hardware security key prevents phishing. A Tor connection hides who is using the service. Self-hosted voice keeps call audio off third-party servers. The Exposure system shows which protections are active and what can be done to turn on the rest.

**What the system cannot protect.** A compromised device or a malicious browser extension can read decrypted content, and CARE-Y cannot prevent that. The onboarding walkthrough and login summary name these risks directly and tell members what to do about them. Contextual notifications reinforce this at the moment it matters. Opening an SMS-originated ticket, for example, reminds the member that the original text passed through the phone provider before it was encrypted. ([handbook: exposure hints](https://handbook.care-y.org/#ticket-detail/exposure-hints))

The Exposure system is partially built and expanding. See [Roadmap](#roadmap) for status.

---

## How Your Data Is Protected

CARE-Y encrypts data in the member's browser. The server stores only ciphertext it cannot read. ([handbook: key derivation](https://handbook.care-y.org/#login/key-derivation))

<div align="center">
  <img src="docs/images/crypto-v2/simplified-transparent-crypto-v2-mermaid.png" alt="CARE-Y simplified crypto hierarchy: volunteer password derives split keys across two OPRF servers, producing encryption keys for client data, org resources, and public branding" width="800">
</div>

**Protection by data type:**

| What's protected                                | Who can read it                                                                                                                  | What an attacker gets if they seize the server                                                                                                                                                                                                                                                           |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Client data** (tickets, messages, case notes) | Only the specific members assigned to that ticket                                                                                | Nothing. Decryption requires the member's password AND both servers in two countries cooperating. No single seizure is enough.                                                                                                                                                                           |
| **Org resources** (KB articles, settings)       | Any logged-in member in that org                                                                                                 | Nothing. Still requires a member's password to unlock.                                                                                                                                                                                                                                                   |
| **Public branding** (logo, name, color)         | Anyone who visits the intake page                                                                                                | Visual identity only. This is intentionally public so clients recognize the org.                                                                                                                                                                                                                         |
| **Phone credentials** (Twilio config)           | The server itself (automated)                                                                                                    | Phone system API access only. No client data, no member keys.                                                                                                                                                                                                                                            |
| **Fund data** (planned)                         | Fund balances are readable by any logged-in member. Which case received money is readable only by members assigned to that case. | Entry counts and timestamps per fund (metadata only). No readable amounts, no fund balances, no money-to-person link. Balances are computed in the member's browser, never on the server. A full server compromise also yields donation platform API access (same situation as phone credentials above). |

**Key guarantees:**

- **The server cannot read client data.** All decryption happens in the member's browser.
- **No single country can force decryption.** The two OPRF servers are in different countries (Germany and Iceland). A court order in one country only gets half the puzzle.
- **The split changes daily.** Even if someone captures one server's share, it expires within 24 hours.
- **Phone calls and texts are not stored.** Outbound messages pass through the server and are erased from memory immediately.
- **Inbound texts are encrypted on arrival.** CARE-Y requests deletion of the message log from the telephony provider after processing. The provider may still retain data as required by their own legal obligations ([retention policy](https://support.twilio.com/hc/en-us/articles/4410585868443-Data-Retention-and-Deletion-in-Twilio-Products), [SMS storage](https://help.twilio.com/articles/223181008-Twilio-SMS-message-and-traffic-storage), [DPA](https://www.twilio.com/en-us/legal/data-protection-addendum)). CARE-Y's copy is encrypted the moment it arrives.
- **Escrow for emergencies.** Four separate recovery keys on offline USB drives held by different custodians. ([handbook: key management](https://handbook.care-y.org/#admin-org/keys))

<details>
<summary><b>E2EE Technical Details</b></summary>

#### Key Hierarchy (Dual-Tier, OPRF-Based)

CARE-Y uses a dual-tier encryption model. PII (tickets, client data) is protected by OPRF based split-key derivation. The member's password is hardened via a threshold OPRF protocol across two servers in separate jurisdictions, producing a `masterKey` that derives per-member ECIES keys. No per-ticket server round-trip is needed for decryption. Non-PII shared resources (KB articles, org config) use a standard wrapped org key.

<div align="center">
  <img src="docs/images/crypto-v2/crypto-v2-mermaid-transparent.png" alt="CARE-Y full crypto key hierarchy: OPRF based split-key derivation, ECIES per-volunteer wrapping, dual-tier encryption for PII and org data, and operational secrets" width="800">
</div>

| Tier                   | Data                                                                   | Decryption requires                                                                                                                     | What's exposed if compromised                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **PII** (OPRF + ECIES) | Tickets, client data, messages                                         | OPRF-derived`masterKey` (via member password + both OPRF servers) + ECIES per-member wrapping of `tk`. No per-ticket server round-trip. | Nothing. No single server holds enough to decrypt PII.                                                                          |
| **Non-PII** (org key)  | KB articles, org config                                                | Member's`org_unwrap_key` (derived from `masterKey`) to unwrap org private key                                                           | Org configuration only. No PII.                                                                                                 |
| **Client branding**    | Public-facing branding                                                 | Org public key (intentionally public)                                                                                                   | Visual assets only (logo, name, color). Already public by design.                                                               |
| **Operational**        | Telephony creds, provider config, member identifiers, session metadata | `OPS_SECRETS_KEY` (server secrets file)                                                                                                 | Telephony API access and encrypted member/session metadata. No member key material. Full server compromise required to decrypt. |

**How PII decryption works (per ticket):**

1. At login, member derives `masterKey` via OPRF (password -> Argon2id -> OPRF evaluation from both servers -> HKDF)
2. Web Worker derives `volPrivate` from `masterKey` (one time, cached for session)
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
                                    Wraps tk via ECIES to member public keys
```

Each organization gets an isolated PostgreSQL schema (`org_<uuid>`). Cross-org queries are structurally impossible at the SQL layer via Kysely `.withSchema()` AST transformation. No session state, no `SET search_path`.

**Data flow:**

- **Web intake forms and case notes:** true end-to-end encryption. Plaintext never reaches the server. ([handbook: ticket decryption](https://handbook.care-y.org/#tickets/decryption))
- **Outbound SMS/calls:** member's browser decrypts, sends to one-shot relay endpoint, server forwards to telephony provider and zeros the buffer immediately. The server does not store or log the content. ([handbook: reply](https://handbook.care-y.org/#ticket-detail/reply))
- **Inbound SMS:** encrypted on receipt, plaintext purged. CARE-Y requests deletion of the message log from the telephony provider after processing. The provider may still retain data as required by their own legal obligations ([retention policy](https://support.twilio.com/hc/en-us/articles/4410585868443-Data-Retention-and-Deletion-in-Twilio-Products), [SMS storage](https://help.twilio.com/articles/223181008-Twilio-SMS-message-and-traffic-storage), [DPA](https://www.twilio.com/en-us/legal/data-protection-addendum)).
- **Outbound email:** member composes a reply, browser sends the content to the relay endpoint, server constructs the email (org branded HTML, reply-to with hashed token), sends via SMTP, and zeros the buffer. The browser then encrypts the message and stores it on the case thread. The server never retains the plaintext.
- **Inbound email:** a separate SMTP receiver process accepts replies. It hashes the reply-to token to find the ticket, encrypts the email body on arrival, and stores only ciphertext. The original plaintext exists only in the sender's own mail system.
- **Telephony abstraction:** [Twilio](https://www.twilio.com/docs/iam/api-keys/keys-in-console) initially, [SignalWire](https://signalwire.com/docs) hybrid (self-hosted voice) planned. Switching providers requires configuration changes only. ([handbook: telephony provider](https://handbook.care-y.org/#admin-comms/provider))
- **Fund accounting (planned):** ledger amounts encrypted in the browser before reaching the server. Balances computed in the browser from decrypted records and donation platform totals fetched on demand through the relay, never stored. The money to case connection is readable only with per-ticket case access.

---

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

Key security principles:

- **Server cannot decrypt client data.** Decryption requires the member's password plus OPRF evaluation from both threshold servers. ([handbook: key derivation](https://handbook.care-y.org/#login/key-derivation))
- **E2E for all client-authored content.** Encrypted in the browser before transmission. ([handbook: ticket decryption](https://handbook.care-y.org/#tickets/decryption))
- **Telephony relay zeroes memory.** `Buffer.fill(0)` in `finally` blocks. Plaintext is never held as a JS string and relay requests are not logged.
- **Webhook signatures always validated**, even in development.
- **2FA mandatory for data access.** All members, all environments. Authentication succeeds without 2FA, but accessing any encrypted data requires a verified second factor. ([handbook: two-factor auth](https://handbook.care-y.org/#login/two-factor))
- **EU hosting.** Hetzner VPS, LUKS full-disk encryption, outside US legal jurisdiction.

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
  client/      - SvelteKit web app (member + admin + client portal)
  server/      - Node.js + tRPC API, auth, webhooks, relay endpoints
  crypto/      - Shared isomorphic encryption library (browser + Node)
  shared/      - Shared types, Zod schemas, enums
  demo/        - Interactive handbook (standalone SvelteKit app with in-browser PostgreSQL)
```

---

## Prerequisites

| Tool         | Version | Install                                                                                                                                 |
| ------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Node.js**  | >=22    | [nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows)                                       |
| **pnpm**     | 10.x    | `corepack enable && corepack prepare pnpm@latest --activate`                                                                            |
| **Docker**   | Latest  | [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)                                                      |
| **Gitleaks** | Latest  | `scoop install gitleaks` (Windows) / `brew install gitleaks` (macOS) / [GitHub releases](https://github.com/gitleaks/gitleaks/releases) |

---

## Development Setup

```bash
# 1. Copy the env template and fill in database credentials and secrets.
#    The example file has comments explaining each variable and how to generate them.
cp .env.example .env

# 2. Install all dependencies. Lefthook (git hooks) installs automatically via postinstall.
pnpm install

# 3. Install browser binaries for E2E tests (Chromium, Firefox, WebKit).
pnpm exec playwright install

# 4. Build Docker containers, run migrations, and create the dev org.
#    Without --seed, no users or data are created and the onboarding wizard is the entry point.
#    With --seed, a full org is created (admin user, queues, clients, telephony, KB categories).
#    Credentials are printed to the console. First login redirects to onboarding, which
#    includes 2FA enrollment. Save the TOTP secret to .env and use `pnpm totp` for future logins.
pnpm dev:setup
# or
pnpm dev:setup --seed

# 5. Start the SvelteKit dev server. Containers start automatically via dev-setup.
pnpm dev
# or, expose on the local network for mobile testing (requires
# TAILSCALE_IP in packages/client/.env.local, see dev-network.js)
pnpm dev:mobile

# Optional: file sync for server code changes (rebuilds on save).
# Without this, the API runs from the last-built Docker image.
docker compose watch
```

### Testing

```bash
# Unit and integration tests (client, shared, crypto packages)
pnpm vitest run --project client --project shared --project crypto

# Server tests (requires Docker, runs inside the test container)
pnpm test:server:db

# E2E tests (requires Playwright browsers and a running dev environment)
pnpm test:e2e

# All tests
pnpm test

# Full coverage report (unit + server + E2E, merged)
pnpm coverage:full
```

---

## Contributing

See the [pull request template](.github/pull_request_template.md) for the security checklist and testing requirements. All PRs require passing unit tests, E2E tests, and coverage thresholds.

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

---

## Roadmap

CARE-Y is pre-alpha. This list reflects current plans, and ordering can shift.

<table>
  <thead>
    <tr>
  <th colspan="2">
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
        <details><summary><b>Cases</b></summary>Tickets, case notes, and outgoing messages all encrypted in the member's browser. Incoming texts encrypted the moment they arrive. (<a href="https://handbook.care-y.org/#tickets/decryption">handbook</a>)</details>
        <details><summary><b>Case thread</b></summary>Single member timeline across SMS, email, portal, calls, and notes. Every entry stored encrypted and decrypted client-side for display. (<a href="https://handbook.care-y.org/#ticket-detail/conversation">handbook</a>)</details>
        <details><summary><b>Client comms</b></summary>Emails, SMS texts, phone calling, encrypted client-portal messages, and secure one time message links. (<a href="#client-portal">client portal section</a>)</details>
        <details><summary><b>Calls</b></summary>Calls and texts through the org's phone number, inbound texts encrypted on arrival, outbound through a stateless relay that zeros memory, provider abstracted (Twilio). (<a href="https://handbook.care-y.org/#admin-comms/provider">handbook</a>)</details>
        <details><summary><b>Voicemail</b></summary>Recordings encrypted and queued for member review. (<a href="https://handbook.care-y.org/#ticket-detail/voicemails">handbook</a>)</details>
        <details><summary><b>Auto tickets</b></summary>Cases open from inbound calls, texts, emails, and intake form submissions, each channel org-configurable. (<a href="https://handbook.care-y.org/#admin-comms/channel-policy">handbook</a>)</details>
        <details><summary><b>Intake forms</b></summary>Client-facing forms with custom fields and conditional pages, submissions encrypted before storage. (<a href="https://handbook.care-y.org/#admin-forms/builder">handbook</a>)</details>
        <details><summary><b>KB</b></summary>Rich text articles, categories, voting, and search, all encrypted with the org key. (<a href="https://handbook.care-y.org/#library">handbook</a>)</details>
        <details><summary><b>Queues</b></summary>Tickets routed into org defined queues with priority levels and assignment workflows. (<a href="https://handbook.care-y.org/#admin-people/queues">handbook</a>)</details>
      </td>
      <td valign="top">
        <details><summary><b>Search</b></summary>Unified search across tickets, articles, and members. Decrypted and searched client-side. (<a href="https://handbook.care-y.org/#search">handbook</a>)</details>
        <details><summary><b>Branding</b></summary>Branding with automatic contrast enforcement, and custom terminology throughout. (<a href="https://handbook.care-y.org/#admin-org/branding">handbook</a>)</details>
        <details><summary><b>2FA</b></summary>Passkeys, TOTP, and backup codes, mandatory for accessing any encrypted data. (<a href="https://handbook.care-y.org/#settings/two-factor">handbook</a>)</details>
        <details><summary><b>Roles</b></summary>Volunteer, Manager, and Admin roles with granular permissions and per-user key status. (<a href="https://handbook.care-y.org/#admin-people/roles">handbook</a>)</details>
        <details><summary><b>Admin</b></summary>Organization settings, people management, and communications configuration. (<a href="https://handbook.care-y.org/#admin">handbook</a>)</details>
        <details><summary><b>WCAG AA</b></summary>Automatic contrast enforcement, focus management, motion and contrast preferences, and screen reader support. (<a href="https://handbook.care-y.org">handbook</a>)</details>
        <details><summary><b>PWA</b></summary>Installable with dark mode and offline asset caching, never caches encrypted content. (<a href="https://handbook.care-y.org">handbook</a>)</details>
        <details><summary><b>i18n</b></summary>English and Spanish via compile-time translations, adding a language requires only a JSON file. (<a href="https://handbook.care-y.org/#settings/language">handbook</a>)</details>
      </td>
      <td valign="top">
        <details><summary><b>Prod infra</b></summary>Hardened servers, automated backups, encrypted data lifecycle, and deployment pipeline for the alpha launch.</details>
        <details><summary><b>Self-hosting</b></summary>Deployment tooling for orgs running their own single-tenant instance from the same codebase.</details>
        <details><summary><b>Docs</b></summary>Runs the real application (frontend, server, and PostgreSQL via WebAssembly) entirely in the browser. Members use it for onboarding, and orgs considering the platform can operate it themselves before committing. (<a href="https://handbook.care-y.org">handbook</a>)</details>
      </td>
      <td valign="top">
        <details><summary><b>Funding</b></summary>Encrypted fund tracking with balances on the dashboard and on each case. Donation platforms (Givebutter first) connect as live inflow sources. Donor data never enters CARE-Y. (<a href="#fund-accounting">fund accounting section</a>)</details>
        <details><summary><b>Aid delivery</b></summary>Sending aid to clients from within a case through swappable providers with approval workflows. Recipient details encrypted like other case data.</details>
        <details><summary><b>Repro builds</b></summary>Verifiable client builds so deployments can be audited against published source.</details>
        <details><summary><b>Tor</b></summary>Onion address access so members and clients can connect without revealing that they use the service.</details>
      </td>
      <td valign="top">
        <details><summary><b>Board view</b></summary>A board style view for working tickets by status.</details>
        <details><summary><b>Pinning</b></summary>Pin tickets and knowledge base articles for quick access, with per-member ordering.</details>
        <details><summary><b>Shifts</b></summary>Member shift calendar with coverage tracking and rotation management.</details>
        <details><summary><b>Reports</b></summary>Aggregate reporting across cases, queues, and funds with encrypted data export and integrity verification.</details>
        <details><summary><b>Walkthrough</b></summary>Interactive onboarding tour and appearance preferences for new members.</details>
        <details><summary><b>Exposure</b></summary>Security education through the member's own session. Partially built, expanding to cover all protection layers.</details>
        <details><summary><b>Self-hosted voice</b></summary>SignalWire integration to keep call audio off third-party servers.</details>
        <details><summary><b>Video</b></summary>Scheduled calls with end-to-end encrypted audio and video, self-hosted.</details>
        <details><summary><b>Post-quantum</b></summary>ML-KEM-768 hybrid alongside the classical OPRF, so the system is secure if either holds.</details>
        <details><summary><b>Local-first</b></summary>Client works offline with encrypted local storage and syncs when connectivity returns. Org opt-in.</details>
      </td>
    </tr>
  </tbody>
</table>

## License

AGPL-3.0-only. See [LICENSE](LICENSE) for details.
