/**
 * Client management tRPC router.
 *
 * Reading client records needs VIEW_CLIENTS. Renaming one needs
 * EDIT_CLIENT_ALIAS. Changing a phone number or email needs either
 * EDIT_CLIENT_CONTACT or an existing case with that client, checked in
 * the handler.
 *
 * Client aliases are org-key encrypted. The server stores ciphertext and a
 * browser-supplied blind index hash. Phone values returned to the client
 * are always server-formatted strings, never Buffers. OPS_SECRETS_KEY is
 * server-only. Holders of VIEW_CLIENT_PII get the full formatted number,
 * everyone else gets the masked form (***1234). The server decrypts,
 * formats, and zeros the Buffer immediately.
 */

import {
  router,
  viewCasesProcedure,
  authed2faProcedure,
  requireRole,
  withErrorWrapping,
} from "../trpc/trpc.js";
import { hasPermissionForOrg } from "../auth/roles.js";
import {
  Permission,
  ErrorCode,
  clientListInputSchema,
  clientGetInputSchema,
  updateAliasInputSchema,
  backfillAliasHashInputSchema,
  updatePhoneInputSchema,
  updateEmailInputSchema,
  backfillPhoneMatchHashInputSchema,
  suggestDuplicatesInputSchema,
  getPhoneSharedLineInputSchema,
  setPhoneSharedLineInputSchema,
  phoneHashSchema,
} from "@care-y/shared";
import type { OrgId, ClientId, UserId } from "@care-y/shared";
import type { ClientService } from "../clients/client-service.js";
import type { EmailService } from "../clients/email-service.js";
import type { DismissalService } from "../clients/dismissal-service.js";
import type { MergeScanService } from "../clients/merge-scan-service.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import { phoneForViewer, emailForViewer } from "../utils/sql.js";
import { ForbiddenError, InternalError } from "../errors.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Deps
// ---------------------------------------------------------------------------

export interface ClientRouterDeps {
  readonly createClientSvc: (
    db: Kysely<TenantDatabase>,
    orgId: OrgId,
  ) => ClientService;
  readonly createEmailSvc: (
    db: Kysely<TenantDatabase>,
    orgId: OrgId,
  ) => EmailService;
  readonly fieldEncryptor: FieldEncryptor;
  /**
   * Returns true if the user is assigned to at least one ticket belonging
   * to the given client. Used for updatePhone/updateEmail volunteer access
   * checks.
   */
  readonly isAssignedToClientTicket: (
    db: Kysely<TenantDatabase>,
    clientId: ClientId,
    userId: UserId,
  ) => Promise<boolean>;
  /**
   * Required nullable (ADR-086 pattern): pass `null` to decline
   * the merge-scan surface explicitly. When these were optional keys, the
   * app wiring omitted them by accident and mergeScanData silently served
   * its empty stub on every request; a required key makes omission a type
   * error.
   */
  readonly createDismissalSvc:
    ((db: Kysely<TenantDatabase>) => DismissalService) | null;
  readonly createMergeScanSvc:
    ((db: Kysely<TenantDatabase>) => MergeScanService) | null;
}

// ---------------------------------------------------------------------------
// Procedures
// ---------------------------------------------------------------------------

/** Reading client records, with contact details masked unless VIEW_CLIENT_PII. */
const viewClientsProcedure = authed2faProcedure.use(
  requireRole(Permission.VIEW_CLIENTS),
);

