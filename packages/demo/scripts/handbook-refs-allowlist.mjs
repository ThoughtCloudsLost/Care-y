/**
 * Allowlist for handbook selector references that check-handbook-refs.mjs
 * cannot resolve against product source, each with the reason the gap is
 * accepted. Keyed by the exact selector string as written in
 * scroll-sections.ts or tap-pulse.ts.
 *
 * An allowed selector downgrades from a hard failure to a warning while
 * the underlying gap persists. An entry that no longer matches any
 * unresolved selector fails the check: a stale exemption is a small lie
 * that grows.
 */

export const HANDBOOK_REFS_ALLOWLIST = new Map([
  // No entries yet. Shape:
  // [".some-selector", { reason: "one line on why this cannot resolve" }],
]);
