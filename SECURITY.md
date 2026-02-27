# Security Policy

CARE-Y protects at-risk individuals whose identity, contact information, and case details could endanger them if exposed.
Security vulnerabilities in this system are not abstract risks. **They threaten real people.** We take every report seriously.

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Email: **Care-y.app@protonmail.com**

Include:

- Description of the vulnerability
- Steps to reproduce (or a proof-of-concept)
- Affected component(s) and version(s)
- Potential impact assessment

## TODO: add key before release
If you can, encrypt your report with our PGP key _(key to be published here before first public release)_.

## What to Expect

| Timeframe    | Action                                                  |
| ------------ | ------------------------------------------------------- |
| **48 hours** | Acknowledgment of your report                           |
| **7 days**   | Initial triage and severity assessment                  |
| **30 days**  | Resolution target for critical/high severity issues     |
| **90 days**  | Maximum disclosure timeline (coordinated with reporter) |

We will keep you informed of progress throughout.

## Scope

The following are in scope:

- All code in this repository (`packages/client`, `packages/server`, `packages/crypto`, `packages/shared`)
- Encryption implementation and key management
- Authentication and session handling
- Telephony relay endpoints (plaintext handling, memory zeroing)
- Webhook signature validation
- Access control and authorization logic
- Infrastructure configuration (Docker, Caddy, deployment)
- Dependencies with known vulnerabilities affecting CARE-Y

The following are out of scope:

- Third-party services (Twilio, Hetzner): report to those providers directly
- Social engineering attacks against volunteers (important, but not a code fix)
- Denial of service via resource exhaustion (accepted risk at current scale)

## Severity Classification

| Severity     | Description                                            | Example                                                      |
| ------------ | ------------------------------------------------------ | ------------------------------------------------------------ |
| **Critical** | Plaintext PII exposure, org key leak, auth bypass      | Database decryption possible, relay endpoint logging content |
| **High**     | Encrypted data at risk, privilege escalation           | Weak KDF parameters, admin access without proper role        |
| **Medium**   | Information disclosure of non-PII, missing protections | Metadata leakage, missing rate limiting on auth              |
| **Low**      | Defense-in-depth gaps, hardening opportunities         | Missing security header, verbose error messages              |

## Safe Harbor

We will not pursue legal action against security researchers who:

- Act in good faith and follow this disclosure policy
- Avoid accessing or modifying data belonging to real users
- Do not disrupt service availability
- Report findings promptly and allow reasonable remediation time

## Acknowledgments

We maintain a list of security researchers who have responsibly disclosed vulnerabilities. If you'd like to be credited, let us know in your report.
