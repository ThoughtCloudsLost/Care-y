/**
 * Phone lookup for the seed snapshot builder, through the product's own
 * relay handler.
 *
 * The browser resolves a phone number with `fetch("/relay/phone-lookup")`
 * carrying the session cookie and `{ "phone": ... }`. This module sends the
 * same request to the real createRelayHandler in-process: a POST to that
 * path with the org host, the session cookie of a real session row for the
 * seeded admin, and the same JSON body as a readable stream. The handler
 * authenticates, checks RELAY_PERMISSIONS, reads the raw body and writes
 * its JSON response into a capturing response object, all unmodified.
 *
 * Only the dependencies phone lookup reaches are real. The rest throw
 * SeedSnapshotBuildError if touched, so an unexpected path fails loud.
 *
 * Builder only: nothing in the shipped demo imports this module.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import type { Kysely } from "kysely";
import { encode } from "@care-y/crypto";
import type { OrgId, ReplyTokenHash, UserId } from "@care-y/shared";
import { sessionTokenSchema } from "@care-y/shared";

import { SeedSnapshotBuildError } from "../errors.js";
import { db, tenantDb } from "../server/db-shim.js";
import { DEMO_ORG_SCHEMA, DEMO_ORG_SLUG } from "../server/seed-structure.js";
import {
  createRelayHandler,
  type RelayHandlerDeps,
} from "../../../../../server/src/routes/relay.js";
import { createDbSessionRepository } from "../../../../../server/src/auth/session-repository.js";
import { hasPermissionForOrg } from "../../../../../server/src/auth/roles.js";
import { extractOrgSlug } from "../../../../../server/src/org/slug-resolver.js";
import { createCallTracker } from "../../../../../server/src/telephony/call-tracker.js";
import type { TenantDatabase } from "../../../../../server/src/db/types.js";
import type { PendingClient } from "../../../../../server/src/tickets/ticket-service.js";
import type { SealedBoxEncryptor } from "../../../../../server/src/crypto/sealed-box.js";
import type { SessionTokenizer } from "../../../../../server/src/crypto/session-tokenizer.js";
import type {
  BlindIndexer,
  FieldEncryptor,
} from "../server/field-encryptor-shim.js";

import { isPhoneLookupResult } from "$lib/components/inputs/client-select-types.js";
import type { SeedPhoneLookup } from "$lib/dev/seed-replay.js";

const PHONE_LOOKUP_PATH = "/relay/phone-lookup";
/** Host the org resolver maps to the demo org (subdomain = org slug). */
const DEMO_HOST = `${DEMO_ORG_SLUG}.care-y.invalid`;
const SESSION_COOKIE = "care_y_session";
const SESSION_TTL_MS = 60 * 60 * 1000;

export interface RelayPhoneLookupDeps {
  readonly orgId: OrgId;
  readonly adminUserId: UserId;
  readonly indexer: BlindIndexer;
  readonly fieldEncryptor: FieldEncryptor;
  readonly pendingClients: Map<string, PendingClient>;
  readonly tokenizer: SessionTokenizer;
  readonly sealedBox: SealedBoxEncryptor;
}

export interface RelayPhoneLookup {
  readonly lookup: (phone: string) => Promise<SeedPhoneLookup>;
  /** Stops the handler's cleanup timer and deletes the builder's session row. */
  readonly close: () => Promise<void>;
}

function unreachable(dep: string): never {
  throw new SeedSnapshotBuildError(
    `Relay dependency "${dep}" is not reachable from phone lookup`,
  );
}

/** Captures what the handler writes: the status and the body text. */
class CapturedResponse {
  status: number | null = null;
  private readonly parts: string[] = [];

  writeHead(status: number, _headers?: Record<string, string>): this {
    this.status = status;
    return this;
  }

  setHeader(_name: string, _value: string): this {
    return this;
  }

  end(chunk?: string | Uint8Array): this {
    if (chunk !== undefined) {
      this.parts.push(
        typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk),
      );
    }
    return this;
  }

  get body(): string {
    return this.parts.join("");
  }
}

