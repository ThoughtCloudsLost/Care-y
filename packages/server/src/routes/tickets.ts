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
import type { TicketService } from "../tickets/ticket-service.js";
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
import type { NotificationService } from "../notifications/service.js";
import type { AuditEntry } from "../tickets/audit.js";
import type { NotificationEventType } from "@care-y/shared";
import { buildRecipientList } from "../tickets/notification-recipients.js";
import type { ShiftProvider } from "../tickets/shift-provider.js";
import { createStubShiftProvider } from "../tickets/shift-provider.js";
import {
  createTicketInputSchema,
  updateTicketInputSchema,
  ticketListInputSchema,
  createFollowUpInputSchema,
  followUpListInputSchema,
  markReadInputSchema,
  createPresetReplyInputSchema,
  updatePresetReplyInputSchema,
  addDependencyInputSchema,
  mergeClientsInputSchema,
  undoMergeInputSchema,
  createQueueInputSchema,
  updateQueueInputSchema,
  assignTicketInputSchema,
  takeTicketInputSchema,
  releaseTicketInputSchema,
  watchTicketInputSchema,
  queueWatcherInputSchema,
  queueAssignmentInputSchema,
  metadataSearchInputSchema,
  contentSearchInputSchema,
  auditLogQueryInputSchema,
} from "@care-y/shared";

