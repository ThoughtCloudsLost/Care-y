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
  generateContentKey,
  encryptContent,
  eciesEncrypt,
  toRistrettoPoint,
} from "@care-y/crypto";
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
    getAccessibleQueueIds: (userId: string) => Promise<readonly string[]>,
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
  // Per-request ticket service factory. Wires access checker + queue scoping
  // so every handler gets a correctly-scoped service without repeating the setup.
  function ticketSvc(tDb: OrgContext["tenantDb"]): {
    access: TicketAccessChecker;
    svc: TicketService;
  } {
    const access = deps.createTicketAccess(tDb);
    const qps = deps.createQueuePermissionsSvc(tDb);
    const svc = deps.createTicketSvc(tDb, access, async (userId) =>
      qps.getUserQueues(userId),
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

  // Audit helper: best-effort, never blocks. No-op when audit service not injected.
  function audit(tDb: OrgContext["tenantDb"], entry: AuditEntry): void {
    if (!deps.createAuditSvc) return;
    const svc = deps.createAuditSvc(tDb);
    void svc.log(entry);
  }

  /**
   * Resolves the queue name for a ticket. Used by audit+notify flows.
   */
  async function resolveQueueName(
    tDb: OrgContext["tenantDb"],
    queueId: string,
  ): Promise<string> {
    return deps.createQueueSvc(tDb).getQueueName(queueId);
  }

  /**
   * Combined audit + notification for ticket lifecycle events.
   * Logs the audit entry, resolves queue name, dispatches notification.
   * All steps are best-effort (never blocks the response).
   */
  function auditAndNotify(
    ctx: { org: OrgContext; user: { id: string } },
    eventType: NotificationEventType,
    ticket: { id: string; queueId: string; assignedTo: string | null },
    auditEntry: AuditEntry,
    mentionedPseudonyms: string[] = [],
  ): void {
    audit(ctx.org.tenantDb, auditEntry);
    void resolveQueueName(ctx.org.tenantDb, ticket.queueId).then(
      (queueName) => {
        notify(ctx, eventType, ticket, queueName, mentionedPseudonyms);
      },
    );
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
        const { svc } = ticketSvc(ctx.org.tenantDb);
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
        const { svc } = ticketSvc(ctx.org.tenantDb);
        const ticket = await svc.close(ctx.user.id, input.ticketId);
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
          );
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

    listRecordings: volunteerProcedure
      .input(z.object({ ticketId: z.uuid() }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = mediaSvc(ctx.org.tenantDb);
          return svc.listRecordings(ctx.user.id, input.ticketId);
        }),
      ),

    listAttachments: volunteerProcedure
      .input(z.object({ ticketId: z.uuid() }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = mediaSvc(ctx.org.tenantDb);
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
              "q.name as queueName",
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

        const rows = await tDb
          .selectFrom("queues as q")
          .leftJoin("tickets as t", (join) =>
            join.onRef("t.queue_id", "=", "q.id").on("t.status", "=", "open"),
          )
          .select(["q.id", "q.name"])
          .select((eb) => eb.fn.count<string>("t.id").as("openCount"))
          .where("q.id", "in", queueIds)
          .where("q.is_active", "=", true)
          .groupBy(["q.id", "q.name"])
          .orderBy("q.name", "asc")
          .execute();

        return rows;
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

    // --- Metadata search (injected by 5d wiring) ---
    ...(deps.createSearchSvc ? buildSearchRoutes(deps.createSearchSvc) : {}),

    // --- Audit log query (manager+ only, injected by 5d wiring) ---
    ...(deps.createAuditSvc ? buildAuditRoutes(deps.createAuditSvc) : {}),

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
              const queues = await tDb
                .selectFrom("queues")
                .select(["id", "name"])
                .where("name", "in", ["Intake", "Crisis", "Housing"])
                .execute();
              const queueMap = new Map(queues.map((q) => [q.name, q.id]));

              const clients = await tDb
                .selectFrom("clients")
                .select(["id", "alias"])
                .execute();
              const clientMap = new Map(clients.map((c) => [c.alias, c.id]));

              // Helper: minutes ago as a Date
              function minutesAgo(m: number): Date {
                return new Date(Date.now() - m * 60_000);
              }

              // 3. Ticket definitions with varied data
              interface TicketDef {
                clientAlias: string;
                title: string;
                description: string;
                queue: string;
                priority: string;
                assignedTo: string | null;
                onHold: boolean;
                withKeyWrap: boolean;
                createdAgo: number; // minutes ago
                followUps: {
                  content: string;
                  source: string;
                  agoMinutes: number;
                }[];
              }

              const me = ctx.user.id;
              const ticketDefs: TicketDef[] = [
                // --- MY TICKETS (assigned to me) ---
                {
                  clientAlias: "Sparrow",
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
                      content: "Thank you, any help is appreciated",
                      source: "client",
                      agoMinutes: 1440,
                    },
                  ],
                },
                {
                  clientAlias: "Wren",
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
                      content: "Still waiting, called again",
                      source: "volunteer",
                      agoMinutes: 5760,
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
                  clientAlias: "Jay",
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
                      content: "I need to talk about my situation",
                      source: "client",
                      agoMinutes: 170,
                    },
                    {
                      content: "I am here for you. Can you tell me more?",
                      source: "volunteer",
                      agoMinutes: 160,
                    },
                  ],
                },
                {
                  clientAlias: "Dove",
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
                  clientAlias: "Crane",
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
                  clientAlias: "Finch",
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
                      content: "Shelter said they will call when a bed opens",
                      source: "volunteer",
                      agoMinutes: 5760,
                    },
                    {
                      content: "Still no word from them",
                      source: "client",
                      agoMinutes: 2880,
                    },
                  ],
                },
                {
                  clientAlias: "Heron",
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
                      content: "Court date is in two weeks, need letter",
                      source: "client",
                      agoMinutes: 14300,
                    },
                    {
                      content: "Working on getting the documentation together",
                      source: "volunteer",
                      agoMinutes: 10080,
                    },
                  ],
                },

                // --- UNASSIGNED ---
                {
                  clientAlias: "Robin",
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
                  clientAlias: "Lark",
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
                  clientAlias: "Raven",
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
                  clientAlias: "Swift",
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
                  clientAlias: "Hawk",
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

              const createdIds: string[] = [];
              const encoder = new TextEncoder();

              for (const def of ticketDefs) {
                const clientId = clientMap.get(def.clientAlias);
                if (clientId === undefined) {
                  throw new Error(
                    `Client "${def.clientAlias}" not found. Run seed first.`,
                  );
                }

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

                // Create follow-up messages (encrypted with same ticket key)
                for (const fu of def.followUps) {
                  const encryptedContent = encryptContent(
                    encoder.encode(fu.content),
                    tk,
                  );
                  await tDb
                    .insertInto("followups")
                    .values({
                      ticket_id: ticket.id,
                      source: fu.source,
                      type: "message",
                      encrypted_content: Buffer.from(encryptedContent),
                      encrypted_read_state: Buffer.from("unread"),
                      created_at: minutesAgo(fu.agoMinutes),
                    })
                    .execute();
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
