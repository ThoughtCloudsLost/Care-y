/**
 * tRPC context factory.
 *
 * Runs on every request. Two responsibilities:
 *
 * 1. Org resolution (eager): resolve org from Host header subdomain (prod)
 *    or X-Org-Slug header (dev only). If no slug or org not found, ctx.org = null.
 *    Never throws; publicProcedure endpoints must work without an org.
 *
 * 2. Session lookup (eager, null-safe): if org is resolved AND a session cookie
 *    exists, look up the session and attach user. If org is null, skip entirely.
 *    Never throws; expired/invalid sessions produce ctx.session = null.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { SessionData } from "../auth/session-repository.js";
import type { UserRecord, AuthService } from "../auth/service.js";
import type { OrgService } from "../org/service.js";
import type {
  FieldEncryptor,
  BlindIndexer,
} from "../crypto/field-encryptor.js";
import type { PasswordHasher } from "../auth/password.js";
import { createDbSessionRepository } from "../auth/session-repository.js";
import { createAuthService } from "../auth/service.js";
import { parseCookies } from "../auth/cookies.js";
import { SESSION_COOKIE_NAME } from "../auth/service.js";
import { extractClientIp } from "../http/request-utils.js";
import { tenantDb } from "../db/db.js";
import { getEnv } from "../env.js";

export interface OrgContext {
  readonly orgId: string;
  readonly orgSlug: string;
  readonly orgSchema: string;
  readonly tenantDb: Kysely<TenantDatabase>;
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

  // Strip port if present
  const hostname = host.split(":")[0];
  if (hostname === undefined || hostname === "") return null;

  // Expect subdomain.domain.tld format (at least 3 parts)
  const parts = hostname.split(".");
  if (parts.length < 3) return null;

  const subdomain = parts[0];
  return subdomain !== undefined && subdomain.length > 0 ? subdomain : null;
}

async function resolveOrg(
  req: IncomingMessage,
  orgService: OrgService,
): Promise<OrgContext | null> {
  const slug = extractOrgSlug(req);
  if (slug === null) return null;

  const org = await orgService.findBySlug(slug);
  if (org?.isActive !== true) return null;

  return {
    orgId: org.id,
    orgSlug: org.slug,
    orgSchema: org.schemaName,
    tenantDb: tenantDb(org.schemaName),
  };
}

/** Minimal deps for constructing a tenant-scoped AuthService. */
export interface AuthServiceDeps {
  readonly hasher: PasswordHasher;
  readonly encryptor: FieldEncryptor;
  readonly indexer: BlindIndexer;
}

/**
 * Creates an AuthService scoped to the given org's tenant DB.
 * Used by both the context factory (session validation) and route handlers
 * (login, register, logout) to avoid repeating the 5-arg constructor call.
 */
export function createScopedAuthService(
  orgCtx: OrgContext,
  deps: AuthServiceDeps,
): AuthService {
  const sessions = createDbSessionRepository(orgCtx.tenantDb, deps.encryptor);
  return createAuthService(
    orgCtx.tenantDb,
    deps.hasher,
    sessions,
    deps.encryptor,
    deps.indexer,
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

  const authService = createScopedAuthService(orgCtx, deps);
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
