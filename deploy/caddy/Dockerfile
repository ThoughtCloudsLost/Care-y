# syntax=docker/dockerfile:1
# Caddy with the two modules the production Caddyfile needs:
#   caddy-dns/cloudflare   DNS-01 challenge, the only way to obtain the
#                          wildcard certificate (SEC-255, SEC-256)
#   mholt/caddy-ratelimit  the intake rate-limit zone (SEC-259)
# Every version is pinned and bumped deliberately. caddy-ratelimit is pinned
# to a commit because ipv6_prefix landed after its only tag (v0.1.0).
FROM caddy:2.11.4-builder AS builder
RUN xcaddy build \
    --with github.com/caddy-dns/cloudflare@v0.2.4 \
    --with github.com/mholt/caddy-ratelimit@5625512f24f6f59d6f64fb3aafe5eecff0b286db

FROM caddy:2.11.4
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
