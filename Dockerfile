FROM node:22-alpine AS base
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
RUN addgroup -S appgroup && adduser -S appuser -G appgroup -u 1001
USER 1001

# Hot reload dev server
CMD ["pnpm", "--filter", "@care-y/server", "exec", \
     "tsx", "--watch", "--env-file=.env", "src/index.ts"]
