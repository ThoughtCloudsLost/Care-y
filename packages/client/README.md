# @care-y/client

SvelteKit web app for CARE-Y. Volunteer interface, admin interface, and client portal.

All encryption and decryption happens in this package. Plaintext never leaves the browser.

See the [root README](../../README.md) for full architecture, stack details, and setup instructions.

---

## Tech Stack

| Layer          | Technology                              | Role                                                        |
| -------------- | --------------------------------------- | ----------------------------------------------------------- |
| Framework      | SvelteKit + Svelte 5 (runes)            | Routing, SSR, build                                         |
| API client     | Vanilla `@trpc/client` + TanStack Query | Type-safe API calls, stale-while-revalidate caching         |
| UI shell       | Konsta UI v5                            | Mobile-first components (Tabbar, Sheet Modal, Cards, Navbar) |
| Accessible UI  | Bits UI                                 | Form primitives only (Dialog, Select, Combobox, Date Picker) |
| Gestures       | svelte-gestures                         | Swipe, long-press, pan via Svelte actions                   |
| CSS            | Tailwind CSS v4                         | Required by Konsta UI (build-time only)                     |
| Crypto         | `@care-y/crypto` + `libsodium-wrappers` | All encryption/decryption in the browser                    |
| Real-time      | SSE (built-in SvelteKit)                | Server-pushed updates (metadata only, never encrypted content) |
| PWA            | `@vite-pwa/sveltekit`                   | Service worker, manifest, offline caching via Workbox       |
| E2E testing    | Playwright + `@axe-core/playwright`     | Browser testing + WCAG 2.1 AA accessibility checks          |

---

## Development

Run from the **monorepo root**:

```sh
pnpm dev
```

Or run only this package:

```sh
pnpm --filter @care-y/client dev
```

## Testing

```sh
# Unit tests (from root)
pnpm vitest run packages/client

# E2E tests
pnpm --filter @care-y/client test:e2e

# Accessibility audit (axe-core via Playwright)
pnpm --filter @care-y/client test:a11y
```

## Key Responsibilities

- **Key management:** derives account key from password (Argon2id), decrypts personal private key, decrypts org private key. All keys held in memory for session only.
- **Encryption:** encrypts all PII before sending to server via `@care-y/crypto`
- **Telephony relay:** decrypts content locally, posts plaintext to one-shot relay endpoint for outbound SMS/calls
- **PWA:** service worker via `@vite-pwa/sveltekit`, offline caching via Workbox

## Security Notes

- Never use `{@html}` with user-supplied content. Svelte auto-escapes by default.
- Never pass decrypted content as URL parameters or query strings
- Keys must not be persisted to IndexedDB, localStorage, or sessionStorage
