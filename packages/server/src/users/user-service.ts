/**
 * User service: read-only queries against the tenant users table.
 *
 * Created for the @mention autocomplete feature. The route
 * handler delegates to this service rather than querying the DB directly
 * (layer separation per code-standards.md).
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

export interface VolunteerListRecord {
  readonly id: string;
  readonly encryptedDisplayName: Buffer;
}

export interface UserService {
  listActiveVolunteers(): Promise<readonly VolunteerListRecord[]>;
}

export function createUserService(db: Kysely<TenantDatabase>): UserService {
  return {
    async listActiveVolunteers(): Promise<readonly VolunteerListRecord[]> {
      const rows = await db
        .selectFrom("users")
        .select(["id", "encrypted_display_name"])
        .where("is_active", "=", true)
        .execute();

      return rows.map((r) => ({
        id: r.id,
        encryptedDisplayName: r.encrypted_display_name,
      }));
    },
  };
}
