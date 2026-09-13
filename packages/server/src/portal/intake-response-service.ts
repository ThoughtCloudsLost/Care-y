/**
 * Intake response listing and lazy wrap backfill service.
 *
 * Returns encrypted response blobs + key wraps for paginated intake
 * form submissions. The server never decrypts response content;
 * ciphertext and wraps are returned as Buffers for the route to
 * encode as base64url on the wire.
 *
 * The backfill mutation accepts client-minted ECIES wraps for
 * principals who should hold ticket keys but do not. Mirrors the
 * rewrap-service.ts pattern: idempotent, access-checked, server
 * validates target principals against current permission holders
 * and queue members.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { ForbiddenError, NotFoundError, ValidationError } from "../errors.js";
import { ErrorCode } from "@care-y/shared";
import type { IntakeFormId, TicketId, UserId } from "@care-y/shared";
import { Permission, ROLE_ID_VALUES, type RoleIdValue } from "@care-y/shared";
import { getEffectivePermissions } from "../auth/roles.js";
import type { OrgSchema } from "@care-y/shared";

// ---------------------------------------------------------------------------
// List responses return shapes
// ---------------------------------------------------------------------------

export interface IntakeResponseKeyWrap {
  readonly volunteerId: UserId;
  readonly ephemeralPoint: Buffer;
  readonly nonce: Buffer;
  readonly wrappedKey: Buffer;
}

export interface IntakeResponseOrgWrap {
  readonly wrappedTk: Buffer;
}

/** A single response row returned from listResponses. */
export interface IntakeResponseRow {
  readonly ticketId: TicketId;
  readonly submittedAt: Date;
  readonly encryptedResponse: Buffer;
  readonly callerKeyWrap: IntakeResponseKeyWrap | null;
  readonly orgSealWrap: IntakeResponseOrgWrap | null;
  readonly missingPrincipals: readonly MissingPrincipal[];
}

export interface IntakeResponsePage {
  readonly rows: readonly IntakeResponseRow[];
  readonly nextCursor: TicketId | null;
  readonly total: number;
}

// ---------------------------------------------------------------------------
// Missing principal reporting
// ---------------------------------------------------------------------------

export interface MissingPrincipal {
  readonly volunteerId: UserId;
  readonly volPublic: string; // base64url
}

// ---------------------------------------------------------------------------
// Backfill input/result
// ---------------------------------------------------------------------------

export interface BackfillWrap {
  readonly ticketId: TicketId;
  readonly volunteerId: UserId;
  readonly ephemeralPoint: Buffer;
  readonly nonce: Buffer;
  readonly wrappedKey: Buffer;
}

export interface BackfillInput {
  readonly ticketId: TicketId;
  readonly wraps: readonly BackfillWrap[];
}

export interface BackfillResult {
  readonly inserted: number;
}

// ---------------------------------------------------------------------------
// Service interface
// ---------------------------------------------------------------------------

export interface IntakeResponseService {
  /**
   * Paginated listing of intake form responses. Returns ciphertext +
   * the caller's own key wrap and/or the org-seal wrap per ticket.
   * Also reports missing principals for lazy backfill.
   */
  listResponses(
    db: Kysely<TenantDatabase>,
    orgSchema: OrgSchema,
    callerId: UserId,
    formId: IntakeFormId,
    opts: { cursor: TicketId | null; pageSize: number },
  ): Promise<IntakeResponsePage>;

