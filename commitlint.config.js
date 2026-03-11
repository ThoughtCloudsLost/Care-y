// Conventional Commits: https://www.conventionalcommits.org/
// Format: type(scope): description
//
// Types: feat, fix, refactor, test, docs, chore, ci, perf, style, build, revert
// Scopes: crypto, server, client, shared, infra, deps (or omit for cross-cutting)
//
// Examples:
//   feat(crypto): add Argon2id key derivation
//   fix(server): zero relay buffer in finally block
//   test(crypto): add property-based encrypt/decrypt roundtrip
//   chore(deps): update libsodium-wrappers to 0.7.15
//   ci: add Gitleaks secret scanning step
//   docs: add GDPR compliance planning doc

export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Scope must be one of our packages or cross-cutting concerns
    "scope-enum": [
      2,
      "always",
      [
        "auth",
        "crypto",
        "server",
        "client",
        "shared",
        "infra",
        "deps",
        "ci",
        "docs",
      ],
    ],
    // Allow empty scope for cross-cutting changes
    "scope-empty": [0],
    // Subject must not be empty
    "subject-empty": [2, "never"],
    // Type must not be empty
    "type-empty": [2, "never"],
  },
};
