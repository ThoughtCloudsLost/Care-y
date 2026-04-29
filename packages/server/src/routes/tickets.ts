/**
 * Ticket system tRPC router.
 *
 * Aggregates all ticket-related endpoints: ticket CRUD, follow-ups,
 * presets, dependencies, client merge, media, and queues. Each handler
 * creates per-request service instances from ctx.org.tenantDb (same
 * pattern as consultant.ts).
 *
 * Role requirements:
 * - volunteerProcedure: ticket CRUD, follow-ups, media reads, dependency management
 * - managerProcedure: presets, client merge
 * - adminProcedure: queue management
 */

import { z } from "zod";
import {
  router,
  volunteerProcedure,
  managerProcedure,
  adminProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";
import type { BlobStore } from "../storage/store.js";
import type { OrgContext } from "../trpc/context.js";
import type { TicketAccessChecker } from "../tickets/access.js";
import type {
  TicketService,
  PendingClient,
} from "../tickets/ticket-service.js";
import type { FollowUpService } from "../tickets/followup-service.js";
import type { MergeService } from "../tickets/merge-service.js";
import type { PresetService } from "../tickets/preset-service.js";
import type { DependencyService } from "../tickets/dependency-service.js";
import type { MediaService } from "../tickets/media-service.js";
import type { QueueService } from "../tickets/queue-service.js";
import type { AssignmentService } from "../tickets/assignment.js";
import type { WatchersService } from "../tickets/watchers.js";
import type { QueuePermissionsService } from "../tickets/queue-permissions.js";
import type { SearchService } from "../tickets/search.js";
import type { AuditService } from "../tickets/audit.js";
import type { ReadCursorService } from "../tickets/read-cursor-service.js";
import type { NotificationService } from "../notifications/service.js";
import type { AuditEntry } from "../tickets/audit.js";
import type { NoteTypeService } from "../tickets/note-type-service.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import type {
  NotificationEventType,
  ReactionSummary,
  TicketPriority,
} from "@care-y/shared";
import { ErrorCode, meetsRoleThreshold } from "@care-y/shared";
import { ForbiddenError, NotFoundError } from "../errors.js";
import {
  buildRecipientList,
  resolveEscalationTargets,
} from "../tickets/notification-recipients.js";
import type { ShiftProvider } from "../tickets/shift-provider.js";
import { createStubShiftProvider } from "../tickets/shift-provider.js";
import { createUserService } from "../users/user-service.js";
import {
  generateContentKey,
  encryptContent,
  eciesEncrypt,
  toRistrettoPoint,
  encode as cryptoEncode,
} from "@care-y/crypto";
import { rewrapFollowUp } from "../tickets/rewrap-service.js";
import { sanitizeLike, maskPhone } from "../utils/sql.js";
import {
  createTicketInputSchema,
  updateTicketInputSchema,
  ticketListInputSchema,
  recentFollowUpsInputSchema,
  createFollowUpInputSchema,
  followUpListInputSchema,
  updateReadCursorInputSchema,
  createPresetReplyInputSchema,
  updatePresetReplyInputSchema,
  addDependencyInputSchema,
  mergeClientsInputSchema,
  undoMergeInputSchema,
  createQueueInputSchema,
  updateQueueInputSchema,
  reorderQueuesInputSchema,
  deleteQueueInputSchema,
  assignTicketInputSchema,
  takeTicketInputSchema,
  releaseTicketInputSchema,
  assignToInputSchema,
  watchTicketInputSchema,
  queueWatcherInputSchema,
  queueAssignmentInputSchema,
  metadataSearchInputSchema,
  contentSearchInputSchema,
  auditLogQueryInputSchema,
  updateInternalNoteInputSchema,
  deleteInternalNoteInputSchema,
  followUpSummaryInputSchema,
  followUpsByIdsInputSchema,
  listParticipantsInputSchema,
  recordingListInputSchema,
  attachmentListInputSchema,
  createNoteTypeInputSchema,
  updateNoteTypeInputSchema,
  toggleReactionInputSchema,
  searchClientsInputSchema,
  RoleId,
} from "@care-y/shared";

export interface TicketRouterDeps {
  readonly blobStore: BlobStore;
  readonly createTicketAccess: (
    tDb: OrgContext["tenantDb"],
  ) => TicketAccessChecker;
  readonly createTicketSvc: (
    tDb: OrgContext["tenantDb"],
    access: TicketAccessChecker,
    getAccessibleQueueIds: (userId: string) => Promise<readonly string[]>,
    deps?: { pendingClients: Map<string, PendingClient> },
  ) => TicketService;
  readonly createFollowUpSvc: (
    tDb: OrgContext["tenantDb"],
    access: TicketAccessChecker,
  ) => FollowUpService;
  readonly createMergeSvc: (tDb: OrgContext["tenantDb"]) => MergeService;
  readonly createPresetSvc: (tDb: OrgContext["tenantDb"]) => PresetService;
  readonly createDependencySvc: (
    tDb: OrgContext["tenantDb"],
    access?: TicketAccessChecker,
  ) => DependencyService;
  readonly createMediaSvc: (
    tDb: OrgContext["tenantDb"],
    blobStore: BlobStore,
    access: TicketAccessChecker,
  ) => MediaService;
  readonly createQueueSvc: (tDb: OrgContext["tenantDb"]) => QueueService;
  // Workflow deps
  readonly createAssignmentSvc: (
    tDb: OrgContext["tenantDb"],
    access: TicketAccessChecker,
    shiftProvider: ShiftProvider,
  ) => AssignmentService;
  readonly createWatchersSvc: (
    tDb: OrgContext["tenantDb"],
    access: TicketAccessChecker,
  ) => WatchersService;
  readonly createQueuePermissionsSvc: (
    tDb: OrgContext["tenantDb"],
  ) => QueuePermissionsService;
  readonly createReadCursorSvc: (
    tDb: OrgContext["tenantDb"],
    access: TicketAccessChecker,
  ) => ReadCursorService;
  // Note types
  readonly createNoteTypeSvc?: (tDb: OrgContext["tenantDb"]) => NoteTypeService;
  // Search + audit (optional, injected by 5d wiring)
  readonly createSearchSvc?: (tDb: OrgContext["tenantDb"]) => SearchService;
  readonly createAuditSvc?: (tDb: OrgContext["tenantDb"]) => AuditService;
  // Notification dispatch (optional, injected by 5d wiring)
  readonly notificationService?: NotificationService;
  // Shared pending clients map for clientToken consumption (injected by relay)
  readonly pendingClients?: Map<string, PendingClient>;
  // OPS-tier field encryptor for phone number masking (client search)
  readonly fieldEncryptor?: FieldEncryptor;
}

function buildSearchRoutes(
  factory: (tDb: OrgContext["tenantDb"]) => SearchService,
) {
  return {
    metadataSearch: volunteerProcedure.input(metadataSearchInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const search = factory(ctx.org.tenantDb);
        return search.metadataSearch(input, ctx.user.id);
      }),
    ),

    contentSearch: volunteerProcedure.input(contentSearchInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const search = factory(ctx.org.tenantDb);
        return search.contentSearch(input, ctx.user.id);
      }),
    ),
  };
}

function buildNoteTypeRoutes(
  factory: (tDb: OrgContext["tenantDb"]) => NoteTypeService,
  auditFn: (tDb: OrgContext["tenantDb"], entry: AuditEntry) => void,
) {
  return {
    noteTypes: router({
      list: adminProcedure.query(
        withErrorWrapping(async ({ ctx }) => {
          const svc = factory(ctx.org.tenantDb);
          return svc.list();
        }),
      ),

      listActive: volunteerProcedure.query(
        withErrorWrapping(async ({ ctx }) => {
          const svc = factory(ctx.org.tenantDb);
          return svc.listActive(ctx.user.roleId);
        }),
      ),

      create: adminProcedure.input(createNoteTypeInputSchema).mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = factory(ctx.org.tenantDb);
          const result = await svc.create({
            encryptedName: Buffer.from(input.encryptedName, "base64"),
            encryptedIcon: Buffer.from(input.encryptedIcon, "base64"),
            encryptedDescription:
              input.encryptedDescription !== undefined
                ? Buffer.from(input.encryptedDescription, "base64")
                : undefined,
            escalationTargets: input.escalationTargets,
            requiresOnClose: input.requiresOnClose,
            minViewRole: input.minViewRole,
            minCreateRole: input.minCreateRole,
          });
          auditFn(ctx.org.tenantDb, {
            eventType: "note_type_created",
            actorId: ctx.user.id,
            metadata: { noteTypeId: result.id },
          });
          return result;
        }),
      ),

      update: adminProcedure.input(updateNoteTypeInputSchema).mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = factory(ctx.org.tenantDb);
          const result = await svc.update({
            id: input.id,
            encryptedName:
              input.encryptedName !== undefined
                ? Buffer.from(input.encryptedName, "base64")
                : undefined,
            encryptedIcon:
              input.encryptedIcon !== undefined
                ? Buffer.from(input.encryptedIcon, "base64")
                : undefined,
            encryptedDescription:
              input.encryptedDescription !== undefined
                ? input.encryptedDescription !== null
                  ? Buffer.from(input.encryptedDescription, "base64")
                  : null
                : undefined,
            escalationTargets: input.escalationTargets,
            isActive: input.isActive,
            requiresOnClose: input.requiresOnClose,
            minViewRole: input.minViewRole,
            minCreateRole: input.minCreateRole,
          });
          auditFn(ctx.org.tenantDb, {
            eventType: "note_type_updated",
            actorId: ctx.user.id,
            metadata: { noteTypeId: input.id },
          });
          return result;
        }),
      ),
    }),
  };
}

