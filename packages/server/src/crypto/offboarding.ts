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
 */

import { type Kysely, sql } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { OffboardingError } from "../errors.js";

export interface OffboardingService {
  /**
   * Revokes a volunteer's crypto access:
   * 1. Deletes all ticket_key_wraps rows (instant PII revocation)
   * 2. Deletes wrapped_org_keys row (revokes non-PII access)
   * 3. Deletes user_keys row (removes vol_public, salt)
   *
   * Does NOT deactivate the user or delete the users row.
   */
  revokeVolunteerKeys(userId: string): Promise<void>;
}

export function createOffboardingService(
  db: Kysely<TenantDatabase>,
): OffboardingService {
  return {
    async revokeVolunteerKeys(userId: string): Promise<void> {
      await db.transaction().execute(async (tx) => {
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
