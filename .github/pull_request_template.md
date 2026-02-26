## Summary

<!-- What does this PR do? Why? Link to related issue(s) if applicable. -->

## Changes

<!-- Bullet list of what changed. Group by package if multi-package. -->

-

## Security Checklist

<!-- Check all that apply. Leave unchecked items - reviewers will verify. -->

- [ ] No PII in log statements (phone numbers, names, message content, client aliases)
- [ ] No plaintext stored in database - encrypted before write if sensitive
- [ ] No secrets hardcoded in source (API keys, tokens, passwords)
- [ ] Relay endpoints zero Buffers in `finally` blocks - no strings for plaintext
- [ ] Error responses do not leak internal details (stack traces, query shapes, PII)
- [ ] Webhook signature validation not bypassed
- [ ] No `any` types introduced - `unknown` + type guards used instead
- [ ] No `@ts-ignore` or `@ts-expect-error` added
- [ ] No `{@html}` with user-provided content
- [ ] Dependencies added are necessary and reviewed (check Socket.dev report)

## Testing

- [ ] New/modified code has corresponding tests
- [ ] `pnpm vitest run` passes locally
- [ ] Coverage thresholds still met

## Notes for Reviewers

<!-- Anything specific reviewers should focus on? Areas of uncertainty? -->
