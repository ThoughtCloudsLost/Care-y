import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  generateOrgKeypair,
  getSodium,
  toRistrettoPoint,
  wrapKey,
} from "@care-y/crypto";
import sodium from "sodium-native";
import { NotFoundError } from "../errors.js";

function sealWithOrgKey(plaintext: string, orgPk: Uint8Array): Buffer {
  const pt = Buffer.from(plaintext, "utf8");
  const ct = Buffer.alloc(pt.length + sodium.crypto_box_SEALBYTES);
  sodium.crypto_box_seal(ct, pt, Buffer.from(orgPk));
  return ct;
}

async function resealOrgEncryptedNames(
  tDb: Kysely<TenantDatabase>,
  orgPk: Uint8Array,
): Promise<void> {
  const queues = await tDb
    .selectFrom("queues")
    .select(["id", "sort_order"])
    .orderBy("sort_order", "asc")
    .execute();

  const queuePairs: [string, string][] = [
    ["Intake", queues[0]?.id],
    ["Crisis", queues[1]?.id],
    ["Housing", queues[2]?.id],
  ].filter((pair): pair is [string, string] => pair[1] !== undefined);

  for (const [name, id] of queuePairs) {
    await tDb
      .updateTable("queues")
      .set({ encrypted_name: sealWithOrgKey(name, orgPk) })
      .where("id", "=", id)
      .execute();
  }

  const categories = await tDb
    .selectFrom("kb_categories")
    .select(["id", "sort_order"])
    .orderBy("sort_order", "asc")
    .execute();

  const catPairs: [string, string][] = [
    ["Procedures", categories[0]?.id],
    ["Resources", categories[1]?.id],
    ["Safety", categories[2]?.id],
  ].filter((pair): pair is [string, string] => pair[1] !== undefined);

  for (const [name, id] of catPairs) {
    await tDb
      .updateTable("kb_categories")
      .set({ encrypted_name: sealWithOrgKey(name, orgPk) })
      .where("id", "=", id)
      .execute();
  }

  const noteTypes = await tDb
    .selectFrom("note_types")
    .select("id")
    .orderBy("id", "asc")
    .execute();

  const noteTypeDefs = [
    {
      name: "Comment",
      icon: "message-square-dashed",
      desc: "General notes and observations about this ticket.",
    },
    {
      name: "Resolution",
      icon: "clipboard-check",
      desc: "Documents how the ticket was resolved. Prompted on close.",
    },
    {
      name: "Safety Concern",
      icon: "life-buoy",
      desc: "Use when someone's wellbeing may be at risk.",
    },
    {
      name: "Request",
      icon: "heart-handshake",
      desc: "Requests additional resources or assistance for this ticket.",
    },
  ] as const;

  for (let i = 0; i < noteTypes.length && i < noteTypeDefs.length; i++) {
    // eslint-disable-next-line security/detect-object-injection -- bounded by both array lengths
    const def = noteTypeDefs[i];
    // eslint-disable-next-line security/detect-object-injection -- bounded by both array lengths
    const noteType = noteTypes[i];
    if (def === undefined || noteType === undefined) break;
    await tDb
      .updateTable("note_types")
      .set({
        encrypted_name: sealWithOrgKey(def.name, orgPk),
        encrypted_icon: sealWithOrgKey(def.icon, orgPk),
        encrypted_description: sealWithOrgKey(def.desc, orgPk),
      })
      .where("id", "=", noteType.id)
      .execute();
  }
}

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

    // Re-encrypt queue and KB category names with the new org public key.
    // The server seed encrypts these with a throwaway key that gets replaced
    // above, so they need re-sealing to be decryptable by the client.
    await resealOrgEncryptedNames(tDb, publicKey);

    return { success: true, skipped: false };
  } finally {
    secretKey.fill(0);
  }
}
