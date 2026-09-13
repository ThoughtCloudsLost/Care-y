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
  TicketWithKeyWrap,
  TicketKeyWrap,
  FollowUpPreview,
  PendingClient,
} from "../tickets/ticket-service.js";
import type {
  FollowUpService,
  FollowUpServiceDeps,
} from "../tickets/followup-service.js";
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
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { AuditEntry } from "../tickets/audit.js";
import type { NoteTypeService } from "../tickets/note-type-service.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import type {
  NotificationEventType,
  ReactionSummary,
  TicketStatus,
  TicketPriority,
} from "@care-y/shared";
import {
  ErrorCode,
  meetsRoleThreshold,
  upgradeToSecureLinkInputSchema,
  updateOutboundMessageInputSchema,
} from "@care-y/shared";
import { ForbiddenError, NotFoundError } from "../errors.js";
import {
  createChannel,
  regenerateChannel,
  revokeChannel,
  type ChannelRegistration,
} from "../portal/channel-service.js";
import { ChannelAlreadyActiveError } from "../portal/portal-errors.js";
import {
  buildRecipientList,
  resolveEscalationTargets,
} from "../tickets/notification-recipients.js";
import type { ShiftProvider } from "../tickets/shift-provider.js";
import { createStubShiftProvider } from "../tickets/shift-provider.js";
import { createUserService } from "../users/user-service.js";
import { rewrapFollowUp } from "../tickets/rewrap-service.js";
import { maskPhone, formatPhone } from "../utils/sql.js";
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
  updateTicketContentInputSchema,
  RoleId,
} from "@care-y/shared";

import { b64, b64n, b64KeyWrap } from "../utils/ciphertext-wire.js";

/**
 * Ticket record shape after Buffer ciphertext is converted to base64url
 * strings and the raw phone buffer is replaced with a formatted/masked
 * clientPhone string. This is the shape that crosses the tRPC wire for
 * ticket.get and ticket.list.
 */
export interface TicketWireRecord {
  readonly id: string;
  readonly clientId: string;
  readonly queueId: string;
  readonly status: TicketStatus;
  readonly priority: TicketPriority;
  readonly onHold: boolean;
  readonly assignedTo: string | null;
  readonly encryptedTitle: string;
  readonly encryptedDescription: string;
  readonly keyGeneration: string;
  readonly createdAt: Date;
  readonly encryptedClientAlias: string;
  readonly hasPhone: boolean;
  readonly clientPhoneId: string | null;
  readonly encryptedQueueName: string;
  readonly queueSortOrder: number;
  readonly lastActivityAt: Date | null;
  readonly followUpCount: number;
  readonly assignedDisplayName: string | null;
  readonly keyWrap: TicketKeyWrap | null;
  readonly intakeWrap: string | null;
  readonly clientPhone: string | null;
  readonly clientTier: string;
  readonly portalCapable: boolean;
  readonly portalChannel: {
    readonly clientPublic: string;
    readonly hasPassphrase: boolean;
    readonly createdAt: string;
    readonly lastSeenAt: string | null;
  } | null;
}

/** Follow-up preview as it crosses the wire, ciphertext base64 encoded. */
export interface WirePreview extends Omit<FollowUpPreview, "encryptedContent"> {
  readonly encryptedContent: string;
}

