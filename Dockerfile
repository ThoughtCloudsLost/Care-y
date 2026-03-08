# Dev/prod parity: this container runs with read_only, no bind mounts, no anonymous
# volumes. Dev uses `docker compose watch` for file sync (SEC-194, SEC-195).
# This avoids pnpm symlink conflicts with bind mounts (SEC-196, SEC-197).
FROM node:22-alpine AS base

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
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/server ./packages/server
COPY packages/shared ./packages/shared
COPY packages/crypto ./packages/crypto
COPY tsconfig.json tsconfig.base.json ./

# Non-root user (matches container hardening - user 1001)
# Corepack cache is world-readable so user 1001 can resolve pnpm without downloading.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup -u 1001 \
    && chmod -R a+rX /app/.corepack
USER 1001

# Env vars injected by compose env_file (dev) or orchestrator (prod).
# tsx --watch picks up file changes synced in by `docker compose watch`.
CMD ["pnpm", "--filter", "@care-y/server", "exec", \
     "tsx", "--watch", "src/index.ts"]
