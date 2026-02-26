# @care-y/shared

Shared types, Zod schemas, and enums consumed by all other CARE-Y packages.

This package has no runtime dependencies beyond Zod. It is the single source of truth for data shapes across the client-server boundary.

See the [root README](../../README.md) for full architecture, stack details, and setup instructions.

---

## Tech Stack

| Layer      | Technology | Role                                                         |
| ---------- | ---------- | ------------------------------------------------------------ |
| Validation | Zod        | Runtime schema validation + TypeScript type inference        |
| Language   | TypeScript (strict) | Shared type definitions, enums, branded types       |

---

## Development

This package is consumed via the pnpm workspace. No separate dev server needed.

```sh
# Type check
pnpm tsc --noEmit

# Tests (from root)
pnpm vitest run packages/shared
```

## Key Responsibilities

- **Zod schemas:** input validation schemas shared between tRPC server procedures and client forms
- **TypeScript types:** shared interfaces and types (ticket, volunteer, session, etc.)
- **Enums:** shared constants (ticket status, role, telephony event type, etc.)
- **Branded types:** type-safe IDs (e.g. `TicketId`, `VolunteerId`) to prevent ID mix-ups

## Notes

- No PII types in plaintext form. Encrypted fields are typed as `Uint8Array` or base64 strings.
- Changes here affect all packages. Update client, server, and crypto consumers when modifying schemas.
