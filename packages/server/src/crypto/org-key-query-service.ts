import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { ConflictError } from "../errors.js";
import type { UserId } from "@care-y/shared";

export interface WrappedOrgKeyRow {
  readonly ephemeralPoint: Buffer;
  readonly wrappedKey: Buffer;
  readonly nonce: Buffer;
}

export interface UnwrappedUserRow {
  readonly userId: UserId;
  readonly volPublic: Buffer;
}

export interface UploadOrgPublicKeyInput {
  readonly orgPublicKey: Buffer;
  readonly ephemeralPoint: Buffer;
  readonly nonce: Buffer;
  readonly wrappedKey: Buffer;
  readonly userId: UserId;
}

export interface WrapOrgKeyForUserInput {
  readonly userId: UserId;
  readonly ephemeralPoint: Buffer;
  readonly nonce: Buffer;
  readonly wrappedKey: Buffer;
}

export interface OrgKeyQueryService {
  getWrappedOrgKey(userId: UserId): Promise<WrappedOrgKeyRow | null>;
  uploadOrgPublicKey(input: UploadOrgPublicKeyInput): Promise<void>;
  wrapOrgKeyForUser(input: WrapOrgKeyForUserInput): Promise<void>;
  listUnwrappedUsers(): Promise<readonly UnwrappedUserRow[]>;
}

export function createOrgKeyQueryService(
  db: Kysely<TenantDatabase>,
): OrgKeyQueryService {
  return {
    async getWrappedOrgKey(userId: UserId): Promise<WrappedOrgKeyRow | null> {
      const wrap = await db
        .selectFrom("wrapped_org_keys")
        .selectAll()
        .where("user_id", "=", userId)
        .executeTakeFirst();

      if (!wrap) return null;

      return {
        ephemeralPoint: wrap.ephemeral_point,
        wrappedKey: wrap.wrapped_key,
        nonce: wrap.nonce,
      };
    },

    async uploadOrgPublicKey(input: UploadOrgPublicKeyInput): Promise<void> {
      const existing = await db
        .selectFrom("org_config")
        .select("org_public_key")
        .executeTakeFirst();

      if (
        existing?.org_public_key &&
        !existing.org_public_key.equals(input.orgPublicKey)
      ) {
        throw new ConflictError(
          "Org keypair already configured. Use key rotation to replace.",
        );
      }

      await db.transaction().execute(async (tx) => {
        if (!existing?.org_public_key) {
          await tx
            .updateTable("org_config")
            .set({ org_public_key: input.orgPublicKey })
            .execute();
        }

        await tx
          .insertInto("wrapped_org_keys")
          .values({
            user_id: input.userId,
            ephemeral_point: input.ephemeralPoint,
            nonce: input.nonce,
            wrapped_key: input.wrappedKey,
          })
          .execute();
      });
    },

    async wrapOrgKeyForUser(input: WrapOrgKeyForUserInput): Promise<void> {
      await db
        .insertInto("wrapped_org_keys")
        .values({
          user_id: input.userId,
          ephemeral_point: input.ephemeralPoint,
          nonce: input.nonce,
          wrapped_key: input.wrappedKey,
        })
        .onConflict((oc) => oc.column("user_id").doNothing())
        .execute();
    },

    async listUnwrappedUsers(): Promise<readonly UnwrappedUserRow[]> {
      const rows = await db
        .selectFrom("users")
        .innerJoin("user_keys", "user_keys.user_id", "users.id")
        .leftJoin("wrapped_org_keys", "wrapped_org_keys.user_id", "users.id")
        .where("users.is_active", "=", true)
        .where("user_keys.vol_public", "is not", null)
        .where("wrapped_org_keys.user_id", "is", null)
        .select(["users.id", "user_keys.vol_public"])
        .execute();

      return rows
        .filter(
          (r): r is typeof r & { vol_public: Buffer } => r.vol_public !== null,
        )
        .map((r) => ({
          userId: r.id,
          volPublic: r.vol_public,
        }));
    },
  };
}
