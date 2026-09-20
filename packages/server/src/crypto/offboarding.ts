/**
 * Offboarding service for revoking a volunteer's crypto access.
 *
 * Deletes all key material associated with a departing volunteer in one
 * transaction. Removes ticket key wraps, the wrapped org key copy, and
 * the user_keys row.
 * After this, the volunteer cannot decrypt any PII or non-PII org data.
 *
 * Does NOT deactivate the user account or delete the users row. Account
 * lifecycle is the auth service's responsibility.
 *
 * Last-holder guard: refuses when the departing user is the sole
 * wrap-holder of any ticket, unless the caller explicitly forces.
 */

import { type Kysely, sql } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { OffboardingError } from "../errors.js";
import type { UserId, TicketId } from "@care-y/shared";
import { ErrorCode } from "@care-y/shared";
import { AppError } from "../errors.js";

/**
 * Thrown when the departing user is the sole wrap-holder of one or more
 * tickets. The error carries the affected ticket count so the client can
 * display a data-loss confirmation before forcing.
 */
export class SoleWrapHolderError extends AppError {
  readonly code = ErrorCode.SOLE_WRAP_HOLDER;
  readonly httpStatus = 409;
  readonly soleHeldTicketCount: number;
  readonly soleHeldTicketIds: readonly TicketId[];

  constructor(ticketIds: readonly TicketId[]) {
    super(
      `User is the sole wrap holder for ${String(ticketIds.length)} ticket(s)`,
    );
    this.soleHeldTicketCount = ticketIds.length;
    this.soleHeldTicketIds = ticketIds;
  }
}

export interface OffboardingService {
  /**
   * Revokes a volunteer's crypto access:
   * 1. Checks for sole-holder tickets (unless force = true)
   * 2. Deletes all ticket_key_wraps rows (instant PII revocation)
   * 3. Deletes wrapped_org_keys row (revokes non-PII access)
   * 4. Deletes user_keys row (removes vol_public, salt)
   *
   * Does NOT deactivate the user or delete the users row.
   *
   * @throws SoleWrapHolderError when the user is the sole holder of
   *         any ticket wraps and force is not set.
   */
  revokeVolunteerKeys(userId: UserId, force?: boolean): Promise<void>;

  /**
   * Returns ticket IDs where the given user is the only wrap holder.
   * Used by the client to display a data-loss confirmation before
   * forcing deactivation.
   */
  getSoleHeldTicketIds(userId: UserId): Promise<readonly TicketId[]>;
}

export function createOffboardingService(
  db: Kysely<TenantDatabase>,
): OffboardingService {
  async function findSoleHeldTickets(
    conn: Kysely<TenantDatabase>,
    userId: UserId,
  ): Promise<readonly TicketId[]> {
    // Find tickets where this user has a wrap and is the ONLY holder.
    // A ticket is sole-held when the total number of distinct volunteers
    // with wraps for it equals 1 and that volunteer is the departing user.
    const rows = await conn
      .selectFrom("ticket_key_wraps as tkw")
      .select("tkw.ticket_id")
      .where("tkw.ticket_id", "in", (qb) =>
        qb
          .selectFrom("ticket_key_wraps")
          .select("ticket_id")
          .where("volunteer_id", "=", userId),
      )
      .groupBy("tkw.ticket_id")
      .having(
        conn.fn.count(conn.fn("DISTINCT", [sql.ref("tkw.volunteer_id")])),
        "=",
        1,
      )
      .execute();

    return rows.map((r) => r.ticket_id);
  }

  return {
    async getSoleHeldTicketIds(userId: UserId): Promise<readonly TicketId[]> {
      return findSoleHeldTickets(db, userId);
    },

    async revokeVolunteerKeys(userId: UserId, force = false): Promise<void> {
      await db.transaction().execute(async (tx) => {
        // Last-holder guard: check before deleting
        if (!force) {
          const soleHeld = await findSoleHeldTickets(tx, userId);
          if (soleHeld.length > 0) {
            throw new SoleWrapHolderError(soleHeld);
          }
        }

        // ticket_key_wraps may not have a CREATE TABLE migration yet.
        // SAVEPOINT protects the outer transaction from PostgreSQL's
        // "current transaction is aborted" state on missing-table error.
        await sql`SAVEPOINT offboard_wraps`.execute(tx);
        try {
          /* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
          await tx
            .deleteFrom("ticket_key_wraps" as never)
            .where("volunteer_id" as never, "=", userId as never)
            .execute();
          /* eslint-enable @typescript-eslint/no-unsafe-type-assertion */
          await sql`RELEASE SAVEPOINT offboard_wraps`.execute(tx);
        } catch (err: unknown) {
          if (err instanceof Error && err.message.includes("does not exist")) {
            await sql`ROLLBACK TO SAVEPOINT offboard_wraps`.execute(tx);
          } else {
            throw err;
          }
        }

        // Delete wrapped org key copy
        await tx
          .deleteFrom("wrapped_org_keys")
          .where("user_id", "=", userId)
          .execute();

        // Delete user_keys (salt, vol_public, rotation state)
        const keysResult = await tx
          .deleteFrom("user_keys")
          .where("user_id", "=", userId)
          .executeTakeFirst();

        if (keysResult.numDeletedRows === BigInt(0)) {
          throw new OffboardingError(
            `No user_keys row found for user ${userId}`,
          );
        }
      });
    },
  };
}
