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
import { getEnv } from "../env.js";
import {
  router,
  authedProcedure,
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
  TicketServiceDeps,
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
import type { NotificationEventType, ReactionSummary } from "@care-y/shared";
import { ErrorCode, meetsRoleThreshold } from "@care-y/shared";
import { ForbiddenError, NotFoundError } from "../errors.js";
import {
  buildRecipientList,
  resolveEscalationTargets,
} from "../tickets/notification-recipients.js";
import type { ShiftProvider } from "../tickets/shift-provider.js";
import { createStubShiftProvider } from "../tickets/shift-provider.js";
import { createUserService } from "../users/user-service.js";
import { encode as cryptoEncode } from "@care-y/crypto";
import { rewrapFollowUp } from "../tickets/rewrap-service.js";
import {
  createTicketInputSchema,
  resolveCreateTargetInputSchema,
  updateTicketInputSchema,
  ticketListInputSchema,
  recentFollowUpsInputSchema,
  listReadStateInputSchema,
  sweepReadStateInputSchema,
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
    deps?: TicketServiceDeps,
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
      {
        pendingClients: deps.pendingClients,
        fieldEncryptor: deps.fieldEncryptor,
      },
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
          ctx.org.orgSchema,
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
          id: input.id,
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

    // What ticket a create for this client will land on: an open ticket
    // blocks the create, a closed one is reopened under its existing id.
    // The client needs the target id before encrypting because the AAD
    // binds it (ADR-053).
    resolveCreateTarget: volunteerProcedure
      .input(resolveCreateTargetInputSchema)
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const { svc } = ticketSvc(ctx.org.tenantDb);
          return svc.getCreateTarget(input.clientId);
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

    listReadState: volunteerProcedure.input(listReadStateInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const { svc } = ticketSvc(ctx.org.tenantDb);
        return svc.listReadState(ctx.user.id, input);
      }),
    ),

    readStateSweep: volunteerProcedure.input(sweepReadStateInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const { svc } = ticketSvc(ctx.org.tenantDb);
        return svc.sweepReadState(ctx.user.id, input);
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
        const { svc } = ticketSvc(ctx.org.tenantDb);
        return svc.searchClients(input.query, input.limit);
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
            id: input.id,
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
        const result = await svc.undoMerge({
          mergeEventId: input.mergeEventId,
          encryptedSnapshot: Buffer.from(input.encryptedSnapshot, "base64"),
        });
        audit(ctx.org.tenantDb, {
          eventType: "merge_undone",
          actorId: ctx.user.id,
          metadata: { mergeEventId: input.mergeEventId },
        });
        return result;
      }),
    ),

    lockMerge: managerProcedure
      .input(z.object({ mergeEventId: z.uuid(), locked: z.boolean() }))
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createMergeSvc(ctx.org.tenantDb);
          await svc.setUndoLock(input.mergeEventId, input.locked);
          audit(ctx.org.tenantDb, {
            eventType: "merge_lock_changed",
            actorId: ctx.user.id,
            metadata: {
              mergeEventId: input.mergeEventId,
              locked: input.locked,
            },
          });
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
          encryptedColor: Buffer.from(input.encryptedColor, "base64"),
          encryptedIcon: Buffer.from(input.encryptedIcon, "base64"),
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
          encryptedColor:
            input.encryptedColor !== undefined
              ? Buffer.from(input.encryptedColor, "base64")
              : undefined,
          encryptedIcon:
            input.encryptedIcon !== undefined
              ? Buffer.from(input.encryptedIcon, "base64")
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
    ...(getEnv().NODE_ENV === "development"
      ? {
          devSeedTickets: authedProcedure
            .input(
              z.object({ handcraftedOnly: z.boolean().optional() }).optional(),
            )
            .mutation(
              withErrorWrapping(async ({ ctx, input }) => {
                const { seedTestTickets } =
                  await import("../dev/seed-tickets.js");
                return seedTestTickets(
                  ctx.org.tenantDb,
                  deps.blobStore,
                  ctx.user.id,
                  ctx.org.orgSchema,
                  { handcraftedOnly: input?.handcraftedOnly },
                );
              }),
            ),
        }
      : {}),
  });
}
