/**
 * Fund accounting tRPC router (ADR-109).
 *
 * Every payload and every balance is org-key ciphertext the server stores
 * and returns as base64url; the browser seals each new balance and the
 * server applies it by compare-and-set. Reading funds and their balances
 * takes VIEW_FUNDS, so an org can keep them to fewer people. The full
 * ledger takes AUDIT_FUNDS: it shows amounts, dates and who recorded each
 * entry across cases the reader may not have access to. Recording or
 * correcting a disbursement takes RECORD_DISBURSEMENTS; everything that
 * shapes the funds themselves takes MANAGE_FUNDS.
 */

import {
  DISBURSEMENT_NOTE_TYPE_KEY,
  Permission,
  createFundInputSchema,
  ensureDisbursementNoteTypeInputSchema,
  updateFundInputSchema,
  recordDisbursementInputSchema,
  recordAdjustmentInputSchema,
  reviseDisbursementInputSchema,
  setFundBalanceInputSchema,
  updateFundSettingsInputSchema,
  type FundBalanceInput,
} from "@care-y/shared";
import {
  router,
  permissionProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";
import type { OrgContext } from "../trpc/context.js";
import type { TicketAccessChecker } from "../tickets/access.js";
import type {
  FollowUpService,
  FollowUpServiceDeps,
} from "../tickets/followup-service.js";
import type { AuditService } from "../tickets/audit.js";
import type { NoteTypeService } from "../tickets/note-type-service.js";
import type { TicketLiveEvents } from "../tickets/ticket-live-events.js";
import type { NotificationService } from "../notifications/service.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import {
  createLifecycleNotifier,
  type LifecycleActor,
} from "../notifications/lifecycle-notifier.js";
import {
  createFundService,
  type FundBalanceWrite,
  type FundService,
} from "../funds/fund-service.js";
import { createOrgConfigService } from "../org/org-config-service.js";
import { hasPermissionForOrg } from "../auth/roles.js";
import { b64 } from "../utils/ciphertext-wire.js";

const viewFundsProcedure = permissionProcedure(Permission.VIEW_FUNDS);

const auditFundsProcedure = permissionProcedure(Permission.AUDIT_FUNDS);

const recordDisbursementsProcedure = permissionProcedure(
  Permission.RECORD_DISBURSEMENTS,
);

const manageFundsProcedure = permissionProcedure(Permission.MANAGE_FUNDS);

/**
 * Taken from the same sources as the tickets router, so the case note a
 * disbursement writes is created, audited and announced exactly as a note
 * written from the case itself.
 */
export interface FundsRouterDeps {
  readonly createTicketAccess: (
    tDb: OrgContext["tenantDb"],
  ) => TicketAccessChecker;
  readonly createFollowUpSvc: (
    tDb: OrgContext["tenantDb"],
    access: TicketAccessChecker,
    deps?: FollowUpServiceDeps,
  ) => FollowUpService;
  readonly createAuditSvc: (tDb: OrgContext["tenantDb"]) => AuditService;
  /** Note type service, for the system type disbursement notes carry. */
  readonly createNoteTypeSvc: (tDb: OrgContext["tenantDb"]) => NoteTypeService;
  readonly notificationService: NotificationService;
  /**
   * OPS-tier encryptor the lifecycle notifier uses for mentioned
   * pseudonyms, as in the tickets router. Disbursement notes carry none.
   */
  readonly fieldEncryptor?: FieldEncryptor;
  /** Live ticket-change events for the case a note lands on. */
  readonly liveEvents?: TicketLiveEvents;
}

