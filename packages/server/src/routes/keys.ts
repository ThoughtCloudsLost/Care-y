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
} from "@care-y/shared";
import { encode } from "@care-y/crypto";
import { router, authedProcedure } from "../trpc/trpc.js";
import { createKeyRotationService } from "../crypto/key-rotation.js";

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createKeysRouter() {
  return router({
    /**
     * First-time crypto key setup (account creation).
     * Inserts user_keys row with salt + volPublic. Rejects if row
     * already exists (prevents salt replacement after initial setup).
     * Per crypto-architecture-v2.md Section 7 steps 9-10.
     */
    initCryptoKeys: authedProcedure
      .input(initCryptoKeysSchema)
      .mutation(async ({ ctx, input }) => {
        const keyRotation = createKeyRotationService(ctx.org.tenantDb);
        const salt = Buffer.from(input.salt, "base64");
        const volPublic = Buffer.from(input.volPublic, "base64");
        await keyRotation.initCryptoKeys(ctx.session.userId, salt, volPublic);
        return { success: true as const };
      }),

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
  });
}
