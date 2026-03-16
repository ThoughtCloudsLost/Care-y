# Multi-stage build: `production` (default) and `test` targets.
# Production uses `docker compose watch` for file sync (SEC-194, SEC-195).
# Test target adds vitest config; test files bind-mounted by docker-compose.test.yml.
# This avoids pnpm symlink conflicts with bind mounts (SEC-196, SEC-197).
#
# Uses node:22-slim (Debian, glibc) instead of Alpine because sodium-native
# does not ship musl prebuilds. This is the Node.js Docker team's recommended
# base image for production.

# ── base ─────────────────────────────────────────────────────────────
# Shared stage. deps installed, source copied, user created.
FROM node:22-slim AS base

# Shared corepack cache: pre-populate during build so pnpm is available at
# runtime without needing to download anything (required for read_only: true).
ENV COREPACK_HOME=/app/.corepack
RUN corepack enable pnpm

WORKDIR /app

# Install dependencies
# All package.json files are included for pnpm workspace resolution.
# Client source is NOT copied - it runs separately via SvelteKit dev server.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/
COPY packages/shared/package.json ./packages/shared/
COPY packages/crypto/package.json ./packages/crypto/
# --ignore-scripts skips the root postinstall (lefthook install) which needs
# git. We then explicitly rebuild the native addons we actually need.
# sodium-native ships glibc prebuilds (linux-x64) that work on Debian slim.
RUN pnpm install --frozen-lockfile --ignore-scripts \
    && pnpm rebuild sodium-native esbuild

# Copy source (.dockerignore excludes test files, vitest config, docs, etc.)
COPY packages/server ./packages/server
COPY packages/shared ./packages/shared
COPY packages/crypto ./packages/crypto
COPY tsconfig.json tsconfig.base.json ./

# Non-root user (matches container hardening - user 1001)
# Corepack cache is world-readable so user 1001 can resolve pnpm without downloading.
# GID 3001 (oprf-ipc) is the shared group for OPRF socket access. The OPRF sidecar
# containers create sockets with 0770 permissions; appuser needs group membership to connect.
RUN groupadd --system appgroup \
    && groupadd --system --gid 3001 oprf-ipc \
    && useradd --system --gid appgroup --uid 1001 --groups oprf-ipc appuser \
    && chmod -R a+rX /app/.corepack

# ── test ─────────────────────────────────────────────────────────────
# Test files (*.test.ts) and vitest.config.ts are bind-mounted into the
# container by docker-compose.test.yml, not baked into the image.
# /app owned by user 1001 so Vite can write temp files (bundled config).
FROM base AS test
RUN chown 1001:1001 /app
USER 1001

CMD ["tail", "-f", "/dev/null"]

# ── production (default target, must be last) ────────────────────────
FROM base AS production
USER 1001

# Env vars injected by compose env_file (dev) or orchestrator (prod).
# tsx --watch picks up file changes synced in by `docker compose watch`.
CMD ["pnpm", "--filter", "@care-y/server", "exec", \
     "tsx", "--watch", "src/index.ts"]