export interface FundWire {
  readonly id: string;
  readonly encryptedPayload: string;
  readonly encryptedBalance: string;
  readonly balanceVersion: number;
  readonly isActive: boolean;
  readonly sortOrder: number;
  readonly orgKeyGeneration: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface FundLedgerEntryWire {
  readonly id: string;
  readonly encryptedPayload: string;
  readonly orgKeyGeneration: number;
  /** `YYYY-MM-DD`, the day the server stamped the entry. */
  readonly entryDate: string;
}

export interface RecordedEntryWire {
  readonly id: string;
  readonly entryDate: string;
  readonly balanceVersion: number;
}

export interface EnsuredNoteTypeWire {
  readonly id: string;
  /** True when this call created the type. */
  readonly created: boolean;
}

export interface RevisedDisbursementWire {
  readonly entryDate: string;
  readonly balanceVersion: number;
}

/** Wire balance write to the service's Buffer form. */
function toBalanceWrite(balance: FundBalanceInput): FundBalanceWrite {
  return {
    fundId: balance.fundId,
    encryptedBalance: Buffer.from(balance.encryptedBalance, "base64"),
    expectedVersion: balance.expectedVersion,
    orgKeyGeneration: balance.orgKeyGeneration,
    encryptedPayload:
      balance.encryptedPayload !== undefined
        ? Buffer.from(balance.encryptedPayload, "base64")
        : undefined,
  };
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createFundsRouter(deps: FundsRouterDeps) {
  // The tickets router's audit and outbox path, so a disbursement note is
  // announced exactly as a note written from the case.
  const { audit, auditAndNotify } = createLifecycleNotifier(deps);

  /** Per-request fund service bound to the caller's tenant. */
  function fundSvc(ctx: LifecycleActor): FundService {
    const org = ctx.org;
    const tDb = org.tenantDb;
    const access = deps.createTicketAccess(tDb);
    return createFundService(tDb, {
      org: {
        orgId: org.orgId,
        orgSchema: org.orgSchema,
        orgSlug: org.orgSlug,
      },
      followUps: deps.createFollowUpSvc(tDb, access, {
        onTicketChanged: deps.liveEvents?.forTenant(tDb, org.orgSchema),
      }),
      notificationService: deps.notificationService,
      announceCaseNote: (ticket) => {
        // Same event and arguments the tickets router uses for a note
        // with no mentions. The note carries the disbursement type, which
        // has no escalation targets, so the notice goes without a type id.
        auditAndNotify(ctx, "followup_added", ticket, {
          eventType: "followup_added",
          actorId: ctx.user.id,
          ticketId: ticket.id,
        });
      },
    });
  }

  return router({
    list: viewFundsProcedure.query(
      withErrorWrapping(async ({ ctx }): Promise<{ funds: FundWire[] }> => {
        const funds = await fundSvc(ctx).list();
        return {
          funds: funds.map((f) => ({
            id: f.id,
            encryptedPayload: b64(f.encryptedPayload),
            encryptedBalance: b64(f.encryptedBalance),
            balanceVersion: f.balanceVersion,
            isActive: f.isActive,
            sortOrder: f.sortOrder,
            orgKeyGeneration: f.orgKeyGeneration,
            createdAt: f.createdAt.toISOString(),
            updatedAt: f.updatedAt.toISOString(),
          })),
        };
      }),
    ),

    create: manageFundsProcedure.input(createFundInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }): Promise<{ id: string }> => {
        return fundSvc(ctx).create({
          encryptedPayload: Buffer.from(input.encryptedPayload, "base64"),
          encryptedBalance: Buffer.from(input.encryptedBalance, "base64"),
          orgKeyGeneration: ctx.org.sealedBox.generation,
        });
      }),
    ),

    update: manageFundsProcedure.input(updateFundInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        await fundSvc(ctx).updateFund(input.fundId, {
          encryptedPayload:
            input.encryptedPayload !== undefined
              ? Buffer.from(input.encryptedPayload, "base64")
              : undefined,
          isActive: input.isActive,
        });
        return { success: true as const };
      }),
    ),

    listLedger: auditFundsProcedure.query(
      withErrorWrapping(
        async ({ ctx }): Promise<{ entries: FundLedgerEntryWire[] }> => {
          const entries = await fundSvc(ctx).listLedger();
          return {
            entries: entries.map((e) => ({
              id: e.id,
              encryptedPayload: b64(e.encryptedPayload),
              orgKeyGeneration: e.orgKeyGeneration,
              entryDate: e.entryDate,
            })),
          };
        },
      ),
    ),

    recordDisbursement: recordDisbursementsProcedure
      .input(recordDisbursementInputSchema)
      .mutation(
        withErrorWrapping(
          async ({ ctx, input }): Promise<RecordedEntryWire> => {
            const { caseNote } = input;
            return fundSvc(ctx).recordDisbursement(ctx.user.id, {
              id: input.id,
              encryptedPayload: Buffer.from(input.encryptedPayload, "base64"),
              orgKeyGeneration: ctx.org.sealedBox.generation,
              balance: toBalanceWrite(input.balance),
              caseNote:
                caseNote !== undefined
                  ? {
                      followUpId: caseNote.followUpId,
                      ticketId: caseNote.ticketId,
                      encryptedContent: Buffer.from(
                        caseNote.encryptedContent,
                        "base64",
                      ),
                    }
                  : undefined,
            });
          },
        ),
      ),

    recordAdjustment: manageFundsProcedure
      .input(recordAdjustmentInputSchema)
      .mutation(
        withErrorWrapping(
          async ({ ctx, input }): Promise<RecordedEntryWire> => {
            return fundSvc(ctx).recordAdjustment(ctx.user.id, {
              id: input.id,
              encryptedPayload: Buffer.from(input.encryptedPayload, "base64"),
              orgKeyGeneration: ctx.org.sealedBox.generation,
              balance: toBalanceWrite(input.balance),
            });
          },
        ),
      ),

    reviseDisbursement: recordDisbursementsProcedure
      .input(reviseDisbursementInputSchema)
      .mutation(
        withErrorWrapping(
          async ({ ctx, input }): Promise<RevisedDisbursementWire> => {
            // A fund manager may correct a disbursement note someone else
            // recorded; anyone else only their own. The override reaches
            // only disbursement notes: the service refuses any other note.
            const mayEditAnyNote = await hasPermissionForOrg(
              ctx.org.tenantDb,
              ctx.org.orgSchema,
              ctx.user.roleId,
              Permission.MANAGE_FUNDS,
            );
            return fundSvc(ctx).reviseDisbursement(ctx.user.id, {
              reversal: {
                id: input.reversal.id,
                encryptedPayload: Buffer.from(
                  input.reversal.encryptedPayload,
                  "base64",
                ),
              },
              replacement: {
                id: input.replacement.id,
                encryptedPayload: Buffer.from(
                  input.replacement.encryptedPayload,
                  "base64",
                ),
              },
              orgKeyGeneration: ctx.org.sealedBox.generation,
              balance: toBalanceWrite(input.balance),
              caseNote: {
                followUpId: input.caseNote.followUpId,
                ticketId: input.caseNote.ticketId,
                encryptedContent: Buffer.from(
                  input.caseNote.encryptedContent,
                  "base64",
                ),
              },
              mayEditAnyNote,
            });
          },
        ),
      ),

    ensureDisbursementNoteType: recordDisbursementsProcedure
      .input(ensureDisbursementNoteTypeInputSchema)
      .mutation(
        withErrorWrapping(
          async ({ ctx, input }): Promise<EnsuredNoteTypeWire> => {
            const noteTypes = deps.createNoteTypeSvc(ctx.org.tenantDb);
            const { record, created } = await noteTypes.ensureSystem({
              systemKey: DISBURSEMENT_NOTE_TYPE_KEY,
              encryptedName: Buffer.from(input.encryptedName, "base64"),
              encryptedIcon: Buffer.from(input.encryptedIcon, "base64"),
              orgKeyGeneration: ctx.org.sealedBox.generation,
            });
            if (created) {
              audit(ctx.org.tenantDb, {
                eventType: "note_type_created",
                actorId: ctx.user.id,
                metadata: { noteTypeId: record.id },
              });
            }
            return { id: record.id, created };
          },
        ),
      ),

    setBalance: manageFundsProcedure.input(setFundBalanceInputSchema).mutation(
      withErrorWrapping(
        async ({ ctx, input }): Promise<{ balanceVersion: number }> => {
          return fundSvc(ctx).setBalance(toBalanceWrite(input.balance));
        },
      ),
    ),

    getSettings: manageFundsProcedure.query(
      withErrorWrapping(
        async ({ ctx }): Promise<{ notifyFundManagers: boolean }> => {
          const svc = createOrgConfigService(ctx.org.tenantDb);
          return { notifyFundManagers: await svc.getNotifyFundManagers() };
        },
      ),
    ),

    updateSettings: manageFundsProcedure
      .input(updateFundSettingsInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = createOrgConfigService(ctx.org.tenantDb);
          await svc.setNotifyFundManagers(input.notifyFundManagers);
          return { success: true as const };
        }),
      ),
  });
}
