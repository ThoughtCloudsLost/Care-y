# Contributing to CARE-Y

CARE-Y protects at-risk individuals. Every contribution (code, docs, reviews) directly impacts their safety. Please read this guide carefully.

## Before You Start

1. Read `SECURITY.md` - understand the threat model
2. Install prerequisites listed in `README.md` (Node 22, pnpm 10, Gitleaks)

## Development Setup

```bash
# Clone and install
git clone <repo-url>
cd care-y
pnpm install

# Install git hooks (commitlint + Gitleaks)
pnpm lefthook install

# Start dev environment (server + PostgreSQL in Docker, with file sync)
docker compose watch

# In a separate terminal: SvelteKit client dev server
pnpm --filter @care-y/client dev
```

## Security Rules for Contributors

These are non-negotiable. PRs violating these will be rejected.

- **No PII in code, tests, logs, or comments** - no real phone numbers, names, or message content. Use obviously fake data (`+15555550100`, `Alice Testuser`).
- **No `any` types** - use `unknown` + type guards
- **No `@ts-ignore` or `@ts-expect-error`** - fix the type
- **No `{@html}` with user content** - Svelte auto-escapes by default, keep it that way
- **No secrets in source** - API keys, tokens, and passwords go in `.env` only
- **No plaintext storage** - if it's sensitive, encrypt it before it reaches the database
- **No logging of request/response bodies on relay endpoints** - even during development
- **Explicit return types on all exported functions**
- **Webhook signatures always validated** - even in tests, mock senders must compute valid signatures

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/). Enforced by commitlint.

```
type(scope): description

feat(crypto): add Argon2id key derivation
fix(server): zero relay buffer in finally block
test(crypto): add property-based encrypt/decrypt roundtrip
docs: update threat model for metadata protection
```

**Types:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`, `perf`, `style`, `build`, `revert`
**Scopes:** `crypto`, `server`, `client`, `shared`, `infra`, `deps`, `ci`, `docs`

## Pull Requests

- Fill out the PR template completely (especially the security checklist)
- Keep PRs focused (one concern per PR)
- All CI checks must pass (typecheck, lint, format, test, audit, Gitleaks)
- Changes to `packages/crypto/`, auth, or relay endpoints require extra scrutiny

## Code Style

- Prettier formats everything. Don't fight it, just run `pnpm format:fix`
- ESLint catches security and quality issues. All rules are `error`, not `warn`
- Small functions. Each does one thing and fits on one screen
- Names explain inten. `encryptTicketContent` not `processData`
- No dead code. Remove it, don't comment it out.

## Testing

- Write tests alongside code, not after
- Test file lives next to source: `encrypt.ts` → `encrypt.test.ts`
- `packages/crypto` requires 100% coverage: every code path
- Mock external services at the provider interface boundary
- Use factory functions for test data

## Questions?

Open an issue or reach out to the maintainers. When in doubt about a security decision, ask. It's always better to ask than to guess wrong.