export async function createRelayPhoneLookup(
  deps: RelayPhoneLookupDeps,
): Promise<RelayPhoneLookup> {
  const createSessionRepo = (
    orgSchema: string,
  ): ReturnType<typeof createDbSessionRepository> =>
    createDbSessionRepository(
      tenantDb(orgSchema),
      deps.tokenizer,
      deps.sealedBox,
    );

  // A real, 2FA-verified session row for the seeded admin, read back by
  // the relay's own session lookup. Deleted again in close().
  const sessionRepo = createSessionRepo(DEMO_ORG_SCHEMA);
  const token = sessionTokenSchema.parse(
    encode(globalThis.crypto.getRandomValues(new Uint8Array(32))),
  );
  await sessionRepo.create({
    token,
    userId: deps.adminUserId,
    ipAddress: "127.0.0.1",
    userAgent: "care-y-seed-snapshot-builder",
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  await sessionRepo.markTwoFactorVerified(token);

  const callTracker = createCallTracker();
  const handlerDeps: RelayHandlerDeps = {
    // Reached by phone lookup: org and session resolution, the permission
    // gate, the tenant DB, the blind indexer, the OPS encryptor and the
    // pending-client map the ticket create consumes.
    orgResolver: (req) =>
      extractOrgSlug(req) === DEMO_ORG_SLUG
        ? { orgId: deps.orgId, orgSchema: DEMO_ORG_SCHEMA }
        : null,
    createSessionRepo,
    hasPermission: async (orgSchema, userId, permission) => {
      const tDb: Kysely<TenantDatabase> = tenantDb(orgSchema);
      const row = await tDb
        .selectFrom("users")
        .select("role_id")
        .where("id", "=", userId)
        .where("is_active", "=", true)
        .executeTakeFirst();
      if (row === undefined) return false;
      return hasPermissionForOrg(tDb, orgSchema, row.role_id, permission);
    },
    getTenantDb: tenantDb,
    indexer: deps.indexer,
    fieldEncryptor: deps.fieldEncryptor,
    pendingClients: deps.pendingClients,
    platformDb: db,

    // Not reached by phone lookup (SMS, email, calls, WebRTC tokens,
    // consultant verification, the Twilio DTMF callback).
    getProvider: () => unreachable("getProvider"),
    createConsultantRepo: () => unreachable("createConsultantRepo"),
    resolveCallerIdByPurpose: () => unreachable("resolveCallerIdByPurpose"),
    pendingCalls: new Map(),
    webhookBaseUrl: "https://demo.invalid",
    getAuthToken: () => unreachable("getAuthToken"),
    getAccountSid: () => unreachable("getAccountSid"),
    apiKeySid: "",
    apiKeySecret: "",
    twimlAppSid: "",
    // Phone lookup never reaches these two. The tracker is the server's
    // in-memory one; the engine's blind indexer stands in for the
    // consultant index, which the engine's crypto shim does not derive.
    callTracker,
    consultantPhoneIndexer: deps.indexer,
    getSealedBoxEncryptor: () => unreachable("getSealedBoxEncryptor"),
    createConsultantService: () => unreachable("createConsultantService"),
    replyTokenHasher: {
      hash: (): ReplyTokenHash => unreachable("replyTokenHasher.hash"),
    },
    replyTokenCache: new Map(),
  };
  const handler = createRelayHandler(handlerDeps);

  async function lookup(phone: string): Promise<SeedPhoneLookup> {
    // The same body the browser adapter sends.
    const body = new TextEncoder().encode(JSON.stringify({ phone }));
    const req = Object.assign(Readable.from([body]), {
      method: "POST",
      url: PHONE_LOOKUP_PATH,
      headers: {
        host: DEMO_HOST,
        "x-org-slug": DEMO_ORG_SLUG,
        "content-type": "application/json",
        cookie: `${SESSION_COOKIE}=${token}`,
      },
      socket: { remoteAddress: "127.0.0.1" },
    });
    const res = new CapturedResponse();
    try {
      await handler(
        req as unknown as IncomingMessage,
        res as unknown as ServerResponse,
      );
    } finally {
      body.fill(0);
    }

    if (res.status !== 200) {
      throw new SeedSnapshotBuildError(
        `Relay phone lookup answered ${String(res.status)}`,
      );
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(res.body);
    } catch (err: unknown) {
      throw new SeedSnapshotBuildError(
        "Relay phone lookup returned a body that is not JSON",
        { cause: err },
      );
    }
    if (!isPhoneLookupResult(parsed)) {
      throw new SeedSnapshotBuildError(
        "Relay phone lookup returned an unexpected shape",
      );
    }
    return parsed.found
      ? { found: true, clientId: parsed.clientId }
      : { found: false, token: parsed.token };
  }

  return {
    lookup,
    close: async (): Promise<void> => {
      handler.cleanup();
      callTracker.stop();
      await sessionRepo.deleteByToken(token);
    },
  };
}
