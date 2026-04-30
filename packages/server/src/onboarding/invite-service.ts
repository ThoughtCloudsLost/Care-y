import { randomBytes, createHash } from "node:crypto";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

const DEFAULT_EXPIRY_HOURS = 72;

export interface InviteService {
  generate(input: {
    invitedBy: string;
    roleId: string;
    encryptedEmail?: Buffer;
    expiresInHours?: number;
  }): Promise<{ rawToken: string; expiresAt: Date }>;

  validate(rawToken: string): Promise<{
    id: string;
    roleId: string;
    invitedBy: string;
    expiresAt: Date;
  } | null>;

  consume(tokenId: string): Promise<void>;
}

function hashToken(rawToken: string): Buffer {
  return createHash("sha256").update(rawToken, "utf8").digest();
}

export function createInviteService(db: Kysely<TenantDatabase>): InviteService {
  return {
    async generate(input) {
      const rawToken = randomBytes(32).toString("base64url");
      const tokenHash = hashToken(rawToken);
      const expiresInHours = input.expiresInHours ?? DEFAULT_EXPIRY_HOURS;
      const expiresAt = new Date(Date.now() + expiresInHours * 3600_000);

      await db
        .insertInto("invite_tokens")
        .values({
          token_hash: tokenHash,
          invited_by: input.invitedBy,
          encrypted_email: input.encryptedEmail ?? null,
          role_id: input.roleId,
          expires_at: expiresAt,
        })
        .execute();

      return { rawToken, expiresAt };
    },

    async validate(rawToken) {
      const tokenHash = hashToken(rawToken);

      const row = await db
        .selectFrom("invite_tokens")
        .select(["id", "role_id", "invited_by", "expires_at"])
        .where("token_hash", "=", tokenHash)
        .where("consumed_at", "is", null)
        .where("expires_at", ">", new Date())
        .executeTakeFirst();

      if (!row) return null;

      return {
        id: row.id,
        roleId: row.role_id,
        invitedBy: row.invited_by,
        expiresAt: row.expires_at,
      };
    },

    async consume(tokenId) {
      await db
        .updateTable("invite_tokens")
        .set({ consumed_at: new Date() })
        .where("id", "=", tokenId)
        .execute();
    },
  };
}
