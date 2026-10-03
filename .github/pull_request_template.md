## Summary

<!-- What does this PR do? Why? Link to related issue(s) if applicable. -->

## Changes

<!-- Bullet list of what changed. Group by package if multi-package. -->

-

## Security Checklist

<!-- Check all that apply. Reviewers will verify unchecked items. -->

- [ ] No PII in log statements (phone numbers, names, message content, client aliases)
- [ ] No plaintext stored in database (encrypted before write if sensitive)
- [ ] No secrets hardcoded in source (API keys, tokens, passwords)
- [ ] Relay endpoints zero Buffers in `finally` blocks (no strings for plaintext)
- [ ] Error responses do not leak internal details (stack traces, query shapes, PII)
- [ ] Webhook signature validation not bypassed
- [ ] No `any` types introduced (`unknown` + type guards used instead)
- [ ] No `@ts-ignore` or `@ts-expect-error` added
- [ ] No `{@html}` with user-provided content
- [ ] Dependencies added are necessary and reviewed (check Socket.dev report)

## Review Invariants

<!-- Each line is a property the whole codebase holds. Check it only after looking at the diff with that question in mind. -->

- [ ] No new column, id, or timestamp lets a sensitive row be paired with its origin (ticket, person, device, time of day)
- [ ] Every permission check grants exactly the surface its name describes, and no path reuses a broader check for a narrower action
- [ ] Every change to org state writes its audit row inside the same transaction as the change
- [ ] Notification recipients match the event's audience and the recipient's own switch
- [ ] Security, privacy, deletion, and retention copy still names what the mechanism does after this change

## Testing

- [ ] New/modified code has corresponding tests
- [ ] CI run green on this pull request (the workflow ticks this)
- [ ] Coverage thresholds met (ticked by the coverage-full run, when dispatched for this branch)
- [ ] Playwright or coverage-full run attached when the change warrants one

## Notes for Reviewers

<!-- Anything specific reviewers should focus on? Areas of uncertainty? -->
