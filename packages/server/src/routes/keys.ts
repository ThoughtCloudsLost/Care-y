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
  wrapOrgKeyForUserSchema,
  adminBootstrapUserKeysSchema,
} from "@care-y/shared";
import { encode } from "@care-y/crypto";
import {
  router,
  authedProcedure,
  adminProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";

function b64(s: string): Buffer {
  return Buffer.from(s, "base64");
}
import { createKeyRotationService } from "../crypto/key-rotation.js";
import { createOrgKeyRotationService } from "../crypto/org-key-rotation.js";
import { createOrgKeyQueryService } from "../crypto/org-key-query-service.js";

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
        const salt = b64(input.salt);
        const volPublic = b64(input.volPublic);
        await keyRotation.initCryptoKeys(ctx.session.userId, salt, volPublic);
        return { success: true as const };
      }),
    ),

    /** Update volPublic on existing user_keys row (e.g. after password change). */
    uploadVolPublic: authedProcedure
      .input(uploadVolPublicSchema)
      .mutation(async ({ ctx, input }) => {
        const keyRotation = createKeyRotationService(ctx.org.tenantDb);
        const volPublic = b64(input.volPublic);
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
            saltNew: b64(input.saltNew),
            volPublicNew: b64(input.volPublicNew),
            reWrappedKeys: input.reWrappedKeys.map((k) => ({
              ticketId: k.ticketId,
              keyGeneration: k.keyGeneration,
              ephemeralPoint: b64(k.ephemeralPoint),
              nonce: b64(k.nonce),
              wrappedKey: b64(k.wrappedKey),
            })),
            reWrappedOrgKey: input.reWrappedOrgKey
              ? {
                  ephemeralPoint: b64(input.reWrappedOrgKey.ephemeralPoint),
                  nonce: b64(input.reWrappedOrgKey.nonce),
                  wrappedKey: b64(input.reWrappedOrgKey.wrappedKey),
                }
              : undefined,
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
      const svc = createOrgKeyQueryService(ctx.org.tenantDb);
      const wrap = await svc.getWrappedOrgKey(ctx.session.userId);
      if (!wrap) return null;
      return {
        ephemeralPoint: encode(wrap.ephemeralPoint),
        wrappedKey: encode(wrap.wrappedKey),
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
        const svc = createOrgKeyQueryService(ctx.org.tenantDb);
        await svc.uploadOrgPublicKey({
          orgPublicKey: b64(input.orgPublicKey),
          ephemeralPoint: b64(input.ephemeralPoint),
          nonce: b64(input.nonce),
          wrappedKey: b64(input.wrappedKey),
          userId: ctx.session.userId,
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
          newOrgPublicKey: b64(input.newOrgPublicKey),
          wrappedKeys: input.wrappedKeys.map((w) => ({
            userId: w.userId,
            ephemeralPoint: b64(w.ephemeralPoint),
            wrappedKey: b64(w.wrappedKey),
            nonce: b64(w.nonce),
          })),
        });
        return { success: true as const };
      }),
    ),

    /**
     * Wrap the org secret key for a specific user (admin auto-wrap).
     * Uses INSERT ON CONFLICT DO NOTHING for idempotency.
     */
    wrapOrgKeyForUser: adminProcedure.input(wrapOrgKeyForUserSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = createOrgKeyQueryService(ctx.org.tenantDb);
        await svc.wrapOrgKeyForUser({
          userId: input.userId,
          ephemeralPoint: b64(input.ephemeralPoint),
          nonce: b64(input.nonce),
          wrappedKey: b64(input.wrappedKey),
        });
        return { success: true as const };
      }),
    ),

    /**
     * List active users who have a volPublic but no wrapped org key.
     * Admin auto-wrap queries this to find volunteers needing wrapping.
     */
    listUnwrappedUsers: adminProcedure.query(async ({ ctx }) => {
      const svc = createOrgKeyQueryService(ctx.org.tenantDb);
      const users = await svc.listUnwrappedUsers();
      return users.map((u) => ({
        userId: u.userId,
        volPublic: encode(u.volPublic),
      }));
    }),

    /**
     * Admin crypto bootstrap: initialize user_keys AND wrap the org key
     * for a manually created user in a single operation. The admin's
     * browser derives the new user's keys (it knows the password) and
     * wraps the org key using the new user's volPublic.
     */
    adminBootstrapUserKeys: adminProcedure
      .input(adminBootstrapUserKeysSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const keyRotation = createKeyRotationService(ctx.org.tenantDb);
          const orgKeyQuery = createOrgKeyQueryService(ctx.org.tenantDb);

          await keyRotation.initCryptoKeys(
            input.userId,
            b64(input.salt),
            b64(input.volPublic),
          );

          await orgKeyQuery.wrapOrgKeyForUser({
            userId: input.userId,
            ephemeralPoint: b64(input.wrappedOrgKey.ephemeralPoint),
            nonce: b64(input.wrappedOrgKey.nonce),
            wrappedKey: b64(input.wrappedOrgKey.wrappedKey),
          });

          return { success: true as const };
        }),
      ),

    ...(process.env.NODE_ENV === "development"
      ? {
          devSeedOrgKey: authedProcedure.mutation(
            withErrorWrapping(async ({ ctx }) => {
              const { seedOrgKey } = await import("../dev/seed-org-key.js");
              return seedOrgKey(ctx.org.tenantDb, ctx.session.userId);
            }),
          ),
        }
      : {}),
  });
}
