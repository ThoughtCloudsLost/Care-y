/**
 * Keys router: volunteer key management endpoints.
 *
 * Handles volPublic upload (account creation), password change key
 * rotation (acquireLock + applyRotation), and rotation status checks.
 * Services are created per-request from the tenant DB since key
 * management is org-scoped.
 */

import {
  initCryptoKeysSchema,
  uploadVolPublicSchema,
  passwordChangeKeysSchema,
  uploadOrgPublicKeySchema,
  rotateOrgKeySchema,
} from "@care-y/shared";
import { encode } from "@care-y/crypto";
import {
  router,
  authedProcedure,
  adminProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";
import { createKeyRotationService } from "../crypto/key-rotation.js";
import { createOrgKeyRotationService } from "../crypto/org-key-rotation.js";
import { ConflictError } from "../errors.js";

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createKeysRouter() {
  return router({
    /**
     * First-time crypto key setup (account creation).
     * Inserts user_keys row with salt + volPublic. Rejects if row
     * already exists (prevents salt replacement after initial setup).
     * Per crypto-architecture-v2.md Section 7 steps 9-10.
     */
    initCryptoKeys: authedProcedure.input(initCryptoKeysSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const keyRotation = createKeyRotationService(ctx.org.tenantDb);
        const salt = Buffer.from(input.salt, "base64");
        const volPublic = Buffer.from(input.volPublic, "base64");
        await keyRotation.initCryptoKeys(ctx.session.userId, salt, volPublic);
        return { success: true as const };
      }),
    ),

    /** Update volPublic on existing user_keys row (e.g. after password change). */
    uploadVolPublic: authedProcedure
      .input(uploadVolPublicSchema)
      .mutation(async ({ ctx, input }) => {
        const keyRotation = createKeyRotationService(ctx.org.tenantDb);
        const volPublic = Buffer.from(input.volPublic, "base64");
        await keyRotation.storeVolPublic(ctx.session.userId, volPublic);
        return { success: true as const };
      }),

    /** Password change: receive new salt, volPublic, and re-wrapped ticket keys. */
    rotateKeys: authedProcedure
      .input(passwordChangeKeysSchema)
      .mutation(async ({ ctx, input }) => {
        const keyRotation = createKeyRotationService(ctx.org.tenantDb);
        const userId = ctx.session.userId;
        await keyRotation.acquireLock(userId);
        let rotationSucceeded = false;
        try {
          await keyRotation.applyRotation({
            userId,
            saltNew: Buffer.from(input.saltNew, "base64"),
            volPublicNew: Buffer.from(input.volPublicNew, "base64"),
            reWrappedKeys: input.reWrappedKeys.map((k) => ({
              ticketId: k.ticketId,
              keyGeneration: k.keyGeneration,
              ephemeralPoint: Buffer.from(k.ephemeralPoint, "base64"),
              nonce: Buffer.from(k.nonce, "base64"),
              wrappedKey: Buffer.from(k.wrappedKey, "base64"),
            })),
          });
          rotationSucceeded = true;
        } finally {
          // applyRotation clears the lock on success (inside its transaction).
          // On failure, release the lock so the volunteer isn't permanently
          // locked out of new ticket wraps.
          if (!rotationSucceeded) {
            await keyRotation.releaseLock(userId).catch(() => {
              // Log but don't mask the original error. Admin can clear manually.
            });
          }
        }
        return { success: true as const };
      }),

    /** Check if rotation is in progress for the current user. */
    rotationStatus: authedProcedure.query(async ({ ctx }) => {
      const keyRotation = createKeyRotationService(ctx.org.tenantDb);
      return keyRotation.getRotationStatus(ctx.session.userId);
    }),

    /** Return the calling volunteer's ECIES-wrapped copy of the org secret key. */
    getWrappedOrgKey: authedProcedure.query(async ({ ctx }) => {
      const wrap = await ctx.org.tenantDb
        .selectFrom("wrapped_org_keys")
        .selectAll()
        .where("user_id", "=", ctx.session.userId)
        .executeTakeFirst();

      if (!wrap) return null; // org keypair not generated yet, or user not wrapped

      return {
        ephemeralPoint: encode(wrap.ephemeral_point),
        wrappedKey: encode(wrap.wrapped_key),
        nonce: encode(wrap.nonce),
      };
    }),

    /**
     * First-time org keypair upload (admin onboarding).
     * Stores the Curve25519 public key in org_config and the ECIES-wrapped
     * secret key in wrapped_org_keys for the calling admin. Rejects if the
     * org already has a public key (use key rotation to replace).
     */
    uploadOrgPublicKey: adminProcedure.input(uploadOrgPublicKeySchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const tDb = ctx.org.tenantDb;

        const existing = await tDb
          .selectFrom("org_config")
          .select("org_public_key")
          .executeTakeFirst();

        if (existing?.org_public_key) {
          throw new ConflictError(
            "Org keypair already configured. Use key rotation to replace.",
          );
        }

        const orgPublicKey = Buffer.from(input.orgPublicKey, "base64");
        const ephemeralPoint = Buffer.from(input.ephemeralPoint, "base64");
        const nonce = Buffer.from(input.nonce, "base64");
        const wrappedKey = Buffer.from(input.wrappedKey, "base64");

        await tDb.transaction().execute(async (tx) => {
          await tx
            .updateTable("org_config")
            .set({ org_public_key: orgPublicKey })
            .execute();

          await tx
            .insertInto("wrapped_org_keys")
            .values({
              user_id: ctx.session.userId,
              ephemeral_point: ephemeralPoint,
              nonce,
              wrapped_key: wrappedKey,
            })
            .execute();
        });

        return { success: true as const };
      }),
    ),

    /**
     * Org key rotation (admin-only).
     * Atomically replaces org_public_key and all wrapped_org_keys entries.
     * The admin's browser generates a fresh Curve25519 keypair, re-wraps
     * the new secret for each active volunteer, and sends everything here.
     */
    rotateOrgKey: adminProcedure.input(rotateOrgKeySchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = createOrgKeyRotationService(ctx.org.tenantDb);
        await svc.rotateOrgKey({
          newOrgPublicKey: Buffer.from(input.newOrgPublicKey, "base64"),
          wrappedKeys: input.wrappedKeys.map((w) => ({
            userId: w.userId,
            ephemeralPoint: Buffer.from(w.ephemeralPoint, "base64"),
            wrappedKey: Buffer.from(w.wrappedKey, "base64"),
            nonce: Buffer.from(w.nonce, "base64"),
          })),
        });
        return { success: true as const };
      }),
    ),
  });
}