  /**
   * Accepts client-minted ECIES wraps for principals the server
   * reported as missing. Idempotent: skips wraps that already exist.
   * Access-checked: caller must hold a wrap for the ticket.
   */
  backfillWraps(
    db: Kysely<TenantDatabase>,
    orgSchema: OrgSchema,
    callerId: UserId,
    input: BackfillInput,
  ): Promise<BackfillResult>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Computes the set of user IDs who hold VIEW_INTAKE_RESPONSES
 * across all roles, accounting for per-org overrides. Returns
 * only users with published vol_public (they can receive wraps).
 */
async function getPermissionHolders(
  db: Kysely<TenantDatabase>,
  orgSchema: OrgSchema,
): Promise<Map<UserId, Buffer>> {
  // Compute which roles currently have the permission
  const rolesWithPerm: RoleIdValue[] = [];
  for (const roleId of ROLE_ID_VALUES) {
    const perms = await getEffectivePermissions(db, orgSchema, roleId);
    if (perms.has(Permission.VIEW_INTAKE_RESPONSES)) {
      rolesWithPerm.push(roleId);
    }
  }

  if (rolesWithPerm.length === 0) return new Map();

  // Find active users with those roles who have vol_public
  const users = await db
    .selectFrom("users")
    .innerJoin("user_keys", "user_keys.user_id", "users.id")
    .select(["users.id", "user_keys.vol_public"])
    .where("users.role_id", "in", rolesWithPerm)
    .where("users.is_active", "=", true)
    .where("user_keys.vol_public", "is not", null)
    .execute();

  const result = new Map<UserId, Buffer>();
  for (const u of users) {
    if (u.vol_public !== null) {
      result.set(u.id, u.vol_public);
    }
  }
  return result;
}

/**
 * For a given ticket, computes which principals (permission holders +
 * queue members) lack ticket_key_wraps rows.
 */
async function computeMissingPrincipals(
  db: Kysely<TenantDatabase>,
  orgSchema: OrgSchema,
  ticketId: TicketId,
): Promise<MissingPrincipal[]> {
  // Get the ticket's queue
  const ticket = await db
    .selectFrom("tickets")
    .select("queue_id")
    .where("id", "=", ticketId)
    .executeTakeFirst();

  if (!ticket) return [];

  // Build the full target set: permission holders + queue members
  const permHolders = await getPermissionHolders(db, orgSchema);

  const queueMembers = await db
    .selectFrom("queue_assignments")
    .innerJoin("user_keys", "user_keys.user_id", "queue_assignments.user_id")
    .select(["queue_assignments.user_id", "user_keys.vol_public"])
    .where("queue_assignments.queue_id", "=", ticket.queue_id)
    .where("user_keys.vol_public", "is not", null)
    .execute();

  const allTargets = new Map<UserId, Buffer>(permHolders);
  for (const m of queueMembers) {
    if (m.vol_public !== null && !allTargets.has(m.user_id)) {
      allTargets.set(m.user_id, m.vol_public);
    }
  }

  if (allTargets.size === 0) return [];

  // Find existing wraps for this ticket
  const existingWraps = await db
    .selectFrom("ticket_key_wraps")
    .select("volunteer_id")
    .where("ticket_id", "=", ticketId)
    .execute();

  const wrapped = new Set(existingWraps.map((w) => w.volunteer_id));

  // Missing = targets without an existing wrap
  const missing: MissingPrincipal[] = [];
  for (const [userId, volPublic] of allTargets) {
    if (!wrapped.has(userId)) {
      missing.push({
        volunteerId: userId,
        volPublic: volPublic.toString("base64url"),
      });
    }
  }

  return missing;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export function createIntakeResponseService(): IntakeResponseService {
  return {
    async listResponses(
      db: Kysely<TenantDatabase>,
      orgSchema: OrgSchema,
      callerId: UserId,
      formId: IntakeFormId,
      opts: { cursor: TicketId | null; pageSize: number },
    ): Promise<IntakeResponsePage> {
      // Verify form exists
      const form = await db
        .selectFrom("intake_forms")
        .select("id")
        .where("id", "=", formId)
        .executeTakeFirst();

      if (!form) {
        throw new NotFoundError("Form not found");
      }

      // Count total responses for this form
      const countRow = await db
        .selectFrom("intake_form_responses")
        .select(db.fn.countAll<number>().as("total"))
        .where("form_id", "=", formId)
        .executeTakeFirst();

      const total = countRow?.total ?? 0;

      // Build paginated query using keyset pagination on (created_at, ticket_id)
      let query = db
        .selectFrom("intake_form_responses as ifr")
        .leftJoin("ticket_key_wraps as kw", (join) =>
          join
            .onRef("kw.ticket_id", "=", "ifr.ticket_id")
            .on("kw.volunteer_id", "=", callerId),
        )
        .leftJoin("intake_key_wraps as ikw", "ikw.ticket_id", "ifr.ticket_id")
        .where("ifr.form_id", "=", formId)
        .select([
          "ifr.ticket_id",
          "ifr.created_at",
          "ifr.encrypted_response",
          "kw.ephemeral_point as kw_ephemeral_point",
          "kw.nonce as kw_nonce",
          "kw.wrapped_key as kw_wrapped_key",
          "kw.volunteer_id as kw_volunteer_id",
          "ikw.wrapped_tk as ikw_wrapped_tk",
        ])
        .orderBy("ifr.created_at", "desc")
        .orderBy("ifr.ticket_id", "desc")
        .limit(opts.pageSize);

      // Apply cursor (keyset pagination via subquery to preserve timestamp precision)
      if (opts.cursor !== null) {
        const cursorTicketId = opts.cursor;
        query = query.where((eb) => {
          const cursorCreatedAt = eb
            .selectFrom("intake_form_responses as cur")
            .select("cur.created_at")
            .where("cur.ticket_id", "=", cursorTicketId);

          return eb.or([
            eb("ifr.created_at", "<", cursorCreatedAt),
            eb.and([
              eb("ifr.created_at", "=", cursorCreatedAt),
              eb("ifr.ticket_id", "<", cursorTicketId),
            ]),
          ]);
        });
      }

      const dbRows = await query.execute();

      // Compute missing principals per row (only for rows where the caller
      // holds a wrap, since only key holders can mint backfill wraps)
      const rows: IntakeResponseRow[] = [];
      for (const r of dbRows) {
        const callerHasWrap = r.kw_volunteer_id !== null;
        const hasOrgSeal = r.ikw_wrapped_tk !== null;

        // Only compute missing principals when the caller can act on them
        const missingPrincipals =
          callerHasWrap || hasOrgSeal
            ? await computeMissingPrincipals(db, orgSchema, r.ticket_id)
            : [];

        rows.push({
          ticketId: r.ticket_id,
          submittedAt: r.created_at,
          encryptedResponse: r.encrypted_response,
          callerKeyWrap:
            r.kw_volunteer_id !== null &&
            r.kw_ephemeral_point !== null &&
            r.kw_nonce !== null &&
            r.kw_wrapped_key !== null
              ? {
                  volunteerId: r.kw_volunteer_id,
                  ephemeralPoint: r.kw_ephemeral_point,
                  nonce: r.kw_nonce,
                  wrappedKey: r.kw_wrapped_key,
                }
              : null,
          orgSealWrap:
            r.ikw_wrapped_tk !== null ? { wrappedTk: r.ikw_wrapped_tk } : null,
          missingPrincipals,
        });
      }

      const lastRow = dbRows.at(-1);
      const nextCursor =
        dbRows.length === opts.pageSize && lastRow ? lastRow.ticket_id : null;

      return { rows, nextCursor, total };
    },

    async backfillWraps(
      db: Kysely<TenantDatabase>,
      orgSchema: OrgSchema,
      callerId: UserId,
      input: BackfillInput,
    ): Promise<BackfillResult> {
      if (input.wraps.length === 0) {
        return { inserted: 0 };
      }

      // Caller must hold a wrap for this ticket (proves key possession)
      const callerWrap = await db
        .selectFrom("ticket_key_wraps")
        .select("volunteer_id")
        .where("ticket_id", "=", input.ticketId)
        .where("volunteer_id", "=", callerId)
        .executeTakeFirst();

      // Also accept org-seal (unconverted ticket, caller can unseal)
      const orgSeal = callerWrap
        ? null
        : await db
            .selectFrom("intake_key_wraps")
            .select("ticket_id")
            .where("ticket_id", "=", input.ticketId)
            .executeTakeFirst();

      if (!callerWrap && !orgSeal) {
        throw new ForbiddenError(ErrorCode.INSUFFICIENT_PERMISSIONS);
      }

      // Get the ticket's key_generation
      const ticket = await db
        .selectFrom("tickets")
        .select(["queue_id", "key_generation"])
        .where("id", "=", input.ticketId)
        .executeTakeFirst();

      if (!ticket) {
        throw new NotFoundError("Ticket not found");
      }

      // Build the set of valid targets: permission holders + queue members
      const permHolders = await getPermissionHolders(db, orgSchema);

      const queueMembers = await db
        .selectFrom("queue_assignments")
        .select("user_id")
        .where("queue_id", "=", ticket.queue_id)
        .execute();

      const validTargets = new Set<UserId>();
      for (const [uid] of permHolders) {
        validTargets.add(uid);
      }
      for (const m of queueMembers) {
        validTargets.add(m.user_id);
      }

      // Validate every target the client sent
      for (const wrap of input.wraps) {
        if (!validTargets.has(wrap.volunteerId)) {
          throw new ValidationError(
            `Volunteer ${wrap.volunteerId} is not a valid backfill target`,
          );
        }
      }

      // Get existing wraps to skip duplicates (idempotent)
      const existingWraps = await db
        .selectFrom("ticket_key_wraps")
        .select("volunteer_id")
        .where("ticket_id", "=", input.ticketId)
        .execute();

      const alreadyWrapped = new Set(existingWraps.map((w) => w.volunteer_id));

      const toInsert = input.wraps.filter(
        (w) => !alreadyWrapped.has(w.volunteerId),
      );

      if (toInsert.length === 0) {
        return { inserted: 0 };
      }

      // Insert wraps
      for (const wrap of toInsert) {
        await db
          .insertInto("ticket_key_wraps")
          .values({
            ticket_id: input.ticketId,
            volunteer_id: wrap.volunteerId,
            key_generation: ticket.key_generation,
            ephemeral_point: wrap.ephemeralPoint,
            nonce: wrap.nonce,
            wrapped_key: wrap.wrappedKey,
            algorithm: "ecies-ristretto255-v1",
          })
          .execute();
      }

      return { inserted: toInsert.length };
    },
  };
}