/** Changing the name a client is listed under. */
const editClientAliasProcedure = authed2faProcedure.use(
  requireRole(Permission.EDIT_CLIENT_ALIAS),
);

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createClientRouter(deps: ClientRouterDeps) {
  return router({
    /**
     * Paginated client list with search and sort.
     * Phone numbers are role-masked strings. Aliases are base64 sealed
     * ciphertext, decrypted by the browser through the org decrypt cache.
     * phoneMatchHash is the browser-computed blind index (or null for
     * rows that have not been backfilled).
     */
    list: viewClientsProcedure.input(clientListInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createClientSvc(ctx.org.tenantDb, ctx.org.orgId);
        const records = await svc.list(input);
        // Resolved once for the page, not once per row.
        const unmasked = await hasPermissionForOrg(
          ctx.org.tenantDb,
          ctx.org.orgSchema,
          ctx.user.roleId,
          Permission.VIEW_CLIENT_PII,
        );

        return records.map((r) => ({
          id: r.id,
          encryptedAlias: r.encryptedAlias.toString("base64url"),
          aliasHash: r.aliasHash,
          phone: phoneForViewer(
            r.encryptedNumber,
            unmasked,
            deps.fieldEncryptor,
          ),
          phoneMatchHash: r.phoneMatchHash,
          email: emailForViewer(
            r.encryptedAddress,
            unmasked,
            deps.fieldEncryptor,
          ),
          emailMatchHash: r.emailMatchHash,
          ticketCount: r.ticketCount,
          createdAt: r.createdAt.toISOString(),
          mergedInto: r.mergedInto,
        }));
      }),
    ),

    /**
     * Single client detail with tickets and merge history.
     * Phone number is role-masked. Alias is base64 sealed ciphertext.
     */
    get: viewClientsProcedure.input(clientGetInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createClientSvc(ctx.org.tenantDb, ctx.org.orgId);
        const record = await svc.getById(input.clientId);
        const unmasked = await hasPermissionForOrg(
          ctx.org.tenantDb,
          ctx.org.orgSchema,
          ctx.user.roleId,
          Permission.VIEW_CLIENT_PII,
        );

        return {
          id: record.id,
          encryptedAlias: record.encryptedAlias.toString("base64url"),
          aliasHash: record.aliasHash,
          phone: phoneForViewer(
            record.encryptedNumber,
            unmasked,
            deps.fieldEncryptor,
          ),
          phoneHash: record.phoneHash,
          email: emailForViewer(
            record.encryptedAddress,
            unmasked,
            deps.fieldEncryptor,
          ),
          emailHash: record.emailHash,
          ticketCount: record.ticketCount,
          createdAt: record.createdAt.toISOString(),
          tickets: record.tickets.map((t) => ({
            id: t.id,
            encryptedTitle: t.encryptedTitle.toString("base64url"),
            status: t.status,
            priority: t.priority,
            createdAt: t.createdAt.toISOString(),
            keyGeneration: t.keyGeneration,
            onHold: t.onHold,
            followUpCount: t.followUpCount,
          })),
          // The snapshot is org-key ciphertext the client produced at merge
          // time. It travels back out as base64 so undoMerge can round-trip it.
          mergeHistory: record.mergeHistory.map((e) => ({
            id: e.id,
            primaryClientId: e.primaryClientId,
            secondaryClientId: e.secondaryClientId,
            mergedAt: e.mergedAt.toISOString(),
            snapshot: e.snapshot.toString("base64url"),
            undoLocked: e.undoLocked,
            isUndone: e.isUndone,
          })),
        };
      }),
    ),

    /**
     * Admin-only alias editing.
     * Takes base64 ciphertext + blind index hash from the browser.
     * Throws CONFLICT on uniqueness violation.
     */
    updateAlias: editClientAliasProcedure
      .input(updateAliasInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createClientSvc(ctx.org.tenantDb, ctx.org.orgId);
          await svc.updateAlias(
            input.clientId,
            input.encryptedAlias,
            input.aliasHash,
            ctx.user.id,
          );
        }),
      ),

    /**
     * Lazy backfill of alias_hash for webhook-created rows.
     * Idempotent: writes only when the row's hash is currently NULL.
     * Surfaces conflict rather than swallowing it.
     */
    backfillAliasHash: authed2faProcedure
      .input(backfillAliasHashInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createClientSvc(ctx.org.tenantDb, ctx.org.orgId);
          await svc.backfillAliasHash(input.clientId, input.aliasHash);
        }),
      ),

    /**
     * Lazy backfill of phone_match_hash for server-created phone rows.
     * Idempotent: writes only when the phone row's hash is currently NULL.
     * Tolerates clients with null phone_id (web-intake, no phone row).
     */
    backfillPhoneMatchHash: viewClientsProcedure
      .input(backfillPhoneMatchHashInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createClientSvc(ctx.org.tenantDb, ctx.org.orgId);
          await svc.backfillPhoneMatchHash(
            input.clientId,
            input.phoneMatchHash,
          );
        }),
      ),

    /**
     * Phone number update.
     *
     * Runs on case access with a custom in-handler check. The caller needs
     * EDIT_CLIENT_CONTACT, or an existing case with the target client.
     */
    updatePhone: viewCasesProcedure.input(updatePhoneInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        // EDIT_CLIENT_CONTACT reaches any client. Without it, the caller
        // needs an existing case with this one.
        const anyClient = await hasPermissionForOrg(
          ctx.org.tenantDb,
          ctx.org.orgSchema,
          ctx.user.roleId,
          Permission.EDIT_CLIENT_CONTACT,
        );
        if (!anyClient) {
          const assigned = await deps.isAssignedToClientTicket(
            ctx.org.tenantDb,
            input.clientId,
            ctx.user.id,
          );
          if (!assigned) {
            throw new ForbiddenError(ErrorCode.INSUFFICIENT_PERMISSIONS);
          }
        }

        const svc = deps.createClientSvc(ctx.org.tenantDb, ctx.org.orgId);
        const result = await svc.updatePhone(
          input.clientId,
          input.phoneNumber,
          ctx.user.id,
          input.phoneMatchHash ?? null,
        );
        // The conflicting client's alias is ciphertext and leaves as base64,
        // matching suggestDuplicates. Returning the service result directly
        // would emit a Buffer here and a string there for the same field.
        return {
          success: result.success,
          conflict: result.conflict
            ? {
                conflictingClientId: result.conflict.conflictingClientId,
                conflictingClientEncryptedAlias:
                  result.conflict.conflictingClientEncryptedAlias.toString(
                    "base64",
                  ),
              }
            : null,
        };
      }),
    ),

    /**
     * Phone hash duplicate detection (manager+).
     * Returns the conflicting client or null.
     */
    suggestDuplicates: viewClientsProcedure
      .input(suggestDuplicatesInputSchema)
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createClientSvc(ctx.org.tenantDb, ctx.org.orgId);
          const result = await svc.suggestDuplicates(
            phoneHashSchema.parse(input.phoneHash),
            input.excludeClientId,
          );
          if (!result) return null;
          return {
            conflictingClientId: result.conflictingClientId,
            conflictingClientEncryptedAlias:
              result.conflictingClientEncryptedAlias.toString("base64url"),
          };
        }),
      ),

    /**
     * Get the encrypted merge candidate dismissals blob.
     * Returns null when no dismissals have been stored yet.
     * Gated on VIEW_CLIENTS so only sessions that can act on merge
     * candidates see them.
     */
    getDismissals: viewClientsProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        if (deps.createDismissalSvc === null) return null;
        const svc = deps.createDismissalSvc(ctx.org.tenantDb);
        const record = await svc.get();
        if (!record) return null;
        return {
          encryptedDismissals: record.encryptedDismissals,
          updatedAt: record.updatedAt.toISOString(),
        };
      }),
    ),

    /**
     * Upsert the encrypted merge candidate dismissals blob.
     * Ciphertext passthrough: the server never reads the content.
     * Last-write-wins concurrency (see dismissal-service.ts).
     * Gated on VIEW_CLIENTS to match getDismissals.
     */
    putDismissals: viewClientsProcedure
      .input(
        z.object({
          encryptedDismissals: z.string().min(1).max(1_000_000),
        }),
      )
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          if (deps.createDismissalSvc === null) return;
          const svc = deps.createDismissalSvc(ctx.org.tenantDb);
          const buf = Buffer.from(input.encryptedDismissals, "base64");
          await svc.put(buf);
        }),
      ),

    /**
     * Returns intake form response blobs + field role maps for merge
     * candidate detection, plus browser-computed phone blind index hashes
     * for cross-channel matching. Ciphertext only; decryption is
     * browser-side. Gated on VIEW_CLIENTS (merging itself requires that
     * access level, so candidates shown to sessions that cannot act are
     * dead UI).
     *
     * Division of labor with the inline conflict card: updateEmail and
     * updatePhone block a duplicate write and suggest a merge at entry
     * time, so volunteer-typed duplicates never reach this scan. The
     * dashboard section this feeds exists for duplicates nobody typed:
     * a client whose intake form answers carry the same phone or email
     * as a client created earlier (by call or by another intake), and
     * stored phone-hash collisions. Stored email hashes cannot collide
     * with each other (the updateEmail guard rejects them); the email
     * hash list is here to be matched against intake-extracted emails.
     */
    mergeScanData: viewClientsProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        if (deps.createMergeScanSvc === null) {
          throw new InternalError("Merge scan service is not configured");
        }
        const svc = deps.createMergeScanSvc(ctx.org.tenantDb);
        const [clients, fieldRoles, phoneHashes, emailHashes, sharedHashes] =
          await Promise.all([
            svc.getResponsesByClient(ctx.user.id),
            svc.getFieldRoles(),
            svc.getPhoneHashes(),
            svc.getEmailHashes(),
            svc.getSharedPhoneMatchHashes(),
          ]);

        return {
          clients: clients.map((c) => ({
            clientId: c.clientId,
            responses: c.responses.map((r) => ({
              ticketId: r.ticketId,
              formId: r.formId,
              encryptedResponse: r.encryptedResponse.toString("base64url"),
            })),
          })),
          fieldRoles: fieldRoles.map((fr) => ({
            formId: fr.formId,
            fieldKey: fr.fieldKey,
            role: fr.role,
          })),
          phoneHashes: phoneHashes.map((ph) => ({
            clientId: ph.clientId,
            phoneMatchHash: ph.phoneMatchHash,
          })),
          emailHashes: emailHashes.map((eh) => ({
            clientId: eh.clientId,
            emailMatchHash: eh.emailMatchHash,
          })),
          sharedPhoneHashes: sharedHashes.map((sh) => sh.phoneMatchHash),
        };
      }),
    ),

    /**
     * Returns the is_shared_line flag for a client's phone row,
     * or null when the client has no phone.
     */
    getPhoneSharedLine: viewClientsProcedure
      .input(getPhoneSharedLineInputSchema)
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          if (deps.createMergeScanSvc === null) {
            throw new InternalError("Merge scan service is not configured");
          }
          const svc = deps.createMergeScanSvc(ctx.org.tenantDb);
          const shared = await svc.getSharedLineByClientId(input.clientId);
          return { shared };
        }),
      ),

    /**
     * Marks or unmarks phone rows as shared lines.
     *
     * Two targeting modes: match-hash targeting flags every phones row
     * bearing the matched hash (used from the dashboard candidate row);
     * client-id targeting flags the client's own phone row (used from
     * the phone edit sheet).
     */
    setPhoneSharedLine: viewClientsProcedure
      .input(setPhoneSharedLineInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          if (deps.createMergeScanSvc === null) {
            throw new InternalError("Merge scan service is not configured");
          }
          const svc = deps.createMergeScanSvc(ctx.org.tenantDb);

          if ("matchHash" in input) {
            const n = await svc.setSharedLineByMatchHash(
              input.matchHash,
              input.shared,
            );
            return { updated: n };
          }

          const didUpdate = await svc.setSharedLineByClientId(
            input.clientId,
            input.shared,
          );
          return { updated: didUpdate ? 1 : 0 };
        }),
      ),

    /**
     * Email address update.
     *
     * Runs on case access with the same in-handler check as updatePhone:
     * EDIT_CLIENT_CONTACT, or an existing case with the target client.
     */
    updateEmail: viewCasesProcedure.input(updateEmailInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        // Mirrors updatePhone: EDIT_CLIENT_CONTACT reaches any client,
        // otherwise the caller needs an existing case with this one.
        const anyClient = await hasPermissionForOrg(
          ctx.org.tenantDb,
          ctx.org.orgSchema,
          ctx.user.roleId,
          Permission.EDIT_CLIENT_CONTACT,
        );
        if (!anyClient) {
          const assigned = await deps.isAssignedToClientTicket(
            ctx.org.tenantDb,
            input.clientId,
            ctx.user.id,
          );
          if (!assigned) {
            throw new ForbiddenError(ErrorCode.INSUFFICIENT_PERMISSIONS);
          }
        }

        const emailSvc = deps.createEmailSvc(ctx.org.tenantDb, ctx.org.orgId);
        const result = await emailSvc.updateEmail(
          input.clientId,
          input.emailAddress,
          ctx.user.id,
          input.emailMatchHash ?? null,
        );
        // The conflicting client's alias is ciphertext and leaves as base64,
        // matching suggestDuplicates. Never includes the email address.
        return {
          success: result.success,
          conflict: result.conflict
            ? {
                conflictingClientId: result.conflict.conflictingClientId,
                conflictingClientEncryptedAlias:
                  result.conflict.conflictingClientEncryptedAlias.toString(
                    "base64",
                  ),
              }
            : null,
        };
      }),
    ),
  });
}
