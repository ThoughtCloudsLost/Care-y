/**
 * Intake key wrap conversion: transforms org-key sealed wraps into
 * per-volunteer ECIES wraps.
 *
 * The public intake form seals tk to the org public key (crypto_box_seal).
 * The first volunteer to open the ticket detail converts that sealed wrap
 * into standard ristretto255 ECIES wraps for each queue volunteer. After
 * conversion the interim wrap is deleted and the ticket is indistinguishable
 * from any telephony-originated ticket.
 *
 * The Worker (client-side) performs the actual unsealing and ECIES
 * re-wrapping. This service validates targets, stores wraps, and deletes
 * the interim row, all within a single transaction.
 *
 * Conversion targets include both queue members and holders of the
 * VIEW_INTAKE_RESPONSES permission (across all queues), so permission
 * holders gain decrypt capability at conversion time without becoming
 * queue members.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { TicketAccessChecker } from "../tickets/access.js";
import { ForbiddenError, ValidationError } from "../errors.js";
import { encode } from "@care-y/crypto";
import {
  Permission,
  ROLE_ID_VALUES,
  type RoleIdValue,
  type OrgSchema,
} from "@care-y/shared";
import type { TicketId, UserId } from "@care-y/shared";
import { getEffectivePermissions } from "../auth/roles.js";

export interface ConversionTarget {
  readonly volunteerId: UserId;
  readonly volPublic: string; // base64
}

export interface ConversionWrap {
  readonly volunteerId: UserId;
  readonly ephemeralPoint: Buffer;
  readonly nonce: Buffer;
  readonly wrappedKey: Buffer;
}

export interface ConvertIntakeKeyWrapInput {
  readonly ticketId: TicketId;
  readonly wraps: readonly ConversionWrap[];
}

export interface ConvertIntakeKeyWrapResult {
  readonly converted: boolean;
}

/**
 * Returns active user IDs with vol_public who hold VIEW_INTAKE_RESPONSES
 * in any role, accounting for per-org permission overrides.
 */
async function getResponsePermissionHolders(
  db: Kysely<TenantDatabase>,
  orgSchema: OrgSchema,
): Promise<Map<UserId, Buffer>> {
  const rolesWithPerm: RoleIdValue[] = [];
  for (const roleId of ROLE_ID_VALUES) {
    const perms = await getEffectivePermissions(db, orgSchema, roleId);
    if (perms.has(Permission.VIEW_INTAKE_RESPONSES)) {
      rolesWithPerm.push(roleId);
    }
  }

  if (rolesWithPerm.length === 0) return new Map();

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
 * Fetch conversion targets for a ticket: queue members plus holders
 * of VIEW_INTAKE_RESPONSES (across all queues). Both groups must have
 * published vol_public to receive wraps.
 *
 * Uses the same queue_assignments x user_keys join as server-side ticket
 * creation (server-ticket-create.ts) for queue members, and adds
 * permission holders on top.
 */
export async function getConversionTargets(
  db: Kysely<TenantDatabase>,
  access: TicketAccessChecker,
  userId: UserId,
  ticketId: TicketId,
  orgSchema: OrgSchema,
): Promise<ConversionTarget[]> {
  await access.assertAccess(userId, ticketId);

  const ticket = await db
    .selectFrom("tickets")
    .select("queue_id")
    .where("id", "=", ticketId)
    .executeTakeFirst();

  if (!ticket) return [];

  // Queue members with vol_public
  const queueVolunteers = await db
    .selectFrom("queue_assignments")
    .innerJoin("user_keys", "user_keys.user_id", "queue_assignments.user_id")
    .select(["queue_assignments.user_id", "user_keys.vol_public"])
    .where("queue_assignments.queue_id", "=", ticket.queue_id)
    .where("user_keys.vol_public", "is not", null)
    .execute();

  // Build a deduped target map: userId -> vol_public
  const targetMap = new Map<UserId, Buffer>();
  for (const v of queueVolunteers) {
    if (v.vol_public !== null) {
      targetMap.set(v.user_id, v.vol_public);
    }
  }

  // Permission holders (across all queues) with vol_public
  const permHolders = await getResponsePermissionHolders(db, orgSchema);
  for (const [uid, pub] of permHolders) {
    if (!targetMap.has(uid)) {
      targetMap.set(uid, pub);
    }
  }

  return Array.from(targetMap.entries()).map(([uid, pub]) => ({
    volunteerId: uid,
    volPublic: encode(new Uint8Array(pub)),
  }));
}

/**
 * Convert the interim org-key sealed wrap into per-volunteer ECIES wraps.
 *
 * Transaction semantics:
 * 1. DELETE the intake_key_wraps row with RETURNING (row lock serializes
 *    concurrent converters; zero rows = already converted, return no-op).
 * 2. Validate every volunteerId against the valid target set (queue
 *    members + permission holders; client list is untrusted).
 * 3. Insert ticket_key_wraps rows for each validated wrap.
 * 4. On any insert failure the transaction rolls back, restoring the
 *    interim wrap.
 *
 * Empty wraps list (no volunteers with vol_public) is a no-op that leaves
 * the interim wrap in place for retry on next open.
 */
export async function convertIntakeKeyWrap(
  db: Kysely<TenantDatabase>,
  access: TicketAccessChecker,
  userId: UserId,
  input: ConvertIntakeKeyWrapInput,
  orgSchema: OrgSchema,
): Promise<ConvertIntakeKeyWrapResult> {
  await access.assertAccess(userId, input.ticketId);

  // Empty wraps list: no volunteers onboarded yet. Leave the interim wrap.
  if (input.wraps.length === 0) {
    return { converted: false };
  }

  return db.transaction().execute(async (trx) => {
    // Row-lock the interim wrap. RETURNING gives us the row if it existed.
    const deleted = await trx
      .deleteFrom("intake_key_wraps")
      .where("ticket_id", "=", input.ticketId)
      .returning("ticket_id")
      .executeTakeFirst();

    // Already converted (concurrent converter won the race, or no wrap exists).
    if (!deleted) {
      return { converted: false };
    }

    // Fetch the ticket's queue and key_generation for the inserts.
    const ticket = await trx
      .selectFrom("tickets")
      .select(["queue_id", "key_generation"])
      .where("id", "=", input.ticketId)
      .executeTakeFirst();

    if (!ticket) {
      // Ticket disappeared mid-transaction (cascade delete); nothing to do.
      return { converted: false };
    }

    // Build the valid target set: queue members + permission holders
    const queueMembers = await trx
      .selectFrom("queue_assignments")
      .select("user_id")
      .where("queue_id", "=", ticket.queue_id)
      .execute();

    const validTargets = new Set(queueMembers.map((m) => m.user_id));

    // Add permission holders to the valid target set
    const permHolders = await getResponsePermissionHolders(trx, orgSchema);
    for (const [uid] of permHolders) {
      validTargets.add(uid);
    }

    // Validate every volunteerId the client sent.
    for (const wrap of input.wraps) {
      if (!validTargets.has(wrap.volunteerId)) {
        throw new ForbiddenError(
          `Volunteer ${wrap.volunteerId} is not a valid conversion target`,
        );
      }
    }

    // Insert ECIES wraps for each target volunteer.
    for (const wrap of input.wraps) {
      await trx
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

    return { converted: true };
  });
}

/**
 * Typed error for the key rotation guard: rotation cannot proceed while
 * intake wraps are pending conversion.
 */
export class PendingIntakeWrapsError extends ValidationError {
  constructor() {
    super(
      "Cannot rotate org key while intake_key_wraps rows exist. " +
        "Convert all pending intake wraps before rotating.",
    );
  }
}
