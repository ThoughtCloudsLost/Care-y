/**
 * Client management tRPC router.
 *
 * Role requirements per procedure.
 * The list, get, suggestDuplicates, mergeScanData, getDismissals, and
 * putDismissals queries run on viewClientsProcedure (VIEW_CLIENTS,
 * manager and above). updateAlias and backfillAliasHash run on
 * adminProcedure. updatePhone runs on volunteerProcedure with a custom
 * access check. backfillPhoneMatchHash runs on viewClientsProcedure.
 *
 * Client aliases are org-key encrypted. The server stores ciphertext and a
 * browser-supplied blind index hash. Phone values returned to the client
 * are always server-formatted strings, never Buffers. OPS_SECRETS_KEY is
 * server-only. Admin gets the full formatted number, manager gets the
 * masked form (***1234). The server decrypts, formats, and zeros the
 * Buffer immediately.
 */

import {
  router,
  volunteerProcedure,
  adminProcedure,
  authed2faProcedure,
  requireRole,
  withErrorWrapping,
} from "../trpc/trpc.js";
import {
  Permission,
  RoleId,
  ErrorCode,
  clientListInputSchema,
  clientGetInputSchema,
  updateAliasInputSchema,
  backfillAliasHashInputSchema,
  updatePhoneInputSchema,
  backfillPhoneMatchHashInputSchema,
  suggestDuplicatesInputSchema,
  aliasHashSchema,
  phoneHashSchema,
  phoneMatchHashSchema,
} from "@care-y/shared";
import type { OrgId, ClientId, UserId } from "@care-y/shared";
import type { ClientService } from "../clients/client-service.js";
import type { DismissalService } from "../clients/dismissal-service.js";
import type { MergeScanService } from "../clients/merge-scan-service.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import { maskPhone, formatPhone } from "../utils/sql.js";
import { ForbiddenError } from "../errors.js";
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
  readonly fieldEncryptor: FieldEncryptor;
  /**
   * Returns true if the user is assigned to at least one ticket belonging
   * to the given client. Used for updatePhone volunteer access checks.
   */
  readonly isAssignedToClientTicket: (
    db: Kysely<TenantDatabase>,
    clientId: ClientId,
    userId: UserId,
  ) => Promise<boolean>;
  readonly createDismissalSvc?: (
    db: Kysely<TenantDatabase>,
  ) => DismissalService;
  readonly createMergeScanSvc?: (
    db: Kysely<TenantDatabase>,
  ) => MergeScanService;
}

// ---------------------------------------------------------------------------
// Phone formatting helpers
// ---------------------------------------------------------------------------

/**
 * Decrypts an OPS-encrypted phone Buffer and returns a formatted string
 * based on the caller's role. Admin sees the full formatted number;
 * manager sees masked (***1234). The plaintext Buffer is zeroed by
 * formatPhone/maskPhone in their finally blocks.
 */
function phoneForRole(
  encryptedNumber: Buffer | null,
  roleId: string,
  encryptor: FieldEncryptor,
): string | null {
  if (!encryptedNumber) return null;
  const buf = encryptor.decryptToBuffer(encryptedNumber);
  if (roleId === RoleId.ADMIN) {
    return formatPhone(buf);
  }
  return maskPhone(buf);
}

// ---------------------------------------------------------------------------
// Procedure: VIEW_CLIENTS (manager+)
// ---------------------------------------------------------------------------

const viewClientsProcedure = authed2faProcedure.use(
  requireRole(Permission.VIEW_CLIENTS),
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

        return records.map((r) => ({
          id: r.id,
          encryptedAlias: r.encryptedAlias.toString("base64url"),
          aliasHash: r.aliasHash,
          phone: phoneForRole(
            r.encryptedNumber,
            ctx.user.roleId,
            deps.fieldEncryptor,
          ),
          phoneMatchHash: r.phoneMatchHash,
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

        return {
          id: record.id,
          encryptedAlias: record.encryptedAlias.toString("base64url"),
          aliasHash: record.aliasHash,
          phone: phoneForRole(
            record.encryptedNumber,
            ctx.user.roleId,
            deps.fieldEncryptor,
          ),
          phoneHash: record.phoneHash,
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
    updateAlias: adminProcedure.input(updateAliasInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createClientSvc(ctx.org.tenantDb, ctx.org.orgId);
        await svc.updateAlias(
          input.clientId,
          input.encryptedAlias,
          aliasHashSchema.parse(input.aliasHash),
          ctx.user.id,
        );
      }),
    ),

    /**
     * Lazy backfill of alias_hash for webhook-created rows.
     * Idempotent: writes only when the row's hash is currently NULL.
     * Surfaces conflict rather than swallowing it.
     */
    backfillAliasHash: volunteerProcedure
      .input(backfillAliasHashInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createClientSvc(ctx.org.tenantDb, ctx.org.orgId);
          await svc.backfillAliasHash(
            input.clientId,
            aliasHashSchema.parse(input.aliasHash),
          );
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
            phoneMatchHashSchema.parse(input.phoneMatchHash),
          );
        }),
      ),

    /**
     * Phone number update.
     *
     * Uses volunteerProcedure (lowest role) with a custom in-handler
     * access check. The caller must be admin, manager, or assigned to at
     * least one ticket belonging to the target client.
     */
    updatePhone: volunteerProcedure.input(updatePhoneInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        // Custom access check: admin and manager pass unconditionally.
        // Volunteers must be assigned to at least one ticket for this client.
        const roleId = ctx.user.roleId;
        if (roleId !== RoleId.ADMIN && roleId !== RoleId.MANAGER) {
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
        if (!deps.createDismissalSvc) return null;
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
          if (!deps.createDismissalSvc) return;
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
     */
    mergeScanData: viewClientsProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        if (!deps.createMergeScanSvc) {
          return {
            clients: [] as readonly {
              clientId: string;
              responses: readonly {
                ticketId: string;
                formId: string;
                encryptedResponse: string;
              }[];
            }[],
            fieldRoles: [] as readonly {
              formId: string;
              fieldId: string;
              role: string;
            }[],
            phoneHashes: [] as readonly {
              clientId: string;
              phoneMatchHash: string;
            }[],
          };
        }
        const svc = deps.createMergeScanSvc(ctx.org.tenantDb);
        const [clients, fieldRoles, phoneHashes] = await Promise.all([
          svc.getResponsesByClient(ctx.user.id),
          svc.getFieldRoles(),
          svc.getPhoneHashes(),
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
            fieldId: fr.fieldId,
            role: fr.role,
          })),
          phoneHashes: phoneHashes.map((ph) => ({
            clientId: ph.clientId,
            phoneMatchHash: ph.phoneMatchHash,
          })),
        };
      }),
    ),
  });
}
