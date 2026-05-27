import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  generateOrgKeypair,
  getSodium,
  toRistrettoPoint,
  wrapKey,
} from "@care-y/crypto";
import { NotFoundError } from "../errors.js";

export async function seedOrgKey(
  tDb: Kysely<TenantDatabase>,
  userId: string,
): Promise<{ success: true; skipped: boolean }> {
  const existing = await tDb
    .selectFrom("wrapped_org_keys")
    .select("user_id")
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (existing) {
    return { success: true, skipped: true };
  }

  const userKey = await tDb
    .selectFrom("user_keys")
    .select("vol_public")
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (!userKey?.vol_public) {
    throw new NotFoundError(
      "No vol_public found. Login must complete before seeding org key.",
    );
  }

  await getSodium();
  const { publicKey, secretKey } = generateOrgKeypair();

  try {
    const volPublicPoint = toRistrettoPoint(userKey.vol_public);
    const wrapped = wrapKey(secretKey, volPublicPoint);

    await tDb.transaction().execute(async (tx) => {
      await tx
        .updateTable("org_config")
        .set({ org_public_key: Buffer.from(publicKey) })
        .execute();

      await tx
        .insertInto("wrapped_org_keys")
        .values({
          user_id: userId,
          ephemeral_point: Buffer.from(wrapped.ephemeralPoint),
          nonce: Buffer.from(wrapped.nonce),
          wrapped_key: Buffer.from(wrapped.ciphertext),
        })
        .execute();
    });

    return { success: true, skipped: false };
  } finally {
    secretKey.fill(0);
  }
}