export interface TicketRouterDeps {
  readonly blobStore: BlobStore;
  readonly createTicketAccess: (
    tDb: OrgContext["tenantDb"],
  ) => TicketAccessChecker;
  readonly createTicketSvc: (
    tDb: OrgContext["tenantDb"],
    access: TicketAccessChecker,
  ) => TicketService;
  readonly createFollowUpSvc: (
    tDb: OrgContext["tenantDb"],
    access: TicketAccessChecker,
  ) => FollowUpService;
  readonly createMergeSvc: (tDb: OrgContext["tenantDb"]) => MergeService;
  readonly createPresetSvc: (tDb: OrgContext["tenantDb"]) => PresetService;
  readonly createDependencySvc: (
    tDb: OrgContext["tenantDb"],
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
  // Search + audit (optional, injected by 5d wiring)
  readonly createSearchSvc?: (tDb: OrgContext["tenantDb"]) => SearchService;
  readonly createAuditSvc?: (tDb: OrgContext["tenantDb"]) => AuditService;
  // Notification dispatch (optional, injected by 5d wiring)
  readonly notificationService?: NotificationService;
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
  // Audit helper: best-effort, never blocks. No-op when audit service not injected.
  function audit(tDb: OrgContext["tenantDb"], entry: AuditEntry): void {
    if (!deps.createAuditSvc) return;
    const svc = deps.createAuditSvc(tDb);
    void svc.log(entry);
  }

  // Notification dispatch helper: best-effort, never blocks.
  // Builds recipient list and dispatches across all channels.
  function notify(
    ctx: { org: OrgContext; user: { id: string } },
    eventType: NotificationEventType,
    ticket: { id: string; queueId: string; assignedTo: string | null },
    queueName: string,
    mentionedPseudonyms: string[] = [],
  ): void {
    if (!deps.notificationService) return;
    const ns = deps.notificationService;
    const tDb = ctx.org.tenantDb;
    const access = deps.createTicketAccess(tDb);
    const watchers = deps.createWatchersSvc(tDb, access);

    void (async () => {
      try {
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
        );
        await ns.dispatch(
          tDb,
          ctx.org.orgId,
          ctx.org.orgSlug,
          eventType,
          ticket.id,
          queueName,
          recipients,
        );
      } catch (err: unknown) {
        // Notification failures are non-critical. Never block the response.
        // Log the error type without any PII (no ticket content, no names).
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
        const access = deps.createTicketAccess(ctx.org.tenantDb);
        const svc = deps.createTicketSvc(ctx.org.tenantDb, access);
        const ticket = await svc.create(ctx.user.id, {
          clientId: input.clientId,
          queueId: input.queueId,
          encryptedTitle: Buffer.from(input.encryptedTitle, "base64"),
          encryptedDescription: Buffer.from(
            input.encryptedDescription,
            "base64",
          ),
          priority: input.priority,
          keyGeneration: input.keyGeneration,
        });
        audit(ctx.org.tenantDb, {
          eventType: "ticket_created",
          actorId: ctx.user.id,
          ticketId: ticket.id,
        });
        const queueName = await deps
          .createQueueSvc(ctx.org.tenantDb)
          .getQueueName(ticket.queueId);
        notify(ctx, "ticket_created", ticket, queueName);
        return ticket;
      }),
    ),

    get: volunteerProcedure.input(z.object({ ticketId: z.uuid() })).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const access = deps.createTicketAccess(ctx.org.tenantDb);
        const svc = deps.createTicketSvc(ctx.org.tenantDb, access);
        return svc.findById(input.ticketId, ctx.user.id);
      }),
    ),

    list: volunteerProcedure.input(ticketListInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const access = deps.createTicketAccess(ctx.org.tenantDb);
        const svc = deps.createTicketSvc(ctx.org.tenantDb, access);
        return svc.list(input);
      }),
    ),

    update: volunteerProcedure.input(updateTicketInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const access = deps.createTicketAccess(ctx.org.tenantDb);
        const svc = deps.createTicketSvc(ctx.org.tenantDb, access);
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
        const access = deps.createTicketAccess(ctx.org.tenantDb);
        const svc = deps.createTicketSvc(ctx.org.tenantDb, access);
        const ticket = await svc.close(ctx.user.id, input.ticketId);
        audit(ctx.org.tenantDb, {
          eventType: "ticket_closed",
          actorId: ctx.user.id,
          ticketId: input.ticketId,
        });
        const queueName = await deps
          .createQueueSvc(ctx.org.tenantDb)
          .getQueueName(ticket.queueId);
        notify(ctx, "ticket_closed", ticket, queueName);
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
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createTicketSvc(ctx.org.tenantDb, access);
          const ticket = await svc.reopen(
            ctx.user.id,
            input.ticketId,
            input.newKeyGeneration,
          );
          audit(ctx.org.tenantDb, {
            eventType: "ticket_reopened",
            actorId: ctx.user.id,
            ticketId: input.ticketId,
          });
          const queueName = await deps
            .createQueueSvc(ctx.org.tenantDb)
            .getQueueName(ticket.queueId);
          notify(ctx, "ticket_reopened", ticket, queueName);
          return ticket;
        }),
      ),

    // --- Follow-ups ---
    createFollowUp: volunteerProcedure
      .input(createFollowUpInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createFollowUpSvc(ctx.org.tenantDb, access);
          const followUp = await svc.create(ctx.user.id, {
            ticketId: input.ticketId,
            encryptedContent: Buffer.from(input.encryptedContent, "base64"),
            encryptedReadState: Buffer.from(input.encryptedReadState, "base64"),
            source: input.source,
            type: input.type,
            isPrivate: input.isPrivate,
            mentionedPseudonyms: input.mentionedPseudonyms,
          });
          audit(ctx.org.tenantDb, {
            eventType: "followup_added",
            actorId: ctx.user.id,
            ticketId: input.ticketId,
          });
          // Look up ticket for notification context
          const ticketSvc = deps.createTicketSvc(ctx.org.tenantDb, access);
          const ticket = await ticketSvc.findById(input.ticketId, ctx.user.id);
          const queueName = await deps
            .createQueueSvc(ctx.org.tenantDb)
            .getQueueName(ticket.queueId);
          const eventType =
            input.mentionedPseudonyms.length > 0 ? "mention" : "followup_added";
          notify(ctx, eventType, ticket, queueName, input.mentionedPseudonyms);
          return followUp;
        }),
      ),

    listFollowUps: volunteerProcedure.input(followUpListInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const access = deps.createTicketAccess(ctx.org.tenantDb);
        const svc = deps.createFollowUpSvc(ctx.org.tenantDb, access);
        return svc.listByTicket(ctx.user.id, input.ticketId, {
          limit: input.limit,
          cursor: input.cursor,
        });
      }),
    ),

    markRead: volunteerProcedure.input(markReadInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const access = deps.createTicketAccess(ctx.org.tenantDb);
        const svc = deps.createFollowUpSvc(ctx.org.tenantDb, access);
        await svc.markRead(
          ctx.user.id,
          input.followUpId,
          Buffer.from(input.encryptedReadState, "base64"),
        );
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
        const svc = deps.createDependencySvc(ctx.org.tenantDb);
        return svc.add(input.ticketId, input.dependsOnTicketId);
      }),
    ),

    removeDependency: volunteerProcedure
      .input(addDependencyInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createDependencySvc(ctx.org.tenantDb);
          await svc.remove(input.ticketId, input.dependsOnTicketId);
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
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createMediaSvc(
            ctx.org.tenantDb,
            deps.blobStore,
            access,
          );
          return svc.getRecording(ctx.user.id, input.recordingId);
        }),
      ),

    getAttachment: volunteerProcedure
      .input(z.object({ attachmentId: z.uuid() }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createMediaSvc(
            ctx.org.tenantDb,
            deps.blobStore,
            access,
          );
          return svc.getAttachment(ctx.user.id, input.attachmentId);
        }),
      ),

    listRecordings: volunteerProcedure
      .input(z.object({ ticketId: z.uuid() }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createMediaSvc(
            ctx.org.tenantDb,
            deps.blobStore,
            access,
          );
          return svc.listRecordings(ctx.user.id, input.ticketId);
        }),
      ),

    listAttachments: volunteerProcedure
      .input(z.object({ ticketId: z.uuid() }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createMediaSvc(
            ctx.org.tenantDb,
            deps.blobStore,
            access,
          );
          return svc.listAttachments(ctx.user.id, input.ticketId);
        }),
      ),

    // --- Queues ---
    createQueue: adminProcedure.input(createQueueInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createQueueSvc(ctx.org.tenantDb);
        const queue = await svc.create(input);
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
        // care-y-ignore-next-line route-delegates-to-service -- delegates to svc.update; field extraction from validated input, not business logic
        const queue = await svc.update(input.queueId, {
          name: input.name,
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

    // --- Assignment ---
    assign: volunteerProcedure.input(assignTicketInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const access = deps.createTicketAccess(ctx.org.tenantDb);
        const qp = deps.createQueuePermissionsSvc(ctx.org.tenantDb);
        const shift = createStubShiftProvider(async (qId) =>
          qp.getQueueMembers(qId),
        );
        const svc = deps.createAssignmentSvc(ctx.org.tenantDb, access, shift);
        const result = await svc.assignRoundRobin(input.ticketId);
        if (result.assignedTo !== null) {
          audit(ctx.org.tenantDb, {
            eventType: "ticket_assigned",
            actorId: ctx.user.id,
            ticketId: input.ticketId,
            metadata: { assignedTo: result.assignedTo },
          });
          const ticketSvc = deps.createTicketSvc(ctx.org.tenantDb, access);
          const ticket = await ticketSvc.findById(input.ticketId, ctx.user.id);
          const queueName = await deps
            .createQueueSvc(ctx.org.tenantDb)
            .getQueueName(ticket.queueId);
          notify(ctx, "ticket_assigned", ticket, queueName);
        }
        return result;
      }),
    ),

    take: volunteerProcedure.input(takeTicketInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const access = deps.createTicketAccess(ctx.org.tenantDb);
        const qp = deps.createQueuePermissionsSvc(ctx.org.tenantDb);
        const shift = createStubShiftProvider(async (qId) =>
          qp.getQueueMembers(qId),
        );
        const svc = deps.createAssignmentSvc(ctx.org.tenantDb, access, shift);
        await svc.take(ctx.user.id, input.ticketId);
        audit(ctx.org.tenantDb, {
          eventType: "ticket_assigned",
          actorId: ctx.user.id,
          ticketId: input.ticketId,
          metadata: { assignedTo: ctx.user.id },
        });
        const ticketSvc = deps.createTicketSvc(ctx.org.tenantDb, access);
        const ticket = await ticketSvc.findById(input.ticketId, ctx.user.id);
        const queueName = await deps
          .createQueueSvc(ctx.org.tenantDb)
          .getQueueName(ticket.queueId);
        notify(ctx, "ticket_assigned", ticket, queueName);
      }),
    ),

    release: volunteerProcedure.input(releaseTicketInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const access = deps.createTicketAccess(ctx.org.tenantDb);
        const qp = deps.createQueuePermissionsSvc(ctx.org.tenantDb);
        const shift = createStubShiftProvider(async (qId) =>
          qp.getQueueMembers(qId),
        );
        const svc = deps.createAssignmentSvc(ctx.org.tenantDb, access, shift);
        await svc.release(ctx.user.id, input.ticketId);
        audit(ctx.org.tenantDb, {
          eventType: "ticket_assigned",
          actorId: ctx.user.id,
          ticketId: input.ticketId,
          metadata: { assignedTo: null },
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

    // --- Metadata search (injected by 5d wiring) ---
    ...(deps.createSearchSvc ? buildSearchRoutes(deps.createSearchSvc) : {}),

    // --- Audit log query (manager+ only, injected by 5d wiring) ---
    ...(deps.createAuditSvc ? buildAuditRoutes(deps.createAuditSvc) : {}),
  });
}
