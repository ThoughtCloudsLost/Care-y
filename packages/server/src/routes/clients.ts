/**
 * Client management tRPC router.
 *
 * Role requirements per procedure.
 * The list, get, and suggestDuplicates queries run on viewClientsProcedure
 * (VIEW_CLIENTS, manager and above). updateAlias and backfillAliasHash run
 * on adminProcedure. updatePhone runs on volunteerProcedure with a custom
 * access check.
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
  suggestDuplicatesInputSchema,
} from "@care-y/shared";
import type { ClientService } from "../clients/client-service.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import { maskPhone, formatPhone } from "../utils/sql.js";
import { ForbiddenError } from "../errors.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

// ---------------------------------------------------------------------------
// Deps
// ---------------------------------------------------------------------------

export interface ClientRouterDeps {
  readonly createClientSvc: (
    db: Kysely<TenantDatabase>,
    orgId: string,
  ) => ClientService;
  readonly fieldEncryptor: FieldEncryptor;
  /**
   * Returns true if the user is assigned to at least one ticket belonging
   * to the given client. Used for updatePhone volunteer access checks.
   */
  readonly isAssignedToClientTicket: (
    db: Kysely<TenantDatabase>,
    clientId: string,
    userId: string,
  ) => Promise<boolean>;
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
  encryptedNumber: Buffer,
  roleId: string,
  encryptor: FieldEncryptor,
): string {
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
     */
    list: viewClientsProcedure.input(clientListInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createClientSvc(ctx.org.tenantDb, ctx.org.orgId);
        const records = await svc.list(input);

        return records.map((r) => ({
          id: r.id,
          encryptedAlias: r.encryptedAlias.toString("base64"),
          aliasHash: r.aliasHash,
          phone: phoneForRole(
            r.encryptedNumber,
            ctx.user.roleId,
            deps.fieldEncryptor,
          ),
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
          encryptedAlias: record.encryptedAlias.toString("base64"),
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
            encryptedTitle: t.encryptedTitle.toString("base64"),
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
            snapshot: e.snapshot.toString("base64"),
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
    backfillAliasHash: volunteerProcedure
      .input(backfillAliasHashInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createClientSvc(ctx.org.tenantDb, ctx.org.orgId);
          await svc.backfillAliasHash(input.clientId, input.aliasHash);
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
            input.phoneHash,
            input.excludeClientId,
          );
          if (!result) return null;
          return {
            conflictingClientId: result.conflictingClientId,
            conflictingClientEncryptedAlias:
              result.conflictingClientEncryptedAlias.toString("base64"),
          };
        }),
      ),
  });
}