/** Per-ticket read state as it crosses the wire. */
export interface WireReadState {
  encryptedReadCursor: string | null;
  followUpCreatedAt: Date[];
}

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
    deps?: FollowUpServiceDeps,
  ) => FollowUpService;
  /** Portal message service deps for dual-copy follow-up creation. */
  readonly followUpServiceDeps?: FollowUpServiceDeps;
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
        const result = await search.metadataSearch(input, ctx.user.id);
        return {
          ...result,
          tickets: result.tickets.map((t) => ({
            ...t,
            encryptedClientAlias: b64(t.encryptedClientAlias),
          })),
        };
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
          const rows = await svc.list();
          return rows.map((r) => ({
            ...r,
            encryptedName: b64(r.encryptedName),
            encryptedIcon: b64(r.encryptedIcon),
            encryptedDescription: b64n(r.encryptedDescription),
          }));
        }),
      ),

      listActive: volunteerProcedure.query(
        withErrorWrapping(async ({ ctx }) => {
          const svc = factory(ctx.org.tenantDb);
          const result = await svc.listActive(ctx.user.roleId);
          return {
            ...result,
            types: result.types.map((r) => ({
              ...r,
              encryptedName: b64(r.encryptedName),
              encryptedIcon: b64(r.encryptedIcon),
              encryptedDescription: b64n(r.encryptedDescription),
            })),
          };
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
          return {
            ...result,
            encryptedName: b64(result.encryptedName),
            encryptedIcon: b64(result.encryptedIcon),
            encryptedDescription: b64n(result.encryptedDescription),
          };
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
          return {
            ...result,
            encryptedName: b64(result.encryptedName),
            encryptedIcon: b64(result.encryptedIcon),
            encryptedDescription: b64n(result.encryptedDescription),
          };
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
  function ticketSvc(
    tDb: OrgContext["tenantDb"],
    sealedBox?: SealedBoxEncryptor,
  ): {
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
        sealedBox,
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
        getTicketKeyWrapHolders: async (tid) => [
          ...(await userSvc.listActiveKeyWrapHolderIds(tid)),
        ],
      },
      ticketId,
    );

    if (userIds.length === 0) return undefined;

    if (ctx.minViewRole === RoleId.VOLUNTEER) return userIds;

    const filtered = await userSvc.filterByRoleThreshold(
      userIds,
      ctx.minViewRole,
    );

    return filtered.length > 0 ? [...filtered] : undefined;
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

  /**
   * Applies role-based phone formatting to a ticket record.
   *
   * Admin: full formatted number (server decrypts, formats, zeros buffer).
   * Manager/volunteer: masked last-4 (server decrypts, masks, zeros buffer).
   * Volunteer not assigned to the ticket: null (phone hidden entirely).
   *
   * Returns a new object with `clientPhone` (string | null) replacing the
   * raw `clientPhoneEncrypted` buffer, which is stripped from the output.
   */
  function applyPhoneFormatting(
    ticket: TicketWithKeyWrap,
    roleId: string,
    userId: string,
  ): TicketWireRecord {
    const { clientPhoneEncrypted, encryptedClientAlias, ...rest } = ticket;
    const encryptor = deps.fieldEncryptor;
    // Convert all Buffer ciphertext to base64 for the wire. superjson expands
    // a Buffer into {type,data}, which is ~2.8x the bytes of base64.
    const base = {
      ...rest,
      encryptedClientAlias: encryptedClientAlias.toString("base64url"),
      encryptedTitle: b64(rest.encryptedTitle),
      encryptedDescription: b64(rest.encryptedDescription),
      encryptedQueueName: b64(rest.encryptedQueueName),
      assignedDisplayName: b64n(rest.assignedDisplayName),
    };

    // No phone on this client
    if (clientPhoneEncrypted === null || !encryptor) {
      return { ...base, clientPhone: null as string | null };
    }

    // Volunteer not assigned to this ticket sees no phone
    if (roleId === RoleId.VOLUNTEER && ticket.assignedTo !== userId) {
      return { ...base, clientPhone: null as string | null };
    }

    // Admin: full formatted number
    if (roleId === RoleId.ADMIN) {
      const buf = encryptor.decryptToBuffer(clientPhoneEncrypted);
      return { ...base, clientPhone: formatPhone(buf) };
    }

    // Manager or assigned volunteer: masked
    const buf = encryptor.decryptToBuffer(clientPhoneEncrypted);
    return { ...base, clientPhone: maskPhone(buf) };
  }

  return router({
    // --- Ticket CRUD ---
    create: volunteerProcedure.input(createTicketInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const { svc } = ticketSvc(ctx.org.tenantDb, ctx.org.sealedBox);
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
        return {
          ...ticket,
          encryptedTitle: b64(ticket.encryptedTitle),
          encryptedDescription: b64(ticket.encryptedDescription),
        };
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
        const ticket = await svc.findById(input.ticketId, ctx.user.id);
        return applyPhoneFormatting(ticket, ctx.user.roleId, ctx.user.id);
      }),
    ),

    list: volunteerProcedure.input(ticketListInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const { svc } = ticketSvc(ctx.org.tenantDb);
        const tickets = await svc.list(ctx.user.id, input);
        return tickets.map((t) =>
          applyPhoneFormatting(t, ctx.user.roleId, ctx.user.id),
        );
      }),
    ),

    recentFollowUps: volunteerProcedure.input(recentFollowUpsInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const { svc } = ticketSvc(ctx.org.tenantDb);
        const grouped = await svc.recentFollowUps(ctx.user.id, input);
        return Object.fromEntries(
          Object.entries(grouped).map(
            ([ticketId, previews]): [string, WirePreview[]] => [
              ticketId,
              previews.map((p) => ({
                ...p,
                encryptedContent: b64(p.encryptedContent),
              })),
            ],
          ),
        );
      }),
    ),

    listReadState: volunteerProcedure.input(listReadStateInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const { svc } = ticketSvc(ctx.org.tenantDb);
        const stateMap = await svc.listReadState(ctx.user.id, input);
        return Object.fromEntries(
          Object.entries(stateMap).map(
            ([id, state]): [string, WireReadState] => [
              id,
              {
                encryptedReadCursor: b64n(state.encryptedReadCursor),
                followUpCreatedAt: state.followUpCreatedAt,
              },
            ],
          ),
        );
      }),
    ),

    readStateSweep: volunteerProcedure.input(sweepReadStateInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const { svc } = ticketSvc(ctx.org.tenantDb);
        const sweep = await svc.sweepReadState(ctx.user.id, input);
        return {
          ...sweep,
          items: sweep.items.map((entry) => ({
            ...entry,
            encryptedReadCursor: b64(entry.encryptedReadCursor),
          })),
        };
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
        const results = await svc.searchClients(
          input.query,
          input.limit,
          ctx.user.id,
          ctx.user.roleId === RoleId.ADMIN,
        );
        return results.map((r) => ({
          ...r,
          encryptedAlias: r.encryptedAlias.toString("base64url"),
        }));
      }),
    ),

    update: volunteerProcedure.input(updateTicketInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const { svc } = ticketSvc(ctx.org.tenantDb);
        // care-y-ignore-next-line route-delegates-to-service -- delegates to svc.update; field extraction from Zod-validated input is wire-format mapping, not business logic
        const updated = await svc.update(ctx.user.id, {
          ticketId: input.ticketId,
          status: input.status,
          priority: input.priority,
          queueId: input.queueId,
          onHold: input.onHold,
        });
        return {
          ...updated,
          encryptedTitle: b64(updated.encryptedTitle),
          encryptedDescription: b64(updated.encryptedDescription),
        };
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
        return {
          ...ticket,
          encryptedTitle: b64(ticket.encryptedTitle),
          encryptedDescription: b64(ticket.encryptedDescription),
        };
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
          return {
            ...ticket,
            encryptedTitle: b64(ticket.encryptedTitle),
            encryptedDescription: b64(ticket.encryptedDescription),
          };
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
          const svc = deps.createFollowUpSvc(
            ctx.org.tenantDb,
            access,
            deps.followUpServiceDeps,
          );
          const portalCopy = input.portalCopy
            ? {
                ephemeralPoint: Buffer.from(
                  input.portalCopy.ephemeralPoint,
                  "base64",
                ),
                nonce: Buffer.from(input.portalCopy.nonce, "base64"),
                ciphertext: Buffer.from(input.portalCopy.ciphertext, "base64"),
              }
            : undefined;
          const followUp = await svc.create(ctx.user.id, {
            id: input.id,
            ticketId: input.ticketId,
            encryptedContent: Buffer.from(input.encryptedContent, "base64"),
            source: input.source,
            type: input.type,
            isPrivate: input.isPrivate,
            mentionedPseudonyms: input.mentionedPseudonyms,
            noteTypeId: input.noteTypeId,
            portalCopy,
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
          return {
            ...followUp,
            encryptedContent: b64(followUp.encryptedContent),
            keyWrap: b64KeyWrap(followUp.keyWrap),
          };
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

        return {
          followUps: followUps.map((fu) => ({
            ...fu,
            encryptedContent: b64(fu.encryptedContent),
            keyWrap: b64KeyWrap(fu.keyWrap),
          })),
          reactions,
        };
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

          return {
            summaries: summaries.map((s) => ({
              ...s,
              encryptedContent: b64n(s.encryptedContent),
            })),
            reactions,
          };
        }),
      ),

    listFollowUpsByIds: volunteerProcedure
      .input(followUpsByIdsInputSchema)
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createFollowUpSvc(ctx.org.tenantDb, access);
          const fus = await svc.listByIds(
            ctx.user.id,
            input.ticketId,
            input.followUpIds,
            { types: input.types },
          );
          return fus.map((fu) => ({
            ...fu,
            encryptedContent: b64(fu.encryptedContent),
            keyWrap: b64KeyWrap(fu.keyWrap),
          }));
        }),
      ),

    // --- Read cursors ---

    getReadCursor: volunteerProcedure
      .input(z.object({ ticketId: z.uuid() }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createReadCursorSvc(ctx.org.tenantDb, access);
          const cursor = await svc.getOrCreate(ctx.user.id, input.ticketId);
          return {
            ...cursor,
            encryptedReadCursor: b64(cursor.encryptedReadCursor),
          };
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

          return {
            ...record,
            encryptedContent: b64(record.encryptedContent),
            keyWrap: b64KeyWrap(record.keyWrap),
          };
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
        const preset = await svc.create({
          encryptedTitle: Buffer.from(input.encryptedTitle, "base64"),
          encryptedBody: Buffer.from(input.encryptedBody, "base64"),
          queueId: input.queueId,
          createdBy: ctx.user.id,
        });
        return {
          ...preset,
          encryptedTitle: b64(preset.encryptedTitle),
          encryptedBody: b64(preset.encryptedBody),
        };
      }),
    ),

    listPresets: volunteerProcedure
      .input(z.object({ queueId: z.uuid().optional() }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createPresetSvc(ctx.org.tenantDb);
          const presets = await svc.list(input.queueId);
          return presets.map((p) => ({
            ...p,
            encryptedTitle: b64(p.encryptedTitle),
            encryptedBody: b64(p.encryptedBody),
          }));
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
        const updated = await svc.update(input.presetId, {
          encryptedTitle: title,
          encryptedBody: body,
          queueId: input.queueId,
        });
        return {
          ...updated,
          encryptedTitle: b64(updated.encryptedTitle),
          encryptedBody: b64(updated.encryptedBody),
        };
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
        return {
          ...result,
          snapshot: b64(result.snapshot),
        };
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
        return {
          ...result,
          snapshot: b64(result.snapshot),
        };
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
          const att = await svc.getAttachment(ctx.user.id, input.attachmentId);
          return { ...att, encryptedFilename: b64n(att.encryptedFilename) };
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
        const atts = await svc.listAttachments(ctx.user.id, input.ticketId, {
          limit: input.limit,
          cursor: input.cursor,
          direction: input.direction,
          followupId: input.followupId,
        });
        return atts.map((a) => ({
          ...a,
          encryptedFilename: b64n(a.encryptedFilename),
        }));
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
        return {
          ...queue,
          encryptedName: b64(queue.encryptedName),
          encryptedColor: b64n(queue.encryptedColor),
          encryptedIcon: b64n(queue.encryptedIcon),
        };
      }),
    ),

    listQueues: volunteerProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const svc = deps.createQueueSvc(ctx.org.tenantDb);
        const queues = await svc.listActive();
        return queues.map((q) => ({
          ...q,
          encryptedName: b64(q.encryptedName),
          encryptedColor: b64n(q.encryptedColor),
          encryptedIcon: b64n(q.encryptedIcon),
        }));
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
        return {
          ...queue,
          encryptedName: b64(queue.encryptedName),
          encryptedColor: b64n(queue.encryptedColor),
          encryptedIcon: b64n(queue.encryptedIcon),
        };
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
        const vols = await svc.listActiveVolunteers();
        return vols.map((v) => ({
          ...v,
          encryptedDisplayName: b64(v.encryptedDisplayName),
        }));
      }),
    ),

    // --- Ticket participants (distinct volunteer authors) ---
    listParticipants: volunteerProcedure
      .input(listParticipantsInputSchema)
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createFollowUpSvc(ctx.org.tenantDb, access);
          const parts = await svc.listParticipants(ctx.user.id, input.ticketId);
          return parts.map((p) => ({
            ...p,
            encryptedDisplayName: b64(p.encryptedDisplayName),
          }));
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
          // Without the audit service no audit rows are ever written, so an
          // empty feed is the accurate answer rather than a failure. Matches
          // the no-op behaviour of the audit() helper above.
          if (!deps.createAuditSvc) return [];

          const qps = deps.createQueuePermissionsSvc(tDb);
          const queueIds = await qps.getUserQueues(ctx.user.id);

          if (queueIds.length === 0) return [];

          const auditSvc = deps.createAuditSvc(tDb);
          const entries = await auditSvc.listRecentForQueues(
            queueIds,
            input.limit,
          );
          return entries.map((e) => ({
            ...e,
            encryptedClientAlias: b64(e.encryptedClientAlias),
            encryptedQueueName: b64(e.encryptedQueueName),
          }));
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
        return allQueues
          .filter((q) => allowed.has(q.id))
          .map((q) => ({
            ...q,
            encryptedName: b64(q.encryptedName),
            encryptedColor: b64n(q.encryptedColor),
            encryptedIcon: b64n(q.encryptedIcon),
          }));
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

    // --- Ticket content editing (7.5b) ---
    // No audit() call here: the service writes the snapshot row
    // transactionally. No notify either: audit-only event.
    updateContent: volunteerProcedure
      .input(updateTicketContentInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const { svc } = ticketSvc(ctx.org.tenantDb);
          const record = await svc.updateContent(ctx.user.id, {
            ticketId: input.ticketId,
            actorId: ctx.user.id,
            encryptedTitle:
              input.encryptedTitle !== undefined
                ? Buffer.from(input.encryptedTitle, "base64")
                : undefined,
            encryptedDescription:
              input.encryptedDescription !== undefined
                ? Buffer.from(input.encryptedDescription, "base64")
                : undefined,
            keyGeneration: input.keyGeneration,
          });
          return {
            ...record,
            encryptedTitle: b64(record.encryptedTitle),
            encryptedDescription: b64(record.encryptedDescription),
          };
        }),
      ),

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

    // --- Intake wrap conversion ---
    getIntakeConversionTargets: volunteerProcedure
      .input(z.object({ ticketId: z.uuid() }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const { getConversionTargets } =
            await import("../portal/intake-conversion-service.js");
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          return getConversionTargets(
            ctx.org.tenantDb,
            access,
            ctx.user.id,
            input.ticketId,
          );
        }),
      ),

    convertIntakeKeyWrap: volunteerProcedure
      .input(
        z.object({
          ticketId: z.uuid(),
          wraps: z.array(
            z.object({
              volunteerId: z.uuid(),
              ephemeralPoint: z.string().min(1),
              nonce: z.string().min(1),
              wrappedKey: z.string().min(1),
            }),
          ),
        }),
      )
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const { convertIntakeKeyWrap } =
            await import("../portal/intake-conversion-service.js");
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          return convertIntakeKeyWrap(ctx.org.tenantDb, access, ctx.user.id, {
            ticketId: input.ticketId,
            wraps: input.wraps.map((w) => ({
              volunteerId: w.volunteerId,
              ephemeralPoint: Buffer.from(w.ephemeralPoint, "base64"),
              nonce: Buffer.from(w.nonce, "base64"),
              wrappedKey: Buffer.from(w.wrappedKey, "base64"),
            })),
          });
        }),
      ),

    // --- Secure Link tier management ---

    upgradeToSecureLink: volunteerProcedure
      .input(upgradeToSecureLinkInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const { svc } = ticketSvc(ctx.org.tenantDb);
          // findById asserts ticket access for the caller
          const ticket = await svc.findById(input.ticketId, ctx.user.id);
          const clientId = ticket.clientId;

          const reg: ChannelRegistration = {
            channelId: input.channelId,
            authHash: Buffer.from(input.authHash, "base64"),
            clientPublic: Buffer.from(input.clientPublic, "base64"),
            hasPassphrase: input.hasPassphrase,
            keyCheck: {
              ephemeralPoint: Buffer.from(
                input.keyCheck.ephemeralPoint,
                "base64",
              ),
              nonce: Buffer.from(input.keyCheck.nonce, "base64"),
              ciphertext: Buffer.from(input.keyCheck.ciphertext, "base64"),
            },
          };

          try {
            await createChannel(ctx.org.tenantDb, clientId, reg);
          } catch (err: unknown) {
            if (err instanceof ChannelAlreadyActiveError) {
              throw new ForbiddenError(ErrorCode.PORTAL_CHANNEL_EXISTS);
            }
            throw err;
          }

          audit(ctx.org.tenantDb, {
            eventType: "client_tier_changed",
            actorId: ctx.user.id,
            metadata: { operation: "upgrade_to_secure_link" },
          });
        }),
      ),

    regenerateSecureLink: volunteerProcedure
      .input(
        z.object({
          ticketId: z.uuid(),
          channelId: z.string().regex(/^[0-9a-f]{48}$/),
          authHash: z.string().min(1),
          clientPublic: z.string().min(1),
          hasPassphrase: z.boolean(),
          keyCheck: z.object({
            ephemeralPoint: z.string().min(1),
            nonce: z.string().min(1),
            ciphertext: z.string().min(1),
          }),
        }),
      )
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const { svc } = ticketSvc(ctx.org.tenantDb);
          const ticket = await svc.findById(input.ticketId, ctx.user.id);

          // portalCapable is server-computed from the portal_channels
          // join in findById; no direct DB query needed here.
          if (!ticket.portalCapable) {
            throw new NotFoundError(ErrorCode.PORTAL_CHANNEL_NOT_FOUND);
          }

          const reg: ChannelRegistration = {
            channelId: input.channelId,
            authHash: Buffer.from(input.authHash, "base64"),
            clientPublic: Buffer.from(input.clientPublic, "base64"),
            hasPassphrase: input.hasPassphrase,
            keyCheck: {
              ephemeralPoint: Buffer.from(
                input.keyCheck.ephemeralPoint,
                "base64",
              ),
              nonce: Buffer.from(input.keyCheck.nonce, "base64"),
              ciphertext: Buffer.from(input.keyCheck.ciphertext, "base64"),
            },
          };

          await regenerateChannel(ctx.org.tenantDb, ticket.clientId, reg);

          audit(ctx.org.tenantDb, {
            eventType: "portal_channel_regenerated",
            actorId: ctx.user.id,
            metadata: { operation: "regenerate" },
          });
        }),
      ),

    revokeSecureLink: volunteerProcedure
      .input(z.object({ ticketId: z.uuid() }))
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const { svc } = ticketSvc(ctx.org.tenantDb);
          const ticket = await svc.findById(input.ticketId, ctx.user.id);

          // portalCapable check gates revocation on channel existence.
          if (!ticket.portalCapable) {
            throw new NotFoundError(ErrorCode.PORTAL_CHANNEL_NOT_FOUND);
          }

          await revokeChannel(ctx.org.tenantDb, ticket.clientId);

          audit(ctx.org.tenantDb, {
            eventType: "portal_channel_revoked",
            actorId: ctx.user.id,
            metadata: { operation: "revoke" },
          });
        }),
      ),

    // --- Outbound message editing ---

    updateOutboundMessage: volunteerProcedure
      .input(updateOutboundMessageInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createFollowUpSvc(ctx.org.tenantDb, access);
          const portalCopy = input.portalCopy
            ? {
                ephemeralPoint: Buffer.from(
                  input.portalCopy.ephemeralPoint,
                  "base64",
                ),
                nonce: Buffer.from(input.portalCopy.nonce, "base64"),
                ciphertext: Buffer.from(input.portalCopy.ciphertext, "base64"),
              }
            : undefined;

          const record = await svc.updateOutboundMessage(
            ctx.user.id,
            input.followUpId,
            Buffer.from(input.encryptedContent, "base64"),
            portalCopy,
          );

          return {
            ...record,
            encryptedContent: b64(record.encryptedContent),
            keyWrap: b64KeyWrap(record.keyWrap),
          };
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