function buildAuditRoutes(
  factory: (tDb: OrgContext["tenantDb"]) => AuditService,
) {
  return {
    auditLog: managerProcedure.input(auditLogQueryInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const audit = factory(ctx.org.tenantDb);
        return audit.query(input);
      }),
    ),
  };
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createTicketRouter(deps: TicketRouterDeps) {
  // Per-request ticket service factory. Wires access checker + queue scoping
  // so every handler gets a correctly-scoped service without repeating the setup.
  function ticketSvc(tDb: OrgContext["tenantDb"]): {
    access: TicketAccessChecker;
    svc: TicketService;
  } {
    const access = deps.createTicketAccess(tDb);
    const qps = deps.createQueuePermissionsSvc(tDb);
    const svc = deps.createTicketSvc(
      tDb,
      access,
      async (userId) => qps.getUserQueues(userId),
      deps.pendingClients ? { pendingClients: deps.pendingClients } : undefined,
    );
    return { access, svc };
  }

  /** Creates a tenant-scoped assignment service with shift provider wiring. */
  function assignmentSvc(tDb: OrgContext["tenantDb"]): AssignmentService {
    const access = deps.createTicketAccess(tDb);
    const qp = deps.createQueuePermissionsSvc(tDb);
    const shift = createStubShiftProvider(async (qId) =>
      qp.getQueueMembers(qId),
    );
    return deps.createAssignmentSvc(tDb, access, shift);
  }

  /** Creates a tenant-scoped media service backed by the shared blob store. */
  function mediaSvc(tDb: OrgContext["tenantDb"]): MediaService {
    const access = deps.createTicketAccess(tDb);
    return deps.createMediaSvc(tDb, deps.blobStore, access);
  }

  /**
   * Resolve escalation target user IDs for a note type.
   * Always fetches and decrypts the note type regardless of whether
   * targets are empty, to avoid timing side channels between note types
   * with and without escalation.
   */
  async function resolveNoteTypeEscalation(
    tDb: OrgContext["tenantDb"],
    noteTypeId: string | undefined,
    ticketId?: string,
  ): Promise<string[] | undefined> {
    if (noteTypeId === undefined || !deps.createNoteTypeSvc) return undefined;

    const ntSvc = deps.createNoteTypeSvc(tDb);
    const ctx = await ntSvc.getEscalationContext(noteTypeId);
    if (!ctx) return undefined;

    const qp = deps.createQueuePermissionsSvc(tDb);
    const userSvc = createUserService(tDb);

    const userIds = await resolveEscalationTargets(
      ctx.targets,
      {
        getUsersByRole: async (role) => {
          const roleId = role === "admin" ? RoleId.ADMIN : RoleId.MANAGER;
          return [...(await userSvc.listActiveIdsByRoleId(roleId))];
        },
        // eslint-disable-next-line @typescript-eslint/require-await -- stub for future permission-based targeting
        getUsersByPermission: async () => [],
        getQueueMembers: async (queueId) => qp.getQueueMembers(queueId),
        getTicketKeyWrapHolders: async (tid) => {
          const rows = await tDb
            .selectFrom("ticket_key_wraps as tkw")
            .innerJoin("users as u", "u.id", "tkw.volunteer_id")
            .select("tkw.volunteer_id")
            .where("tkw.ticket_id", "=", tid)
            .where("u.is_active", "=", true)
            .groupBy("tkw.volunteer_id")
            .execute();
          return rows.map((r) => r.volunteer_id);
        },
      },
      ticketId,
    );

    if (userIds.length === 0) return undefined;

    if (ctx.minViewRole === RoleId.VOLUNTEER) return userIds;

    const userRows = await tDb
      .selectFrom("users")
      .select(["id", "role_id"])
      .where("id", "in", userIds)
      .execute();

    const filtered = userRows
      .filter((u) => meetsRoleThreshold(u.role_id, ctx.minViewRole))
      .map((u) => u.id);

    return filtered.length > 0 ? filtered : undefined;
  }

  // Audit helper: best-effort, never blocks. No-op when audit service not injected.
  function audit(tDb: OrgContext["tenantDb"], entry: AuditEntry): void {
    if (!deps.createAuditSvc) return;
    const svc = deps.createAuditSvc(tDb);
    void svc.log(entry);
  }

  /**
   * Combined audit + notification for ticket lifecycle events.
   * Logs the audit entry, dispatches notification with queueId (not name,
   * since queue names are encrypted per ADR-030).
   * All steps are best-effort (never blocks the response).
   */
  function auditAndNotify(
    ctx: { org: OrgContext; user: { id: string } },
    eventType: NotificationEventType,
    ticket: { id: string; queueId: string; assignedTo: string | null },
    auditEntry: AuditEntry,
    mentionedPseudonyms: string[] = [],
    noteTypeId?: string,
  ): void {
    audit(ctx.org.tenantDb, auditEntry);
    notify(ctx, eventType, ticket, mentionedPseudonyms, noteTypeId);
  }

  // Notification dispatch helper: best-effort, never blocks.
  // Builds recipient list and dispatches across all channels.
  // Passes queueId (not queue name) since names are encrypted (ADR-030).
  // Escalation resolution happens inside the fire-and-forget block so
  // transient errors in the escalation path cannot fail the mutation.
  function notify(
    ctx: { org: OrgContext; user: { id: string } },
    eventType: NotificationEventType,
    ticket: { id: string; queueId: string; assignedTo: string | null },
    mentionedPseudonyms: string[] = [],
    noteTypeId?: string,
  ): void {
    if (!deps.notificationService) return;
    const ns = deps.notificationService;
    const tDb = ctx.org.tenantDb;
    const access = deps.createTicketAccess(tDb);
    const watchers = deps.createWatchersSvc(tDb, access);

    void (async () => {
      try {
        const escalationUserIds = await resolveNoteTypeEscalation(
          tDb,
          noteTypeId,
          ticket.id,
        );

        const recipients = await buildRecipientList(
          {
            getTicketWatchers: async (ticketId) =>
              watchers.getTicketWatchers(ticketId),
            getQueueWatchers: async (queueId) =>
              watchers.getQueueWatchers(queueId),
            resolveValidMentions: async (ids) => Promise.resolve(ids),
          },
          ticket,
          mentionedPseudonyms,
          ctx.user.id,
          escalationUserIds,
        );
        await ns.dispatch(
          tDb,
          ctx.org.orgId,
          ctx.org.orgSlug,
          eventType,
          ticket.id,
          ticket.queueId,
          recipients,
        );
      } catch (err: unknown) {
        console.error(
          "Notification dispatch failed:",
          err instanceof Error ? err.message : String(err),
        );
      }
    })();
  }

  return router({
    // --- Ticket CRUD ---
    create: volunteerProcedure.input(createTicketInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const { svc } = ticketSvc(ctx.org.tenantDb);
        const ticket = await svc.create(ctx.user.id, {
          clientId: input.clientId,
          clientToken: input.clientToken,
          queueId: input.queueId,
          encryptedTitle: Buffer.from(input.encryptedTitle, "base64"),
          encryptedDescription: Buffer.from(
            input.encryptedDescription,
            "base64",
          ),
          priority: input.priority,
          keyGeneration: input.keyGeneration,
          keyWrap: {
            ephemeralPoint: Buffer.from(input.keyWrap.ephemeralPoint, "base64"),
            nonce: Buffer.from(input.keyWrap.nonce, "base64"),
            wrappedKey: Buffer.from(input.keyWrap.wrappedKey, "base64"),
          },
        });
        auditAndNotify(ctx, "ticket_created", ticket, {
          eventType: "ticket_created",
          actorId: ctx.user.id,
          ticketId: ticket.id,
        });
        return ticket;
      }),
    ),

    get: volunteerProcedure.input(z.object({ ticketId: z.uuid() })).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const { svc } = ticketSvc(ctx.org.tenantDb);
        return svc.findById(input.ticketId, ctx.user.id);
      }),
    ),

    list: volunteerProcedure.input(ticketListInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const { svc } = ticketSvc(ctx.org.tenantDb);
        return svc.list(ctx.user.id, input);
      }),
    ),

    recentFollowUps: volunteerProcedure.input(recentFollowUpsInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const { svc } = ticketSvc(ctx.org.tenantDb);
        return svc.recentFollowUps(ctx.user.id, input);
      }),
    ),

    counts: volunteerProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const { svc } = ticketSvc(ctx.org.tenantDb);
        return svc.counts(ctx.user.id);
      }),
    ),

    searchClients: volunteerProcedure.input(searchClientsInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const tDb = ctx.org.tenantDb;
        const results = await tDb
          .selectFrom("clients as c")
          .innerJoin("phones as p", "p.id", "c.phone_id")
          .select(["c.id", "c.alias", "p.encrypted_number"])
          .where("c.merged_into", "is", null)
          .where("c.alias", "ilike", `%${sanitizeLike(input.query)}%`)
          .orderBy("c.alias", "asc")
          .limit(input.limit)
          .execute();

        if (!deps.fieldEncryptor) {
          return results.map((r) => ({
            id: r.id,
            alias: r.alias,
            maskedPhone: "***",
          }));
        }

        const encryptor = deps.fieldEncryptor;
        return results.map((r) => ({
          id: r.id,
          alias: r.alias,
          maskedPhone: maskPhone(encryptor.decryptToBuffer(r.encrypted_number)),
        }));
      }),
    ),

    update: volunteerProcedure.input(updateTicketInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const { svc } = ticketSvc(ctx.org.tenantDb);
        // care-y-ignore-next-line route-delegates-to-service -- delegates to svc.update; field extraction from Zod-validated input is wire-format mapping, not business logic
        return svc.update(ctx.user.id, {
          ticketId: input.ticketId,
          status: input.status,
          priority: input.priority,
          queueId: input.queueId,
          onHold: input.onHold,
        });
      }),
    ),

    close: volunteerProcedure.input(z.object({ ticketId: z.uuid() })).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const { svc, access } = ticketSvc(ctx.org.tenantDb);
        const ticket = await svc.close(ctx.user.id, input.ticketId);
        // Delete read cursors for closed ticket (no post-closure read state)
        const readCursorSvc = deps.createReadCursorSvc(
          ctx.org.tenantDb,
          access,
        );
        await readCursorSvc.deleteForTicket(input.ticketId);
        auditAndNotify(ctx, "ticket_closed", ticket, {
          eventType: "ticket_closed",
          actorId: ctx.user.id,
          ticketId: input.ticketId,
        });
        return ticket;
      }),
    ),

    reopen: volunteerProcedure
      .input(
        z.object({
          ticketId: z.uuid(),
          newKeyGeneration: z.uuid(),
        }),
      )
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const { svc } = ticketSvc(ctx.org.tenantDb);
          const ticket = await svc.reopen(
            ctx.user.id,
            input.ticketId,
            input.newKeyGeneration,
          );
          auditAndNotify(ctx, "ticket_reopened", ticket, {
            eventType: "ticket_reopened",
            actorId: ctx.user.id,
            ticketId: input.ticketId,
          });
          return ticket;
        }),
      ),

    // --- Follow-ups ---
    createFollowUp: volunteerProcedure
      .input(createFollowUpInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          if (
            input.type === "internal_note" &&
            input.noteTypeId !== undefined &&
            deps.createNoteTypeSvc
          ) {
            const ntSvc = deps.createNoteTypeSvc(ctx.org.tenantDb);
            const minRole = await ntSvc.getMinCreateRole(input.noteTypeId);
            if (
              minRole !== undefined &&
              !meetsRoleThreshold(ctx.user.roleId, minRole)
            ) {
              throw new ForbiddenError(ErrorCode.INSUFFICIENT_ROLE);
            }
          }
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createFollowUpSvc(ctx.org.tenantDb, access);
          const followUp = await svc.create(ctx.user.id, {
            ticketId: input.ticketId,
            encryptedContent: Buffer.from(input.encryptedContent, "base64"),
            source: input.source,
            type: input.type,
            isPrivate: input.isPrivate,
            mentionedPseudonyms: input.mentionedPseudonyms,
            noteTypeId: input.noteTypeId,
          });
          // Look up ticket for notification context
          const { svc: tSvc } = ticketSvc(ctx.org.tenantDb);
          const ticket = await tSvc.findById(input.ticketId, ctx.user.id);
          const hasMentions = input.mentionedPseudonyms.length > 0;
          const eventType = hasMentions ? "mention" : "followup_added";
          auditAndNotify(
            ctx,
            eventType,
            ticket,
            {
              eventType: "followup_added",
              actorId: ctx.user.id,
              ticketId: input.ticketId,
            },
            input.mentionedPseudonyms,
            input.noteTypeId,
          );
          return followUp;
        }),
      ),

    listFollowUps: volunteerProcedure.input(followUpListInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const access = deps.createTicketAccess(ctx.org.tenantDb);
        const svc = deps.createFollowUpSvc(ctx.org.tenantDb, access);
        const followUps = await svc.listByTicket(ctx.user.id, input.ticketId, {
          limit: input.limit,
          cursor: input.cursor,
          direction: input.direction,
          types: input.types,
          mediaFlags: input.mediaFlags,
          createdBy: input.createdBy,
          includeClientSource: input.includeClientSource,
          dateFrom: input.dateFrom,
          dateTo: input.dateTo,
          userRoleId: ctx.user.roleId,
        });

        const noteIds = followUps
          .filter((fu) => fu.type === "internal_note")
          .map((fu) => fu.id);
        const reactionsMap = await svc.getReactions(noteIds);
        const reactions: Record<string, ReactionSummary[]> =
          Object.fromEntries(reactionsMap);

        return { followUps, reactions };
      }),
    ),

    listFollowUpSummary: volunteerProcedure
      .input(followUpSummaryInputSchema)
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createFollowUpSvc(ctx.org.tenantDb, access);
          const summaries = await svc.listSummary(ctx.user.id, input.ticketId, {
            limit: input.limit,
            cursor: input.cursor,
            direction: input.direction,
            types: input.types,
            mediaFlags: input.mediaFlags,
            createdBy: input.createdBy,
            includeClientSource: input.includeClientSource,
            dateFrom: input.dateFrom,
            dateTo: input.dateTo,
            userRoleId: ctx.user.roleId,
          });

          const noteIds = summaries
            .filter((s) => s.type === "internal_note")
            .map((s) => s.id);
          const reactionsMap = await svc.getReactions(noteIds);
          const reactions: Record<string, ReactionSummary[]> =
            Object.fromEntries(reactionsMap);

          return { summaries, reactions };
        }),
      ),

    listFollowUpsByIds: volunteerProcedure
      .input(followUpsByIdsInputSchema)
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createFollowUpSvc(ctx.org.tenantDb, access);
          return svc.listByIds(ctx.user.id, input.ticketId, input.followUpIds, {
            types: input.types,
          });
        }),
      ),

    // --- Read cursors ---

    getReadCursor: volunteerProcedure
      .input(z.object({ ticketId: z.uuid() }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createReadCursorSvc(ctx.org.tenantDb, access);
          return svc.getOrCreate(ctx.user.id, input.ticketId);
        }),
      ),

    updateReadCursor: volunteerProcedure
      .input(updateReadCursorInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createReadCursorSvc(ctx.org.tenantDb, access);
          await svc.update(
            ctx.user.id,
            input.ticketId,
            Buffer.from(input.encryptedReadCursor, "base64"),
          );
        }),
      ),

    // --- Internal note edit/delete ---
    updateInternalNote: volunteerProcedure
      .input(updateInternalNoteInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createFollowUpSvc(ctx.org.tenantDb, access);
          const { record, previousNoteTypeId } = await svc.updateInternalNote(
            ctx.user.id,
            input.followUpId,
            Buffer.from(input.encryptedContent, "base64"),
            input.noteTypeId,
          );

          // Trigger escalation only when the note type actually changed
          // (server-side comparison, not client-trust).
          const typeChanged =
            input.noteTypeId !== undefined &&
            input.noteTypeId !== previousNoteTypeId;

          if (typeChanged) {
            const { svc: tSvc } = ticketSvc(ctx.org.tenantDb);
            const ticket = await tSvc.findById(record.ticketId, ctx.user.id);
            notify(ctx, "followup_added", ticket, [], input.noteTypeId);
          }

          return record;
        }),
      ),

    deleteInternalNote: volunteerProcedure
      .input(deleteInternalNoteInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createFollowUpSvc(ctx.org.tenantDb, access);
          const isAdmin = ctx.user.roleId === RoleId.ADMIN;
          await svc.softDeleteInternalNote(
            ctx.user.id,
            input.followUpId,
            isAdmin,
          );
        }),
      ),

    toggleReaction: volunteerProcedure
      .input(toggleReactionInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createFollowUpSvc(ctx.org.tenantDb, access);
          return svc.toggleReaction(
            ctx.user.id,
            ctx.user.roleId,
            input.followUpId,
            input.reaction,
          );
        }),
      ),

    getReactions: volunteerProcedure
      .input(z.object({ followUpIds: z.array(z.uuid()).max(100) }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createFollowUpSvc(ctx.org.tenantDb, access);
          const map = await svc.getReactions(input.followUpIds);
          return Object.fromEntries(map);
        }),
      ),

    // --- Presets ---
    createPreset: managerProcedure.input(createPresetReplyInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createPresetSvc(ctx.org.tenantDb);
        return svc.create({
          encryptedTitle: Buffer.from(input.encryptedTitle, "base64"),
          encryptedBody: Buffer.from(input.encryptedBody, "base64"),
          queueId: input.queueId,
          createdBy: ctx.user.id,
        });
      }),
    ),

    listPresets: volunteerProcedure
      .input(z.object({ queueId: z.uuid().optional() }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createPresetSvc(ctx.org.tenantDb);
          return svc.list(input.queueId);
        }),
      ),

    updatePreset: managerProcedure.input(updatePresetReplyInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createPresetSvc(ctx.org.tenantDb);
        const title =
          input.encryptedTitle !== undefined
            ? Buffer.from(input.encryptedTitle, "base64")
            : undefined;
        const body =
          input.encryptedBody !== undefined
            ? Buffer.from(input.encryptedBody, "base64")
            : undefined;
        // care-y-ignore-next-line route-delegates-to-service -- delegates to svc.update; Buffer.from is wire-format (base64 to Buffer) conversion, not business logic
        return svc.update(input.presetId, {
          encryptedTitle: title,
          encryptedBody: body,
          queueId: input.queueId,
        });
      }),
    ),

    deletePreset: managerProcedure
      .input(z.object({ presetId: z.uuid() }))
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createPresetSvc(ctx.org.tenantDb);
          // care-y-ignore-next-line route-delegates-to-service -- single service call, no business logic
          await svc.delete(input.presetId);
        }),
      ),

    // --- Dependencies ---
    addDependency: volunteerProcedure.input(addDependencyInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const { access } = ticketSvc(ctx.org.tenantDb);
        const svc = deps.createDependencySvc(ctx.org.tenantDb, access);
        return svc.add(ctx.user.id, input.ticketId, input.dependsOnTicketId);
      }),
    ),

    removeDependency: volunteerProcedure
      .input(addDependencyInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const { access } = ticketSvc(ctx.org.tenantDb);
          const svc = deps.createDependencySvc(ctx.org.tenantDb, access);
          await svc.remove(
            ctx.user.id,
            input.ticketId,
            input.dependsOnTicketId,
          );
        }),
      ),

    listDependencies: volunteerProcedure
      .input(z.object({ ticketId: z.uuid() }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createDependencySvc(ctx.org.tenantDb);
          return svc.listForTicket(input.ticketId);
        }),
      ),

    // --- Client Merge ---
    mergeClients: managerProcedure.input(mergeClientsInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createMergeSvc(ctx.org.tenantDb);
        const result = await svc.merge({
          primaryClientId: input.primaryClientId,
          secondaryClientId: input.secondaryClientId,
          encryptedSnapshot: Buffer.from(input.encryptedSnapshot, "base64"),
        });
        audit(ctx.org.tenantDb, {
          eventType: "ticket_merged",
          actorId: ctx.user.id,
          metadata: {
            primaryClientId: input.primaryClientId,
            secondaryClientId: input.secondaryClientId,
          },
        });
        return result;
      }),
    ),

    undoMerge: managerProcedure.input(undoMergeInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createMergeSvc(ctx.org.tenantDb);
        return svc.undoMerge({
          mergeEventId: input.mergeEventId,
          encryptedSnapshot: Buffer.from(input.encryptedSnapshot, "base64"),
        });
      }),
    ),

    lockMerge: managerProcedure
      .input(z.object({ mergeEventId: z.uuid(), locked: z.boolean() }))
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createMergeSvc(ctx.org.tenantDb);
          await svc.setUndoLock(input.mergeEventId, input.locked);
        }),
      ),

    // --- Media ---
    getRecording: volunteerProcedure
      .input(z.object({ recordingId: z.uuid() }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = mediaSvc(ctx.org.tenantDb);
          return svc.getRecording(ctx.user.id, input.recordingId);
        }),
      ),

    getAttachment: volunteerProcedure
      .input(z.object({ attachmentId: z.uuid() }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = mediaSvc(ctx.org.tenantDb);
          return svc.getAttachment(ctx.user.id, input.attachmentId);
        }),
      ),

    downloadRecordingBlob: volunteerProcedure
      .input(z.object({ recordingId: z.uuid() }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = mediaSvc(ctx.org.tenantDb);
          const record = await svc.getRecording(ctx.user.id, input.recordingId);
          const blob = await deps.blobStore.get(record.blobKey);
          if (!blob) {
            throw new NotFoundError(ErrorCode.RECORDING_NOT_FOUND);
          }
          return { data: cryptoEncode(new Uint8Array(blob)) };
        }),
      ),

    downloadAttachmentBlob: volunteerProcedure
      .input(z.object({ attachmentId: z.uuid() }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = mediaSvc(ctx.org.tenantDb);
          const record = await svc.getAttachment(
            ctx.user.id,
            input.attachmentId,
          );
          const blob = await deps.blobStore.get(record.blobKey);
          if (!blob) {
            throw new NotFoundError(ErrorCode.ATTACHMENT_NOT_FOUND);
          }
          return { data: cryptoEncode(new Uint8Array(blob)) };
        }),
      ),

    listRecordings: volunteerProcedure.input(recordingListInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = mediaSvc(ctx.org.tenantDb);
        return svc.listRecordings(ctx.user.id, input.ticketId, {
          limit: input.limit,
          cursor: input.cursor,
          direction: input.direction,
          followupId: input.followupId,
        });
      }),
    ),

    listAttachments: volunteerProcedure.input(attachmentListInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = mediaSvc(ctx.org.tenantDb);
        return svc.listAttachments(ctx.user.id, input.ticketId, {
          limit: input.limit,
          cursor: input.cursor,
          direction: input.direction,
          followupId: input.followupId,
        });
      }),
    ),

    // --- Queues ---
    createQueue: adminProcedure.input(createQueueInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createQueueSvc(ctx.org.tenantDb);
        const queue = await svc.create({
          encryptedName: Buffer.from(input.encryptedName, "base64"),
          escalateDays: input.escalateDays,
        });
        audit(ctx.org.tenantDb, {
          eventType: "queue_created",
          actorId: ctx.user.id,
          metadata: { queueId: queue.id },
        });
        return queue;
      }),
    ),

    listQueues: volunteerProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const svc = deps.createQueueSvc(ctx.org.tenantDb);
        return svc.listActive();
      }),
    ),

    updateQueue: adminProcedure.input(updateQueueInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createQueueSvc(ctx.org.tenantDb);
        const queue = await svc.update(input.queueId, {
          encryptedName:
            input.encryptedName !== undefined
              ? Buffer.from(input.encryptedName, "base64")
              : undefined,
          escalateDays: input.escalateDays,
        });
        audit(ctx.org.tenantDb, {
          eventType: "queue_updated",
          actorId: ctx.user.id,
          metadata: { queueId: input.queueId },
        });
        return queue;
      }),
    ),

    reorderQueues: adminProcedure.input(reorderQueuesInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createQueueSvc(ctx.org.tenantDb);
        await svc.reorder(
          input.map((item) => ({
            queueId: item.queueId,
            sortOrder: item.sortOrder,
          })),
        );
      }),
    ),

    deleteQueue: adminProcedure.input(deleteQueueInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createQueueSvc(ctx.org.tenantDb);
        await svc.delete(input.queueId, input.reassignTo);
        audit(ctx.org.tenantDb, {
          eventType: "queue_deleted",
          actorId: ctx.user.id,
          metadata: { queueId: input.queueId },
        });
        return { success: true as const };
      }),
    ),

    // --- Assignment ---
    assign: volunteerProcedure.input(assignTicketInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = assignmentSvc(ctx.org.tenantDb);
        const result = await svc.assignRoundRobin(input.ticketId);
        if (result.assignedTo !== null) {
          const { svc: tSvc } = ticketSvc(ctx.org.tenantDb);
          const ticket = await tSvc.findById(input.ticketId, ctx.user.id);
          auditAndNotify(ctx, "ticket_assigned", ticket, {
            eventType: "ticket_assigned",
            actorId: ctx.user.id,
            ticketId: input.ticketId,
            metadata: { assignedTo: result.assignedTo },
          });
        }
        return result;
      }),
    ),

    take: volunteerProcedure.input(takeTicketInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = assignmentSvc(ctx.org.tenantDb);
        await svc.take(ctx.user.id, input.ticketId);
        const { svc: tSvc } = ticketSvc(ctx.org.tenantDb);
        const ticket = await tSvc.findById(input.ticketId, ctx.user.id);
        auditAndNotify(ctx, "ticket_assigned", ticket, {
          eventType: "ticket_assigned",
          actorId: ctx.user.id,
          ticketId: input.ticketId,
          metadata: { assignedTo: ctx.user.id },
        });
      }),
    ),

    release: volunteerProcedure.input(releaseTicketInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = assignmentSvc(ctx.org.tenantDb);
        await svc.release(ctx.user.id, input.ticketId);
        audit(ctx.org.tenantDb, {
          eventType: "ticket_assigned",
          actorId: ctx.user.id,
          ticketId: input.ticketId,
          metadata: { assignedTo: null },
        });
      }),
    ),

    assignTo: volunteerProcedure.input(assignToInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = assignmentSvc(ctx.org.tenantDb);
        await svc.assignTo(ctx.user.id, input.ticketId, input.targetUserId);
        const { svc: tSvc } = ticketSvc(ctx.org.tenantDb);
        const ticket = await tSvc.findById(input.ticketId, ctx.user.id);
        auditAndNotify(ctx, "ticket_assigned", ticket, {
          eventType: "ticket_assigned",
          actorId: ctx.user.id,
          ticketId: input.ticketId,
          metadata: { assignedTo: input.targetUserId },
        });
      }),
    ),

    // --- CC/Watchers ---
    watchTicket: volunteerProcedure.input(watchTicketInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const access = deps.createTicketAccess(ctx.org.tenantDb);
        const svc = deps.createWatchersSvc(ctx.org.tenantDb, access);
        await svc.subscribe(ctx.user.id, input.ticketId);
      }),
    ),

    unwatchTicket: volunteerProcedure.input(watchTicketInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const access = deps.createTicketAccess(ctx.org.tenantDb);
        const svc = deps.createWatchersSvc(ctx.org.tenantDb, access);
        await svc.unsubscribe(ctx.user.id, input.ticketId);
      }),
    ),

    isWatching: volunteerProcedure.input(watchTicketInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const access = deps.createTicketAccess(ctx.org.tenantDb);
        await access.assertAccess(ctx.user.id, input.ticketId);
        const svc = deps.createWatchersSvc(ctx.org.tenantDb, access);
        return svc.isWatching(ctx.user.id, input.ticketId);
      }),
    ),

    addQueueWatcher: adminProcedure.input(queueWatcherInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const access = deps.createTicketAccess(ctx.org.tenantDb);
        const svc = deps.createWatchersSvc(ctx.org.tenantDb, access);
        await svc.addQueueWatcher(input.queueId, input.userId);
      }),
    ),

    removeQueueWatcher: adminProcedure.input(queueWatcherInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const access = deps.createTicketAccess(ctx.org.tenantDb);
        const svc = deps.createWatchersSvc(ctx.org.tenantDb, access);
        await svc.removeQueueWatcher(input.queueId, input.userId);
      }),
    ),

    // --- Queue Assignments ---
    addQueueMember: adminProcedure.input(queueAssignmentInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createQueuePermissionsSvc(ctx.org.tenantDb);
        await svc.addMember(input.queueId, input.userId);
      }),
    ),

    removeQueueMember: adminProcedure
      .input(queueAssignmentInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createQueuePermissionsSvc(ctx.org.tenantDb);
          await svc.removeMember(input.queueId, input.userId);
        }),
      ),

    listQueueMembers: volunteerProcedure
      .input(z.object({ queueId: z.uuid() }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createQueuePermissionsSvc(ctx.org.tenantDb);
          return svc.getQueueMembers(input.queueId);
        }),
      ),

    getUserQueues: adminProcedure.input(z.object({ userId: z.uuid() })).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createQueuePermissionsSvc(ctx.org.tenantDb);
        return svc.getUserQueues(input.userId);
      }),
    ),

    listAllQueueAssignments: adminProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const svc = deps.createQueuePermissionsSvc(ctx.org.tenantDb);
        return svc.listAllAssignments();
      }),
    ),

    // --- Volunteers (for @mention autocomplete) ---
    listVolunteers: volunteerProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const svc = createUserService(ctx.org.tenantDb);
        return svc.listActiveVolunteers();
      }),
    ),

    // --- Ticket participants (distinct volunteer authors) ---
    listParticipants: volunteerProcedure
      .input(listParticipantsInputSchema)
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createFollowUpSvc(ctx.org.tenantDb, access);
          return svc.listParticipants(ctx.user.id, input.ticketId);
        }),
      ),

    // --- Dashboard: activity feed (scoped to user's queues) ---
    recentActivity: volunteerProcedure
      .input(
        z
          .object({ limit: z.number().int().min(1).max(10).default(5) })
          .default({ limit: 5 }),
      )
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const tDb = ctx.org.tenantDb;
          const qps = deps.createQueuePermissionsSvc(tDb);
          const queueIds = await qps.getUserQueues(ctx.user.id);

          if (queueIds.length === 0) return [];

          const rows = await tDb
            .selectFrom("audit_log as al")
            .innerJoin("tickets as t", "t.id", "al.ticket_id")
            .innerJoin("clients as c", "c.id", "t.client_id")
            .innerJoin("queues as q", "q.id", "t.queue_id")
            .select([
              "al.id",
              "al.event_type as eventType",
              "al.ticket_id as ticketId",
              "c.alias as clientAlias",
              "q.id as queueId",
              "q.encrypted_name as encryptedQueueName",
              "al.created_at as createdAt",
            ])
            .where("t.queue_id", "in", queueIds)
            .where("al.ticket_id", "is not", null)
            .orderBy("al.created_at", "desc")
            .limit(input.limit)
            .execute();

          return rows;
        }),
      ),

    // --- Dashboard: queue membership with open ticket counts ---
    myQueues: volunteerProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const tDb = ctx.org.tenantDb;
        const qps = deps.createQueuePermissionsSvc(tDb);
        const queueIds = await qps.getUserQueues(ctx.user.id);

        if (queueIds.length === 0) return [];

        const svc = deps.createQueueSvc(tDb);
        const allQueues = await svc.listActive();
        const allowed = new Set(queueIds);
        return allQueues.filter((q) => allowed.has(q.id));
      }),
    ),

    // --- Dashboard: shift info (STUB:SHIFT-SCHEDULING) ---
    dashboardInfo: volunteerProcedure.query(
      withErrorWrapping(() => {
        // TODO(shift-scheduling): Replace with real DB queries when
        // the shift scheduling feature lands.
        return {
          shift: {
            current: { start: "09:00", end: "13:00", label: "Morning" },
            volunteersOnShift: 3,
            volunteers: [
              { initials: "JN", isCurrentUser: true },
              { initials: "AK", isCurrentUser: false },
              { initials: "ML", isCurrentUser: false },
            ],
          },
        };
      }),
    ),

    // --- Note types ---
    ...(deps.createNoteTypeSvc
      ? buildNoteTypeRoutes(deps.createNoteTypeSvc, audit)
      : {}),

    // --- Metadata search (injected by 5d wiring) ---
    ...(deps.createSearchSvc ? buildSearchRoutes(deps.createSearchSvc) : {}),

    // --- Audit log query (manager+ only, injected by 5d wiring) ---
    ...(deps.createAuditSvc ? buildAuditRoutes(deps.createAuditSvc) : {}),

    // --- Re-wrap: volunteer re-encrypts tk_temp content with canonical tk ---
    rewrapFollowUp: volunteerProcedure
      .input(
        z.object({
          followUpId: z.uuid(),
          encryptedContent: z.string().min(1),
          blobUpdates: z
            .array(
              z.object({
                oldBlobKey: z.string().min(1),
                encryptedData: z.string().min(1),
                category: z.enum(["attachment", "recording"] as const),
              }),
            )
            .optional(),
        }),
      )
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          return rewrapFollowUp(
            ctx.org.tenantDb,
            access,
            ctx.user.id,
            {
              followUpId: input.followUpId,
              encryptedContent: Buffer.from(input.encryptedContent, "base64"),
              blobUpdates: input.blobUpdates?.map((b) => ({
                oldBlobKey: b.oldBlobKey,
                encryptedData: Buffer.from(b.encryptedData, "base64"),
                category: b.category,
              })),
            },
            deps.blobStore,
            ctx.org.orgSchema,
          );
        }),
      ),

    // --- Dev-only: seed test tickets with real ECIES key wraps ---
    ...(process.env.NODE_ENV === "development"
      ? {
          devSeedTickets: volunteerProcedure.mutation(
            withErrorWrapping(async ({ ctx }) => {
              const tDb = ctx.org.tenantDb;

              // 1. Look up vol_public for the current user
              const userKeys = await tDb
                .selectFrom("user_keys")
                .select("vol_public")
                .where("user_id", "=", ctx.user.id)
                .executeTakeFirst();

              if (!userKeys?.vol_public) {
                throw new Error(
                  "user_keys.vol_public not found. Run registerCrypto first.",
                );
              }

              const volPublic = toRistrettoPoint(
                new Uint8Array(userKeys.vol_public),
              );

              // 2. Fetch queues + clients (created by seed script)
              // Queue names are encrypted (ADR-030), so we fetch all active
              // queues by sort_order and assign them to the seed labels by
              // position: sort_order 1 = "Intake", 2 = "Crisis", 3 = "Housing".
              const queues = await tDb
                .selectFrom("queues")
                .select(["id", "sort_order"])
                .where("is_active", "=", true)
                .orderBy("sort_order", "asc")
                .execute();
              const seedLabels = ["Intake", "Crisis", "Housing"];
              const queueMap = new Map<string, string>();
              for (const [idx, q] of queues.entries()) {
                const label = seedLabels.at(idx);
                if (label !== undefined) queueMap.set(label, q.id);
              }

              const clients = await tDb
                .selectFrom("clients")
                .select(["id", "alias"])
                .orderBy("created_at", "asc")
                .execute();

              if (clients.length === 0) {
                throw new Error("No clients found. Run seed first.");
              }

              // Helper: minutes ago as a Date
              function minutesAgo(m: number): Date {
                return new Date(Date.now() - m * 60_000);
              }

              // 3. Ticket definitions with varied data
              // Clients are assigned round-robin from whatever clients exist.
              interface FollowUpDef {
                content: string;
                source: string;
                type?: string; // default: "message"
                isPrivate?: boolean; // default: false
                agoMinutes: number;
                media?: MediaDef[];
              }

              interface MediaDef {
                kind: "recording" | "image" | "file";
                /** For recordings: duration in seconds. */
                durationSeconds?: number;
                /** For attachments: plaintext filename (encrypted at insert time). */
                filename?: string;
                /** For attachments: MIME content type. */
                contentType?: string;
              }

              interface TicketDef {
                title: string;
                description: string;
                queue: string;
                priority: TicketPriority;
                assignedTo: string | null;
                onHold: boolean;
                withKeyWrap: boolean;
                createdAgo: number; // minutes ago
                followUps: FollowUpDef[];
              }

              // --- Synthetic media generators ---
              // Minimal valid files for testing. Production uses real
              // Twilio recordings / user uploads, but the encryption
              // pipeline is identical.

              /** Minimal valid WAV header + sine wave (~1 second, 8kHz mono). */
              function generateWav(durationSec: number): Buffer {
                const sampleRate = 8000;
                const numSamples = sampleRate * durationSec;
                const dataSize = numSamples * 2; // 16-bit PCM
                const header = Buffer.alloc(44);
                // RIFF header
                header.write("RIFF", 0);
                header.writeUInt32LE(36 + dataSize, 4);
                header.write("WAVE", 8);
                // fmt chunk
                header.write("fmt ", 12);
                header.writeUInt32LE(16, 16); // chunk size
                header.writeUInt16LE(1, 20); // PCM
                header.writeUInt16LE(1, 22); // mono
                header.writeUInt32LE(sampleRate, 24);
                header.writeUInt32LE(sampleRate * 2, 28); // byte rate
                header.writeUInt16LE(2, 32); // block align
                header.writeUInt16LE(16, 34); // bits per sample
                // data chunk
                header.write("data", 36);
                header.writeUInt32LE(dataSize, 40);
                const data = Buffer.alloc(dataSize);
                for (let i = 0; i < numSamples; i++) {
                  const sample = Math.sin((2 * Math.PI * 440 * i) / sampleRate);
                  data.writeInt16LE(Math.round(sample * 16000), i * 2);
                }
                return Buffer.concat([header, data]);
              }

              /** Valid 64x64 cyan PNG (178 bytes). Visible on both light and dark. */
              function generatePng(): Buffer {
                // Generated programmatically: 64x64 RGB, solid #00CCBB.
                // CRC32 checksums computed correctly for all chunks.
                const hex =
                  "89504e470d0a1a0a0000000d49484452000000400000" +
                  "00400802000000250be6890000007949444154789ced" +
                  "cf410900300cc0c0fab7340b1355117b1c8340045c66" +
                  "eef93b2f68400b1ad08206b4a0012d68400b1ad08206" +
                  "b4a0012d68400b1ad08206b4a0012d68400b1ad08206" +
                  "b4a0012d68400b1ad08206b4a0012d68400b1ad08206" +
                  "b4a0012d68400b1ad08206b4a0012d68400b1ad08206" +
                  "b4e0ad050ceb71698b8b2a940000000049454e44ae42" +
                  "6082";
                return Buffer.from(hex, "hex");
              }

              /** Small text file for attachment testing. */
              function generateTextFile(): Buffer {
                return Buffer.from(
                  "CARE-Y Safety Plan Template\n\n" +
                    "1. Warning signs that a crisis may be developing\n" +
                    "2. Internal coping strategies\n" +
                    "3. People and social settings that provide distraction\n" +
                    "4. People I can ask for help\n" +
                    "5. Professionals or agencies I can contact during a crisis\n" +
                    "6. Making the environment safe\n",
                  "utf-8",
                );
              }

              const me = ctx.user.id;
              const ticketDefs: TicketDef[] = [
                // --- MY TICKETS (assigned to me) ---
                {
                  title: "Help with housing",
                  description: "Client needs housing referral and support",
                  queue: "Housing",
                  priority: "normal",
                  assignedTo: me,
                  onHold: false,
                  withKeyWrap: true,
                  createdAgo: 4320, // 3 days
                  followUps: [
                    {
                      content: "Assigned to Dev Admin",
                      source: "system",
                      type: "assignment_change",
                      agoMinutes: 4310,
                    },
                    {
                      content: "I need help finding a place to stay",
                      source: "client",
                      agoMinutes: 4300,
                    },
                    {
                      content: "I can look into shelters in your area",
                      source: "volunteer",
                      agoMinutes: 4200,
                    },
                    {
                      content:
                        "Client sounds stressed but stable. Shelter list sent via SMS.",
                      source: "volunteer",
                      type: "internal_note",
                      isPrivate: true,
                      agoMinutes: 4190,
                    },
                    {
                      content: "Thank you, any help is appreciated",
                      source: "client",
                      agoMinutes: 1440,
                    },
                    {
                      content: "Priority changed to high",
                      source: "system",
                      type: "priority_change",
                      agoMinutes: 1430,
                    },
                    {
                      content: "Status changed to closed",
                      source: "system",
                      type: "status_change",
                      agoMinutes: 720,
                    },
                    {
                      content: "Status changed to open",
                      source: "system",
                      type: "status_change",
                      agoMinutes: 360,
                    },
                  ],
                },
                {
                  title: "Follow-up on legal aid referral",
                  description: "Client was referred to legal aid last week",
                  queue: "Intake",
                  priority: "normal",
                  assignedTo: me,
                  onHold: false,
                  withKeyWrap: true,
                  createdAgo: 10080, // 7 days
                  followUps: [
                    {
                      content: "Referred to legal aid org",
                      source: "volunteer",
                      agoMinutes: 10000,
                    },
                    {
                      content: "They said they would call me back",
                      source: "client",
                      agoMinutes: 8640,
                    },
                    {
                      content: "",
                      source: "client",
                      agoMinutes: 7200,
                      media: [
                        {
                          kind: "recording",
                          durationSeconds: 12,
                        },
                      ],
                    },
                    {
                      content: "Still waiting, called again",
                      source: "volunteer",
                      agoMinutes: 5760,
                    },
                    {
                      content: "",
                      source: "client",
                      agoMinutes: 4320,
                      media: [
                        {
                          kind: "image",
                          filename: "photo.png",
                          contentType: "image/png",
                        },
                      ],
                    },
                    {
                      content: "They finally reached out, thank you",
                      source: "client",
                      agoMinutes: 2880,
                    },
                    {
                      content: "Checking in, did the meeting happen?",
                      source: "volunteer",
                      agoMinutes: 1440,
                    },
                  ],
                },
                {
                  title: "Safety planning session",
                  description: "Client requested safety planning support",
                  queue: "Crisis",
                  priority: "high",
                  assignedTo: me,
                  onHold: false,
                  withKeyWrap: true,
                  createdAgo: 180, // 3 hours
                  followUps: [
                    {
                      content: "Assigned to Dev Admin",
                      source: "system",
                      type: "assignment_change",
                      agoMinutes: 175,
                    },
                    {
                      content: "I need to talk about my situation",
                      source: "client",
                      agoMinutes: 170,
                    },
                    {
                      content: "",
                      source: "client",
                      agoMinutes: 165,
                      media: [
                        {
                          kind: "recording",
                          durationSeconds: 47,
                        },
                      ],
                    },
                    {
                      content: "I am here for you. Can you tell me more?",
                      source: "volunteer",
                      agoMinutes: 160,
                    },
                    {
                      content:
                        "High-risk situation. Follow up within 24h per protocol.",
                      source: "volunteer",
                      type: "internal_note",
                      isPrivate: true,
                      agoMinutes: 155,
                    },
                  ],
                },
                {
                  title: "Benefits application help",
                  description: "Assistance with benefits paperwork",
                  queue: "Intake",
                  priority: "low",
                  assignedTo: me,
                  onHold: false,
                  withKeyWrap: true,
                  createdAgo: 20160, // 14 days
                  followUps: [
                    {
                      content: "Need help filling out forms",
                      source: "client",
                      agoMinutes: 20100,
                    },
                  ],
                },
                {
                  title: "Encrypted intake note",
                  description: "Intake note from phone call, key wrap pending",
                  queue: "Intake",
                  priority: "normal",
                  assignedTo: me,
                  onHold: false,
                  withKeyWrap: false, // Tests decryption fallback
                  createdAgo: 60,
                  followUps: [],
                },

                // --- ON HOLD ---
                {
                  title: "Waiting for callback from shelter",
                  description:
                    "Client requested callback when shelter has a bed",
                  queue: "Housing",
                  priority: "normal",
                  assignedTo: me,
                  onHold: true,
                  withKeyWrap: true,
                  createdAgo: 7200, // 5 days
                  followUps: [
                    {
                      content: "Assigned to Dev Admin",
                      source: "system",
                      type: "assignment_change",
                      agoMinutes: 7100,
                    },
                    {
                      content: "Shelter said they will call when a bed opens",
                      source: "volunteer",
                      agoMinutes: 5760,
                    },
                    {
                      content: "Put on hold",
                      source: "system",
                      type: "hold_change",
                      agoMinutes: 5750,
                    },
                    {
                      content: "Still no word from them",
                      source: "client",
                      agoMinutes: 2880,
                    },
                    {
                      content:
                        "Called shelter again, they have a long waitlist. Documented in case file.",
                      source: "volunteer",
                      type: "internal_note",
                      isPrivate: true,
                      agoMinutes: 2000,
                    },
                  ],
                },
                {
                  title: "Pending court date documentation",
                  description: "Need documents before next court appearance",
                  queue: "Intake",
                  priority: "high",
                  assignedTo: me,
                  onHold: true,
                  withKeyWrap: true,
                  createdAgo: 14400, // 10 days
                  followUps: [
                    {
                      content: "Assigned to Dev Admin",
                      source: "system",
                      type: "assignment_change",
                      agoMinutes: 14350,
                    },
                    {
                      content: "Court date is in two weeks, need letter",
                      source: "client",
                      agoMinutes: 14300,
                    },
                    {
                      content: "Working on getting the documentation together",
                      source: "volunteer",
                      agoMinutes: 10080,
                    },
                    {
                      content: "Attached the safety plan template for review",
                      source: "volunteer",
                      agoMinutes: 10070,
                      media: [
                        {
                          kind: "file",
                          filename: "safety-plan-template.txt",
                          contentType: "text/plain",
                        },
                      ],
                    },
                    {
                      content: "Put on hold",
                      source: "system",
                      type: "hold_change",
                      agoMinutes: 8640,
                    },
                    {
                      content:
                        "Waiting on court clerk response. Will check back Monday.",
                      source: "volunteer",
                      type: "internal_note",
                      isPrivate: true,
                      agoMinutes: 8630,
                    },
                  ],
                },

                // --- UNASSIGNED ---
                {
                  title: "Emergency referral needed",
                  description: "Urgent case flagged by intake volunteer",
                  queue: "Crisis",
                  priority: "urgent",
                  assignedTo: null,
                  onHold: false,
                  withKeyWrap: true,
                  createdAgo: 45, // 45 minutes ago
                  followUps: [
                    {
                      content: "Please help, I am in danger",
                      source: "client",
                      agoMinutes: 40,
                    },
                  ],
                },
                {
                  title:
                    "Emergency referral needed for client who is in immediate danger and requires relocation assistance as well as legal representation for upcoming court hearing",
                  description: "Multi-service coordination case",
                  queue: "Crisis",
                  priority: "high",
                  assignedTo: null,
                  onHold: false,
                  withKeyWrap: true,
                  createdAgo: 90,
                  followUps: [
                    {
                      content:
                        "I need help with everything, I do not know where to start",
                      source: "client",
                      agoMinutes: 85,
                    },
                  ],
                },
                {
                  title: "New intake call",
                  description: "Voicemail received, needs triage",
                  queue: "Intake",
                  priority: "normal",
                  assignedTo: null,
                  onHold: false,
                  withKeyWrap: true,
                  createdAgo: 120, // 2 hours
                  followUps: [],
                },
                {
                  title: "Relocation assistance request",
                  description: "Client needs help with relocation planning",
                  queue: "Housing",
                  priority: "high",
                  assignedTo: null,
                  onHold: false,
                  withKeyWrap: true,
                  createdAgo: 360, // 6 hours
                  followUps: [
                    {
                      content: "I need to move but I do not know where to go",
                      source: "client",
                      agoMinutes: 350,
                    },
                  ],
                },
                {
                  title: "Transportation to appointment",
                  description: "Client needs ride to medical appointment",
                  queue: "Intake",
                  priority: "normal",
                  assignedTo: null,
                  onHold: false,
                  withKeyWrap: true,
                  createdAgo: 2880, // 2 days
                  followUps: [
                    {
                      content: "I have a doctor appointment next week",
                      source: "client",
                      agoMinutes: 2800,
                    },
                    {
                      content: "Can someone help me get there?",
                      source: "client",
                      agoMinutes: 1440,
                    },
                  ],
                },
                {
                  title: "Food bank referral",
                  description: "Client asking about food assistance",
                  queue: "Intake",
                  priority: "low",
                  assignedTo: null,
                  onHold: false,
                  withKeyWrap: true,
                  createdAgo: 480, // 8 hours
                  followUps: [
                    {
                      content: "Where can I get groceries?",
                      source: "client",
                      agoMinutes: 470,
                    },
                  ],
                },
              ];

              // Generate additional tickets programmatically to test
              // virtual scrolling with large lists. Uses a simple
              // deterministic seed so re-runs produce the same data.
              const GENERATED_COUNT = 106; // 14 handcrafted + 106 = 120 total
              const queuesArr = ["Intake", "Crisis", "Housing"] as const;
              const priorities: TicketPriority[] = [
                "low",
                "normal",
                "normal",
                "high",
                "urgent",
              ];
              const titlePrefixes = [
                "Referral request",
                "Follow-up needed",
                "New intake call",
                "Callback requested",
                "Documentation help",
                "Transportation need",
                "Safety concern",
                "Benefits question",
                "Housing inquiry",
                "Medical appointment",
                "Legal consultation",
                "Emergency contact",
                "Resource request",
                "Check-in call",
                "Outreach follow-up",
              ];
              const clientMessages = [
                "I need some help please",
                "Can someone call me back?",
                "I have a question about my case",
                "When is my next appointment?",
                "I wanted to follow up on our last conversation",
                "Is there anyone available to talk?",
                "I have new information to share",
                "Things have changed since we last spoke",
              ];
              const volMessages = [
                "I will look into this for you",
                "Checking with the team now",
                "Left a voicemail, will try again tomorrow",
                "Referred to partner organization",
                "Scheduled follow-up for next week",
                "Updated case notes with new info",
              ];

              // Simple deterministic hash for reproducible "random" values.
              function seedHash(i: number, salt: number): number {
                let h = (i * 2654435761 + salt * 40503) >>> 0;
                h = ((h ^ (h >>> 16)) * 2246822507) >>> 0;
                h = ((h ^ (h >>> 13)) * 3266489909) >>> 0;
                return (h ^ (h >>> 16)) >>> 0;
              }

              for (let g = 0; g < GENERATED_COUNT; g++) {
                const h0 = seedHash(g, 0);
                const h1 = seedHash(g, 1);
                const h2 = seedHash(g, 2);
                const h3 = seedHash(g, 3);
                const h4 = seedHash(g, 4);

                const queue = queuesArr[h0 % queuesArr.length];
                const priority = priorities[h1 % priorities.length];
                const prefix = titlePrefixes[h2 % titlePrefixes.length];
                if (
                  queue === undefined ||
                  priority === undefined ||
                  prefix === undefined
                )
                  continue;
                const suffix = String(g + 1).padStart(3, "0");

                // 40% assigned to me, 60% unassigned
                const assigned = h3 % 5 < 2 ? me : null;
                // 15% on hold (only if assigned)
                const hold = assigned !== null && h4 % 7 === 0;

                // Created 30 min to 30 days ago
                const ageMinutes = 30 + (h0 % 43200);

                // 0-4 follow-ups (first generated ticket gets 180 for pagination/feature testing)
                const fuCount = g === 0 ? 180 : h1 % 5;
                const followUps: FollowUpDef[] = [];

                if (g === 0) {
                  // 180 follow-ups matching production data shapes.
                  // Client media (MMS/voicemail): no filename (Twilio
                  // doesn't provide one). Volunteer attachments: filename
                  // (picked from device). Voicemail content: empty or
                  // transcription. System events: exact server strings.
                  const totalAge = ageMinutes;
                  for (let f = 0; f < 180; f++) {
                    const fuAge = Math.max(
                      1,
                      totalAge - Math.floor((totalAge * (f + 1)) / 181),
                    );
                    const fh = seedHash(0, 10 + f);
                    const isClient = fh % 2 === 0;
                    const msgs = isClient ? clientMessages : volMessages;

                    if (f === 3) {
                      followUps.push({
                        content: "Assigned to Alice",
                        source: "system",
                        type: "assignment_change",
                        agoMinutes: fuAge,
                      });
                    } else if (f === 10) {
                      followUps.push({
                        content: "Priority changed to high",
                        source: "system",
                        type: "priority_change",
                        agoMinutes: fuAge,
                      });
                    } else if (f === 20) {
                      followUps.push({
                        content: "Put on hold",
                        source: "system",
                        type: "hold_change",
                        agoMinutes: fuAge,
                      });
                    } else if (f === 30) {
                      followUps.push({
                        content: "Status changed to closed",
                        source: "system",
                        type: "status_change",
                        agoMinutes: fuAge,
                      });
                    } else if (f === 31) {
                      followUps.push({
                        content: "Status changed to open",
                        source: "system",
                        type: "status_change",
                        agoMinutes: fuAge,
                      });
                    } else if (f === 40) {
                      followUps.push({
                        content: "Assigned to Bob",
                        source: "system",
                        type: "assignment_change",
                        agoMinutes: fuAge,
                      });
                    } else if (f === 5 || f === 55 || f === 120) {
                      const noteText =
                        f === 5
                          ? "Client seems anxious, approach carefully"
                          : f === 55
                            ? "Coordinating with housing team on this"
                            : "Supervisor reviewed, approved next steps";
                      followUps.push({
                        content: noteText,
                        source: "volunteer",
                        type: "internal_note",
                        isPrivate: true,
                        agoMinutes: fuAge,
                      });
                    } else if (f === 8) {
                      // Client voicemail (inbound call, no transcription)
                      followUps.push({
                        content: "",
                        source: "client",
                        agoMinutes: fuAge,
                        media: [{ kind: "recording", durationSeconds: 12 }],
                      });
                    } else if (f === 25) {
                      // Volunteer voicemail (outbound call)
                      followUps.push({
                        content: "",
                        source: "volunteer",
                        agoMinutes: fuAge,
                        media: [{ kind: "recording", durationSeconds: 30 }],
                      });
                    } else if (f === 65) {
                      // Client voicemail with transcription
                      followUps.push({
                        content:
                          "Hi, I wanted to talk about the appointment next week, I am not sure I can make it because my ride fell through and I need to figure out another way to get there",
                        source: "client",
                        agoMinutes: fuAge,
                        media: [{ kind: "recording", durationSeconds: 90 }],
                      });
                    } else if (f === 12) {
                      // Client MMS image only (no text, no filename from Twilio)
                      followUps.push({
                        content: "",
                        source: "client",
                        agoMinutes: fuAge,
                        media: [{ kind: "image", contentType: "image/jpeg" }],
                      });
                    } else if (f === 35) {
                      // Client MMS image with text body
                      followUps.push({
                        content:
                          "Here is a photo of the document you asked for",
                        source: "client",
                        agoMinutes: fuAge,
                        media: [{ kind: "image", contentType: "image/jpeg" }],
                      });
                    } else if (f === 50) {
                      // Volunteer sends image (from device, has filename)
                      followUps.push({
                        content: "Attached the resource guide",
                        source: "volunteer",
                        agoMinutes: fuAge,
                        media: [
                          {
                            kind: "image",
                            filename: "resource-guide.jpg",
                            contentType: "image/jpeg",
                          },
                        ],
                      });
                    } else if (f === 15) {
                      // Client file via MMS (no filename from Twilio)
                      followUps.push({
                        content: "",
                        source: "client",
                        agoMinutes: fuAge,
                        media: [
                          { kind: "file", contentType: "application/pdf" },
                        ],
                      });
                    } else if (f === 45) {
                      // Volunteer file (from device, has filename)
                      followUps.push({
                        content: "Here are the referral instructions",
                        source: "volunteer",
                        agoMinutes: fuAge,
                        media: [
                          {
                            kind: "file",
                            filename: "referral-instructions.docx",
                            contentType:
                              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                          },
                        ],
                      });
                    } else if (f === 100) {
                      // Client MMS with multiple media (no filenames)
                      followUps.push({
                        content: "",
                        source: "client",
                        agoMinutes: fuAge,
                        media: [
                          { kind: "image", contentType: "image/png" },
                          { kind: "file", contentType: "application/pdf" },
                        ],
                      });
                    } else {
                      const msg = msgs[fh % msgs.length] ?? "Message";
                      followUps.push({
                        content: msg,
                        source: isClient ? "client" : "volunteer",
                        agoMinutes: fuAge,
                      });
                    }
                  }
                } else {
                  for (let f = 0; f < fuCount; f++) {
                    const fh = seedHash(g, 10 + f);
                    const isClient = fh % 2 === 0;
                    const msgs = isClient ? clientMessages : volMessages;
                    const msg = msgs[fh % msgs.length] ?? "Message";
                    // Space follow-ups evenly within the ticket's age
                    const fuAge = Math.max(
                      1,
                      ageMinutes -
                        Math.floor((ageMinutes * (f + 1)) / (fuCount + 1)),
                    );
                    followUps.push({
                      content: msg,
                      source: isClient ? "client" : "volunteer",
                      agoMinutes: fuAge,
                    });
                  }
                }

                ticketDefs.push({
                  title: `${prefix} #${suffix}`,
                  description: `Generated test ticket ${suffix}`,
                  queue,
                  priority,
                  assignedTo: assigned,
                  onHold: hold,
                  withKeyWrap: true,
                  createdAgo: ageMinutes,
                  followUps,
                });
              }

              const createdIds: string[] = [];
              const encoder = new TextEncoder();

              for (let i = 0; i < ticketDefs.length; i++) {
                const def = ticketDefs.at(i);
                if (!def) continue;
                const client = clients.at(i % clients.length);
                if (!client) continue;
                const clientId = client.id;

                const qId = queueMap.get(def.queue);
                if (qId === undefined) {
                  throw new Error(
                    `Queue "${def.queue}" not found. Run seed first.`,
                  );
                }

                // Idempotency: skip if ticket already exists for this client
                const existing = await tDb
                  .selectFrom("tickets")
                  .select("id")
                  .where("client_id", "=", clientId)
                  .executeTakeFirst();

                if (existing) {
                  createdIds.push(existing.id);
                  continue;
                }

                // Generate ticket key and encrypt content
                const tk = generateContentKey();
                const encryptedTitle = encryptContent(
                  encoder.encode(def.title),
                  tk,
                );
                const encryptedDescription = encryptContent(
                  encoder.encode(def.description),
                  tk,
                );

                const keyGeneration = crypto.randomUUID();
                const createdAt = minutesAgo(def.createdAgo);

                const ticket = await tDb
                  .insertInto("tickets")
                  .values({
                    client_id: clientId,
                    queue_id: qId,
                    encrypted_title: Buffer.from(encryptedTitle),
                    encrypted_description: Buffer.from(encryptedDescription),
                    key_generation: keyGeneration,
                    assigned_to: def.assignedTo,
                    on_hold: def.onHold,
                    priority: def.priority,
                    created_at: createdAt,
                  })
                  .returning("id")
                  .executeTakeFirstOrThrow();

                // Create ECIES key wrap
                if (def.withKeyWrap) {
                  const wrap = eciesEncrypt(tk, volPublic);
                  await tDb
                    .insertInto("ticket_key_wraps")
                    .values({
                      ticket_id: ticket.id,
                      volunteer_id: ctx.user.id,
                      key_generation: keyGeneration,
                      ephemeral_point: Buffer.from(wrap.ephemeralPoint),
                      nonce: Buffer.from(wrap.nonce),
                      wrapped_key: Buffer.from(wrap.ciphertext),
                      algorithm: "ecies-ristretto255-v1",
                    })
                    .execute();
                }

                // Create follow-ups (encrypted with same ticket key)
                for (const fu of def.followUps) {
                  const encryptedContent = encryptContent(
                    encoder.encode(fu.content),
                    tk,
                  );
                  const followUp = await tDb
                    .insertInto("followups")
                    .values({
                      ticket_id: ticket.id,
                      source: fu.source,
                      type: fu.type ?? "message",
                      is_private: fu.isPrivate ?? false,
                      encrypted_content: Buffer.from(encryptedContent),
                      created_at: minutesAgo(fu.agoMinutes),
                    })
                    .returning("id")
                    .executeTakeFirstOrThrow();

                  // Create media records (encrypted blobs stored in BlobStore)
                  if (fu.media && def.withKeyWrap) {
                    for (const media of fu.media) {
                      if (media.kind === "recording") {
                        const raw = generateWav(media.durationSeconds ?? 5);
                        const encrypted = encryptContent(raw, tk);
                        const blobKey = await deps.blobStore.put(
                          ctx.org.orgSchema,
                          "recording",
                          Buffer.from(encrypted),
                        );
                        await tDb
                          .insertInto("recordings")
                          .values({
                            ticket_id: ticket.id,
                            followup_id: followUp.id,
                            blob_key: blobKey,
                            size_bytes: encrypted.byteLength,
                            duration_seconds: media.durationSeconds ?? null,
                            created_at: minutesAgo(fu.agoMinutes),
                          })
                          .execute();
                      } else {
                        // image or file attachment
                        const raw =
                          media.kind === "image"
                            ? generatePng()
                            : generateTextFile();
                        const encrypted = encryptContent(raw, tk);
                        const category = "attachment" as const;
                        const blobKey = await deps.blobStore.put(
                          ctx.org.orgSchema,
                          category,
                          Buffer.from(encrypted),
                        );
                        const encFilename =
                          media.filename !== undefined
                            ? Buffer.from(
                                encryptContent(
                                  encoder.encode(media.filename),
                                  tk,
                                ),
                              )
                            : null;
                        await tDb
                          .insertInto("attachments")
                          .values({
                            ticket_id: ticket.id,
                            followup_id: followUp.id,
                            blob_key: blobKey,
                            size_bytes: encrypted.byteLength,
                            encrypted_filename: encFilename,
                            content_type: media.contentType ?? null,
                            created_at: minutesAgo(fu.agoMinutes),
                          })
                          .execute();
                      }
                    }
                  }
                }

                createdIds.push(ticket.id);
              }

              return { ticketIds: createdIds };
            }),
          ),
        }
      : {}),
  });
}
