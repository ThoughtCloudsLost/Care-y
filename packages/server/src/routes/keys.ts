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
  resealRowsSchema,
  reindexRowsSchema,
  resealPendingSchema,
  reindexPendingSchema,
  resealBlobPendingSchema,
  resealBlobRowSchema,
  listFormAssetsForResealSchema,
  getFormAssetBlobSchema,
  replaceFormAssetBlobSchema,
  Permission,
} from "@care-y/shared";
import { encode } from "@care-y/crypto";
import { getEnv } from "../env.js";
import {
  router,
  authedProcedure,
  keyCustodyProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";
import { hasPermissionForOrg } from "../auth/roles.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import type { BlobStore } from "../storage/store.js";

function b64(s: string): Buffer {
  return Buffer.from(s, "base64");
}
import { createKeyRotationService } from "../crypto/key-rotation.js";
import { createOrgKeyRotationService } from "../crypto/org-key-rotation.js";
import { createOrgKeyQueryService } from "../crypto/org-key-query-service.js";
import { createOrgResealService } from "../crypto/org-reseal-service.js";
import { createAuditService } from "../tickets/audit.js";

export interface KeysRouterDeps {
  readonly fieldEncryptor: FieldEncryptor | null;
  readonly blobStore?: BlobStore | null;
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createKeysRouter(deps?: KeysRouterDeps) {
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
        currentGeneration: wrap.currentGeneration,
        generations: wrap.generations.map((g) => ({
          generation: g.generation,
          publicKey: encode(g.publicKey),
          prevSecretCt: g.prevSecretCt ? encode(g.prevSecretCt) : null,
          prevNonce: g.prevNonce ? encode(g.prevNonce) : null,
        })),
      };
    }),

    /**
     * First-time org keypair upload (admin onboarding).
     * Stores the Curve25519 public key in org_config and the ECIES-wrapped
     * secret key in wrapped_org_keys for the calling admin. Rejects if the
     * org already has a public key (use key rotation to replace).
     */
    uploadOrgPublicKey: keyCustodyProcedure
      .input(uploadOrgPublicKeySchema)
      .mutation(
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
    rotateOrgKey: keyCustodyProcedure.input(rotateOrgKeySchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = createOrgKeyRotationService(ctx.org.tenantDb);
        await svc.rotateOrgKey({
          newOrgPublicKey: b64(input.newOrgPublicKey),
          newGeneration: input.newGeneration,
          chainedFrom:
            input.chainedFrom === null
              ? null
              : {
                  prevSecretCt: b64(input.chainedFrom.prevSecretCt),
                  prevNonce: b64(input.chainedFrom.prevNonce),
                },
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
    wrapOrgKeyForUser: keyCustodyProcedure
      .input(wrapOrgKeyForUserSchema)
      .mutation(
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
    listUnwrappedUsers: keyCustodyProcedure.query(async ({ ctx }) => {
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
    adminBootstrapUserKeys: keyCustodyProcedure
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

    /** Counts of rows per org-sealed table still at an old key generation. */
    resealStatus: keyCustodyProcedure.query(async ({ ctx }) => {
      const svc = createOrgResealService(ctx.org.tenantDb);
      return svc.resealStatus();
    }),

    /** Accept a batch of re-encrypted rows for one table and bump their generation stamps. */
    resealRows: keyCustodyProcedure.input(resealRowsSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = createOrgResealService(ctx.org.tenantDb);
        const result = await svc.resealRows({
          table: input.table,
          rows: input.rows.map((r) => ({
            id: r.id,
            columns: Object.fromEntries(
              Object.entries(r.columns).map(([col, v]) => [col, b64(v)]),
            ),
          })),
          skippedIds: input.skippedIds,
        });
        const audit = createAuditService(ctx.org.tenantDb);
        await audit.log({
          eventType: "org_key_reseal",
          actorId: ctx.session.userId,
          metadata: {
            table: input.table,
            resealed: result.resealed,
            skipped: result.skipped,
          },
        });
        return result;
      }),
    ),

    /** Accept a batch of re-derived blind-index hashes for one table and bump their index generation stamps. */
    reindexRows: keyCustodyProcedure.input(reindexRowsSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = createOrgResealService(ctx.org.tenantDb);
        const result = await svc.reindexRows({
          table: input.table,
          rows: input.rows,
          skippedIds: input.skippedIds,
        });
        const audit = createAuditService(ctx.org.tenantDb);
        await audit.log({
          eventType: "org_key_reindex",
          actorId: ctx.session.userId,
          metadata: {
            table: input.table,
            reindexed: result.reindexed,
            skipped: result.skipped,
          },
        });
        return result;
      }),
    ),

    /** Fetch old-stamped rows that need org-key resealing. Read-only, no audit log. */
    resealPending: keyCustodyProcedure.input(resealPendingSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = createOrgResealService(ctx.org.tenantDb);
        const result = await svc.resealPending({
          table: input.table,
          limit: input.limit,
          excludeIds: input.excludeIds,
          onlyIds: input.onlyIds,
        });
        return {
          currentGeneration: result.currentGeneration,
          rows: result.rows.map((r) => ({
            id: r.id,
            columns: Object.fromEntries(
              Object.entries(r.columns).map(([col, buf]) => [
                col,
                buf.toString("base64url"),
              ]),
            ),
          })),
        };
      }),
    ),

    /** Fetch old-stamped rows that need blind-index re-derivation. Read-only, no audit log. */
    reindexPending: keyCustodyProcedure.input(reindexPendingSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const piiUnmasked = await hasPermissionForOrg(
          ctx.org.tenantDb,
          ctx.org.orgSchema,
          ctx.user.roleId,
          Permission.VIEW_CLIENT_PII,
        );
        const svc = createOrgResealService(
          ctx.org.tenantDb,
          deps?.fieldEncryptor,
        );
        const result = await svc.reindexPending({
          table: input.table,
          limit: input.limit,
          excludeIds: input.excludeIds,
          piiUnmasked,
          onlyIds: input.onlyIds,
        });
        return {
          currentGeneration: result.currentGeneration,
          piiUnmasked,
          rows: result.rows.map((r) => {
            if ("encryptedAlias" in r) {
              return {
                id: r.id,
                encryptedAlias: r.encryptedAlias
                  ? r.encryptedAlias.toString("base64url")
                  : null,
              };
            }
            return { id: r.id, plaintext: r.plaintext };
          }),
        };
      }),
    ),

    /** Fetch old-stamped blob-carrying rows that need resealing. Returns blob bytes per row. */
    resealBlobPending: keyCustodyProcedure.input(resealBlobPendingSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = createOrgResealService(
          ctx.org.tenantDb,
          deps?.fieldEncryptor,
          deps?.blobStore,
        );
        const result = await svc.resealBlobPending({
          table: input.table,
          limit: input.limit,
          excludeIds: input.excludeIds,
        });
        return {
          currentGeneration: result.currentGeneration,
          rows: result.rows.map((r) => ({
            id: r.id,
            columns: Object.fromEntries(
              Object.entries(r.columns).map(([col, buf]) => [
                col,
                buf.toString("base64url"),
              ]),
            ),
            blob: r.blob.toString("base64url"),
          })),
        };
      }),
    ),

    /** Accept a re-encrypted blob-carrying row (columns + blob) and bump its generation stamp. */
    resealBlobRow: keyCustodyProcedure.input(resealBlobRowSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = createOrgResealService(
          ctx.org.tenantDb,
          deps?.fieldEncryptor,
          deps?.blobStore,
        );
        await svc.resealBlobRow({
          table: input.table,
          id: String(input.id),
          columns: Object.fromEntries(
            Object.entries(input.columns).map(([col, v]) => [col, b64(v)]),
          ),
          blob: b64(input.blob),
        });
        const audit = createAuditService(ctx.org.tenantDb);
        await audit.log({
          eventType: "org_key_reseal",
          actorId: ctx.session.userId,
          metadata: {
            table: input.table,
            resealed: 1,
          },
        });
        return { success: true as const };
      }),
    ),

    /** List all form assets for branding-key re-encryption. */
    listFormAssetsForReseal: keyCustodyProcedure
      .input(listFormAssetsForResealSchema)
      .query(
        withErrorWrapping(async ({ ctx }) => {
          const svc = createOrgResealService(
            ctx.org.tenantDb,
            deps?.fieldEncryptor,
            deps?.blobStore,
          );
          return svc.listFormAssetsForReseal();
        }),
      ),

    /** Fetch the raw encrypted blob bytes for a form asset. */
    getFormAssetBlob: keyCustodyProcedure.input(getFormAssetBlobSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = createOrgResealService(
          ctx.org.tenantDb,
          deps?.fieldEncryptor,
          deps?.blobStore,
        );
        const blob = await svc.getFormAssetBlob(input.blobId);
        return { blob: blob.toString("base64url") };
      }),
    ),

    /** Overwrite a form asset blob in-place for branding-key re-encryption. */
    replaceFormAssetBlob: keyCustodyProcedure
      .input(replaceFormAssetBlobSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = createOrgResealService(
            ctx.org.tenantDb,
            deps?.fieldEncryptor,
            deps?.blobStore,
          );
          await svc.replaceFormAssetBlob(input.blobId, b64(input.blob));
          const audit = createAuditService(ctx.org.tenantDb);
          await audit.log({
            eventType: "org_key_reseal",
            actorId: ctx.session.userId,
            metadata: { table: "form_assets" },
          });
          return { success: true as const };
        }),
      ),

    ...(getEnv().NODE_ENV === "development"
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
