/**
 * tRPC context factory.
 *
 * Runs on every request. Two responsibilities:
 *
 * 1. Org resolution (eager): resolve org from Host header subdomain (prod)
 *    or X-Org-Slug header (dev only). If no slug or org not found, ctx.org = null.
 *    Never throws; publicProcedure endpoints must work without an org.
 *    Also loads the org's sealed box encryptor from org_config.org_public_key.
 *
 * 2. Session lookup (eager, null-safe): if org is resolved AND a session cookie
 *    exists, look up the session and attach user. If org is null, skip entirely.
 *    Never throws; expired/invalid sessions produce ctx.session = null.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type {
  SessionData,
  SessionRepository,
} from "../auth/session-repository.js";
import type { UserRecord, AuthService } from "../auth/service.js";
import type { OrgService } from "../org/service.js";
import type {
  FieldEncryptor,
  BlindIndexer,
} from "../crypto/field-encryptor.js";
import type { SessionTokenizer } from "../crypto/session-tokenizer.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { PasswordHasher } from "../auth/password.js";
import { createSealedBoxEncryptor } from "../crypto/sealed-box.js";
import { createDbSessionRepository } from "../auth/session-repository.js";
import { createAuthService } from "../auth/service.js";
import { parseCookies } from "../auth/cookies.js";
import { SESSION_COOKIE_NAME } from "../auth/service.js";
import { extractClientIp } from "../http/request-utils.js";
import { extractSubdomain } from "@care-y/shared";
import { tenantDb } from "../db/db.js";
import { getEnv } from "../env.js";

export interface OrgContext {
  readonly orgId: string;
  readonly orgSlug: string;
  readonly orgSchema: string;
  readonly tenantDb: Kysely<TenantDatabase>;
  readonly sealedBox: SealedBoxEncryptor;
}

export interface Context {
  readonly req: IncomingMessage;
  readonly res: ServerResponse;
  readonly org: OrgContext | null;
  readonly session: SessionData | null;
  readonly user: UserRecord | null;
}

export interface ContextDeps {
  readonly orgService: OrgService;
  readonly hasher: PasswordHasher;
  readonly encryptor: FieldEncryptor;
  readonly indexer: BlindIndexer;
  readonly tokenizer: SessionTokenizer;
}

/**
 * Extracts org slug from the request.
 * Dev: reads X-Org-Slug header. Prod: extracts subdomain from Host header.
 */
function extractOrgSlug(req: IncomingMessage): string | null {
  const env = getEnv();

  if (env.NODE_ENV === "development") {
    const header = req.headers["x-org-slug"];
    if (typeof header === "string" && header.length > 0) {
      return header;
    }
  }

  const host = req.headers.host;
  if (host === undefined || host === "") return null;

  return extractSubdomain(host);
}

/**
 * Loads org_public_key from org_config and creates a SealedBoxEncryptor.
 * Returns null if the key is not yet set (org in pre-onboarding state).
 */
async function loadSealedBox(
  tDb: Kysely<TenantDatabase>,
): Promise<SealedBoxEncryptor | null> {
  const row = await tDb
    .selectFrom("org_config")
    .select("org_public_key")
    .executeTakeFirst();

  if (!row?.org_public_key) return null;

  return createSealedBoxEncryptor(row.org_public_key);
}

async function resolveOrg(
  req: IncomingMessage,
  orgService: OrgService,
): Promise<OrgContext | null> {
  const slug = extractOrgSlug(req);
  if (slug === null) return null;

  const org = await orgService.findBySlug(slug);
  if (org?.isActive !== true) return null;

  const tDb = tenantDb(org.schemaName);
  const sealedBox = await loadSealedBox(tDb);

  // Org exists but keypair not generated yet (pre-onboarding).
  // Requests to org-scoped endpoints will fail with org not found.
  // This prevents session creation (which requires sealed box) before
  // the onboarding wizard generates the keypair.
  if (sealedBox === null) return null;

  return {
    orgId: org.id,
    orgSlug: org.slug,
    orgSchema: org.schemaName,
    tenantDb: tDb,
    sealedBox,
  };
}

/** Minimal deps for constructing a tenant-scoped AuthService. */
export interface AuthServiceDeps {
  readonly hasher: PasswordHasher;
  readonly encryptor: FieldEncryptor;
  readonly indexer: BlindIndexer;
  readonly tokenizer: SessionTokenizer;
}

/**
 * Creates a SessionRepository scoped to the given org.
 * Call once per request and pass to both auth and 2FA service factories
 * to avoid redundant construction.
 */
export function createTenantSessions(
  orgCtx: OrgContext,
  tokenizer: SessionTokenizer,
): SessionRepository {
  return createDbSessionRepository(
    orgCtx.tenantDb,
    tokenizer,
    orgCtx.sealedBox,
  );
}

/**
 * Creates an AuthService scoped to the given org's tenant DB.
 * Used by both the context factory (session validation) and route handlers
 * (login, register, logout) to avoid repeating the constructor call.
 */
export function createScopedAuthService(
  orgCtx: OrgContext,
  sessions: SessionRepository,
  deps: AuthServiceDeps,
): AuthService {
  return createAuthService(
    orgCtx.tenantDb,
    deps.hasher,
    sessions,
    deps.encryptor,
    deps.indexer,
    deps.tokenizer,
    orgCtx.orgId,
  );
}

async function validateSessionFromRequest(
  req: IncomingMessage,
  orgCtx: OrgContext,
  deps: ContextDeps,
): Promise<{ session: SessionData; user: UserRecord } | null> {
  const cookieToken = parseCookies(req.headers.cookie).get(SESSION_COOKIE_NAME);
  if (cookieToken === undefined) return null;

  const sessions = createTenantSessions(orgCtx, deps.tokenizer);
  const authService = createScopedAuthService(orgCtx, sessions, deps);
  const ip = extractClientIp(req);
  const ua = req.headers["user-agent"] ?? "unknown";

  return authService.validateSession(cookieToken, ip, ua);
}

/**
 * Creates the context factory with injected dependencies.
 * Returns the function tRPC expects for createHTTPServer({ createContext }).
 */
export function createContextFactory(
  deps: ContextDeps,
): (opts: CreateHTTPContextOptions) => Promise<Context> {
  return async ({ req, res }: CreateHTTPContextOptions): Promise<Context> => {
    const org = await resolveOrg(req, deps.orgService);
    let session: SessionData | null = null;
    let user: UserRecord | null = null;

    if (org) {
      const result = await validateSessionFromRequest(req, org, deps);
      if (result) {
        session = result.session;
        user = result.user;
      }
    }

    return { req, res, org, session, user };
  };
}
