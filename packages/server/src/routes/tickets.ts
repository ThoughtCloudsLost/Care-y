/**
 * Ticket system tRPC router.
 *
 * Aggregates all ticket-related endpoints: ticket CRUD, follow-ups,
 * presets, dependencies, client merge, media, and queues. Each handler
 * creates per-request service instances from ctx.org.tenantDb (same
 * pattern as consultant.ts).
 *
 * Permission gates:
 * - viewCasesProcedure (shared): reading a case, its follow-ups, and search
 * - Local permission procedures: per-operation gates defined below
 * - createFollowUp resolves its key from the entry's type, because an
 *   outbound entry reaches the client and an internal note does not
 */

import { z } from "zod";
import { getEnv } from "../env.js";
import {
  router,
  authedProcedure,
  viewCasesProcedure,
  permissionProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";
import { hasPermissionForOrg, requirePermissionForOrg } from "../auth/roles.js";

/**
 * Which key a follow-up needs, decided by what the entry does rather than
 * where it is written. The four outbound types reach the client and take
 * the key for the channel they travel on. Everything else records
 * something that happened to the case, so it takes the note key.
 */
const OUTBOUND_FOLLOW_UP_PERMISSIONS: ReadonlyMap<FollowUpType, Permission> =
  new Map([
    ["sms_outbound", Permission.SEND_CLIENT_SMS],
    ["email_outbound", Permission.SEND_CLIENT_EMAIL],
    ["phone_call", Permission.CALL_CLIENTS],
    ["message", Permission.MESSAGE_CLIENTS_IN_PORTAL],
  ]);

function permissionForFollowUpType(type: FollowUpType): Permission {
  return (
    OUTBOUND_FOLLOW_UP_PERMISSIONS.get(type) ?? Permission.WRITE_CASE_NOTES
  );
}

// --- Local permission procedures (used only in this router) ---

const openCasesProcedure = permissionProcedure(Permission.OPEN_CASES);

/**
 * Editing a message already sent. The service rejects anything that is not
 * a volunteer-authored "message", so the only channel reachable here is the
 * secure portal.
 */
const editSentPortalMessageProcedure = permissionProcedure(
  Permission.MESSAGE_CLIENTS_IN_PORTAL,
);

const editCaseSummaryProcedure = permissionProcedure(
  Permission.EDIT_CASE_SUMMARY,
);

const writeCaseNotesProcedure = permissionProcedure(
  Permission.WRITE_CASE_NOTES,
);

const changeCaseStatusProcedure = permissionProcedure(
  Permission.CHANGE_CASE_STATUS,
);

const linkCasesProcedure = permissionProcedure(Permission.LINK_CASES);

const claimCasesProcedure = permissionProcedure(Permission.CLAIM_CASES);

const assignCasesProcedure = permissionProcedure(Permission.ASSIGN_CASES);

const sendClientMediaProcedure = permissionProcedure(
  Permission.SEND_CLIENT_MEDIA,
);

const downloadCaseMediaProcedure = permissionProcedure(
  Permission.DOWNLOAD_CASE_MEDIA,
);

const managePortalChannelProcedure = permissionProcedure(
  Permission.MANAGE_PORTAL_CHANNEL,
);

const resetClientLoginProcedure = permissionProcedure(
  Permission.RESET_CLIENT_LOGIN,
);

const revokeReplyLinksProcedure = permissionProcedure(
  Permission.REVOKE_REPLY_LINKS,
);

const manageNoteTypesProcedure = permissionProcedure(
  Permission.MANAGE_NOTE_TYPES,
);

const manageQueuesProcedure = permissionProcedure(Permission.MANAGE_QUEUES);

const manageQueueMembershipProcedure = permissionProcedure(
  Permission.MANAGE_QUEUE_MEMBERSHIP,
);

const manageQueueNotificationsProcedure = permissionProcedure(
  Permission.MANAGE_QUEUE_NOTIFICATIONS,
);

const viewAuditLogProcedure = permissionProcedure(Permission.VIEW_AUDIT_LOG);

const managePresetsProcedure = permissionProcedure(Permission.MANAGE_PRESETS);

const mergeClientsProcedure = permissionProcedure(Permission.MERGE_CLIENTS);

import type { BlobStore } from "../storage/store.js";
import { storeAttachment } from "../portal/portal-attachment-service.js";
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
import { clientHasAccount } from "../tickets/ticket-service.js";
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
  ReactionSummary,
  TicketStatus,
  TicketPriority,
  NoteTypeId,
} from "@care-y/shared";
import {
  ErrorCode,
  Permission,
  meetsRoleThreshold,
  upgradeToSecureLinkInputSchema,
  updateOutboundMessageInputSchema,
  resetClientAccountInputSchema,
  listTicketsForClientInputSchema,
  reseedPortalHistoryInputSchema,
  convertBlobForReseedInputSchema,
} from "@care-y/shared";
import { ForbiddenError, NotFoundError, RateLimitError } from "../errors.js";
import { assertSecureLinkEnabled } from "../org/org-config-service.js";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import {
  createChannel,
  regenerateChannel,
  revokeChannel,
  getActiveChannelSummary,
  type ChannelRegistration,
} from "../portal/channel-service.js";
import {
  ChannelAlreadyActiveError,
  PortalChannelMismatchError,
  ReseedValidationError,
  ReseedAlreadyConvertedError,
  ReseedRowNotFoundError,
} from "../portal/portal-errors.js";
import {
  reseedPortalHistory,
  convertBlobForReseed,
  listTicketsForClient,
} from "../portal/reseed-service.js";
import {
  enqueueNotificationDurable,
  encryptMentionedPseudonyms,
} from "../notifications/outbox.js";
import type { OutboxEventType } from "../notifications/outbox.js";
import type { ShiftProvider } from "../tickets/shift-provider.js";
import { createStubShiftProvider } from "../tickets/shift-provider.js";
import { createUserService } from "../users/user-service.js";
import { rewrapFollowUp } from "../tickets/rewrap-service.js";
import { revokeTokensForTicket } from "../email/reply-token-service.js";
import { phoneForViewer, emailForViewer } from "../utils/sql.js";
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
  uploadTicketAttachmentInputSchema,
  createNoteTypeInputSchema,
  updateNoteTypeInputSchema,
  toggleReactionInputSchema,
  searchClientsInputSchema,
  updateTicketContentInputSchema,
  type FollowUpType,
  ticketIdSchema,
  followupIdSchema,
  recordingIdSchema,
  attachmentIdSchema,
  presetReplyIdSchema,
  queueIdSchema,
  userIdSchema,
  clientMergeEventIdSchema,
  keyGenerationSchema,
  blobKeySchema,
  channelSecretSchema,
  clientIdSchema,
} from "@care-y/shared";
import type { UserId, QueueId, TicketId } from "@care-y/shared";

import { b64, b64n, b64KeyWrap } from "../utils/ciphertext-wire.js";
import {
  getConversionTargets,
  convertIntakeKeyWrap,
} from "../portal/intake-conversion-service.js";
import { resetAccount } from "../portal/account-service.js";

/**
 * Ticket record shape after Buffer ciphertext is converted to base64url
 * strings and the raw phone and email buffers are replaced with
 * formatted/masked clientPhone and clientEmail strings. This is the shape
 * that crosses the tRPC wire for ticket.get and ticket.list.
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
  readonly hasEmail: boolean;
  readonly clientPhoneId: string | null;
  readonly encryptedQueueName: string;
  readonly queueSortOrder: number;
  readonly lastActivityAt: Date | null;
  readonly followUpCount: number;
  readonly assignedDisplayName: string | null;
  readonly keyWrap: TicketKeyWrap | null;
  readonly intakeWrap: string | null;
  readonly clientPhone: string | null;
  readonly clientEmail: string | null;
  /**
   * True when contact details were withheld from this caller rather than
   * absent from the client. Without it a null clientPhone/clientEmail is
   * ambiguous, and the UI cannot tell "no email on file, offer to add
   * one" from "not your ticket, show nothing".
   */
  readonly contactWithheld: boolean;
  readonly clientTier: string;
  readonly portalCapable: boolean;
  readonly portalChannel: {
    readonly clientPublic: string;
    readonly hasPassphrase: boolean;
    readonly createdAt: string;
    readonly lastSeenAt: string | null;
    readonly kind: string;
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
    getAccessibleQueueIds: (userId: UserId) => Promise<readonly QueueId[]>,
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
  // Notification dispatch (unused since outbox conversion; retained for wiring compatibility)
  readonly notificationService?: NotificationService;
  // Shared pending clients map for clientToken consumption (injected by relay)
  readonly pendingClients?: Map<string, PendingClient>;
  // OPS-tier field encryptor for phone number masking (client search)
  readonly fieldEncryptor?: FieldEncryptor;
  // Portal reseed rate limiters (per-user, authenticated)
  readonly reseedLimiter?: RateLimiter;
  readonly reseedBlobLimiter?: RateLimiter;
}

function buildSearchRoutes(
  factory: (tDb: OrgContext["tenantDb"]) => SearchService,
) {
  return {
    metadataSearch: viewCasesProcedure.input(metadataSearchInputSchema).query(
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

    contentSearch: viewCasesProcedure.input(contentSearchInputSchema).query(
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
      list: manageNoteTypesProcedure.query(
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

      listActive: viewCasesProcedure.query(
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

      create: manageNoteTypesProcedure
        .input(createNoteTypeInputSchema)
        .mutation(
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

      update: manageNoteTypesProcedure
        .input(updateNoteTypeInputSchema)
        .mutation(
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
    auditLog: viewAuditLogProcedure.input(auditLogQueryInputSchema).query(
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

  // Audit helper: best-effort, never blocks. No-op when audit service not injected.
  function audit(tDb: OrgContext["tenantDb"], entry: AuditEntry): void {
    if (!deps.createAuditSvc) return;
    const svc = deps.createAuditSvc(tDb);
    void svc.log(entry);
  }

  /**
   * Combined audit + outbox enqueue for ticket lifecycle events.
   * Logs the audit entry, enqueues a notification into the outbox.
   * The drainer re-resolves recipients at dispatch time (never stored).
   *
   * Enqueue is durable-only (not atomic with the mutation) because the
   * route handler calls this after the service method returns, outside
   * any transaction the route controls. There is a residual window where
   * the mutation commits and the enqueue does not.
   */
  function auditAndNotify(
    ctx: { org: OrgContext; user: { id: UserId } },
    // The ticket router only raises lifecycle events. Quarantine and merge
    // notifications are dispatched from their own services, so keeping this
    // narrow means a new event type has to be handled rather than coerced.
    eventType: OutboxEventType,
    ticket: { id: TicketId; queueId: QueueId; assignedTo: UserId | null },
    auditEntry: AuditEntry,
    mentionedPseudonyms: string[] = [],
    noteTypeId?: NoteTypeId,
  ): void {
    audit(ctx.org.tenantDb, auditEntry);
    enqueueLifecycleNotification(
      ctx,
      eventType,
      ticket,
      mentionedPseudonyms,
      noteTypeId,
    );
  }

  /**
   * Enqueue a lifecycle notification into the outbox. Durable-only
   * (not inside a transaction). Mentioned pseudonyms are OPS-encrypted
   * before storage to avoid persisting a volunteer interaction graph
   * in plaintext.
   */
  function enqueueLifecycleNotification(
    ctx: { org: OrgContext; user: { id: UserId } },
    // Narrowed to the events the outbox handles, so an unsupported event
    // is a compile error at the call site rather than a cast here.
    eventType: OutboxEventType,
    ticket: { id: TicketId; queueId: QueueId; assignedTo: UserId | null },
    mentionedPseudonyms: string[] = [],
    noteTypeId?: NoteTypeId,
  ): void {
    const encryptor = deps.fieldEncryptor;
    const encryptedMentions =
      encryptor !== undefined
        ? encryptMentionedPseudonyms(mentionedPseudonyms, encryptor)
        : undefined;

    void enqueueNotificationDurable(ctx.org.tenantDb, {
      eventType,
      ticketId: ticket.id,
      queueId: ticket.queueId,
      formId: null,
      actorUserId: ctx.user.id,
      noteTypeId,
      encryptedMentionedPseudonyms: encryptedMentions,
    }).catch((err: unknown) => {
      console.error(
        "Outbox enqueue failed:",
        err instanceof Error ? err.message : String(err),
      );
    });
  }

  /**
   * Applies role-based contact formatting to a ticket record. Phone and
   * email share one visibility decision so the two can never drift apart.
   *
   * Admin: full formatted number and full email address.
   * Manager or assigned volunteer: masked last-4 and masked local part.
   * Volunteer not assigned to the ticket: null for both (contact details
   * hidden entirely).
   *
   * The server decrypts, formats, and zeros each plaintext buffer. Returns
   * a new object with `clientPhone` and `clientEmail` (string | null)
   * replacing the raw `clientPhoneEncrypted` and `clientEmailEncrypted`
   * buffers, which are stripped from the output.
   *
   * `contactWithheld` reports which kind of null the caller received, so
   * the UI never has to infer a permission from an absent value.
   */
  /**
   * What the caller may see of a client's contact details. Both keys are
   * resolved once per request: a permission lookup can reach the database
   * on a cache miss, and a ticket list would otherwise pay per row.
   */
  interface ContactViewer {
    /** VIEW_CLIENTS: see contact details on cases you are not assigned to. */
    readonly mayViewClients: boolean;
    /** VIEW_CLIENT_PII: see the real number rather than the masked form. */
    readonly unmasked: boolean;
  }

  async function resolveContactViewer(
    org: OrgContext,
    roleId: string,
  ): Promise<ContactViewer> {
    const [mayViewClients, unmasked] = await Promise.all([
      hasPermissionForOrg(
        org.tenantDb,
        org.orgSchema,
        roleId,
        Permission.VIEW_CLIENTS,
      ),
      hasPermissionForOrg(
        org.tenantDb,
        org.orgSchema,
        roleId,
        Permission.VIEW_CLIENT_PII,
      ),
    ]);
    return { mayViewClients, unmasked };
  }

  function applyContactFormatting(
    ticket: TicketWithKeyWrap,
    viewer: ContactViewer,
    userId: string,
  ): TicketWireRecord {
    const {
      clientPhoneEncrypted,
      clientEmailEncrypted,
      encryptedClientAlias,
      ...rest
    } = ticket;
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

    // Without VIEW_CLIENTS, contact details show only on your own cases.
    const hidden = !viewer.mayViewClients && ticket.assignedTo !== userId;

    let clientPhone: string | null = null;
    if (!hidden && encryptor) {
      clientPhone = phoneForViewer(
        clientPhoneEncrypted,
        viewer.unmasked,
        encryptor,
      );
    }

    let clientEmail: string | null = null;
    if (!hidden && encryptor) {
      clientEmail = emailForViewer(
        clientEmailEncrypted,
        viewer.unmasked,
        encryptor,
      );
    }

    return { ...base, clientPhone, clientEmail, contactWithheld: hidden };
  }

  return router({
    // --- Ticket CRUD ---
    create: openCasesProcedure.input(createTicketInputSchema).mutation(
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
    resolveCreateTarget: viewCasesProcedure
      .input(resolveCreateTargetInputSchema)
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const { svc } = ticketSvc(ctx.org.tenantDb);
          return svc.getCreateTarget(input.clientId);
        }),
      ),

    get: viewCasesProcedure.input(z.object({ ticketId: ticketIdSchema })).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const { svc } = ticketSvc(ctx.org.tenantDb);
        const ticket = await svc.findById(input.ticketId, ctx.user.id);
        const viewer = await resolveContactViewer(ctx.org, ctx.user.roleId);
        return applyContactFormatting(ticket, viewer, ctx.user.id);
      }),
    ),

    list: viewCasesProcedure.input(ticketListInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const { svc } = ticketSvc(ctx.org.tenantDb);
        const tickets = await svc.list(ctx.user.id, input);
        const viewer = await resolveContactViewer(ctx.org, ctx.user.roleId);
        return tickets.map((t) =>
          applyContactFormatting(t, viewer, ctx.user.id),
        );
      }),
    ),

    recentFollowUps: viewCasesProcedure.input(recentFollowUpsInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const { svc } = ticketSvc(ctx.org.tenantDb);
        const result = await svc.recentFollowUps(ctx.user.id, input);
        const wirePreviews = Object.fromEntries(
          Object.entries(result.previews).map(
            ([ticketId, previews]): [string, WirePreview[]] => [
              ticketId,
              previews.map((p) => ({
                ...p,
                encryptedContent: b64(p.encryptedContent),
              })),
            ],
          ),
        );
        return {
          previews: wirePreviews,
          latestClientType: result.latestClientType,
        };
      }),
    ),

    listReadState: viewCasesProcedure.input(listReadStateInputSchema).query(
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

    readStateSweep: viewCasesProcedure.input(sweepReadStateInputSchema).query(
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

    counts: viewCasesProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const { svc } = ticketSvc(ctx.org.tenantDb);
        return svc.counts(ctx.user.id);
      }),
    ),

    searchClients: viewCasesProcedure.input(searchClientsInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const { svc } = ticketSvc(ctx.org.tenantDb);
        const results = await svc.searchClients(
          input.query,
          input.limit,
          ctx.user.id,
          await hasPermissionForOrg(
            ctx.org.tenantDb,
            ctx.org.orgSchema,
            ctx.user.roleId,
            Permission.VIEW_CLIENT_PII,
          ),
        );
        return results.map((r) => ({
          ...r,
          encryptedAlias: r.encryptedAlias.toString("base64url"),
        }));
      }),
    ),

    update: changeCaseStatusProcedure.input(updateTicketInputSchema).mutation(
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

    close: changeCaseStatusProcedure
      .input(z.object({ ticketId: ticketIdSchema }))
      .mutation(
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

    reopen: changeCaseStatusProcedure
      .input(
        z.object({
          ticketId: ticketIdSchema,
          newKeyGeneration: keyGenerationSchema,
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
    createFollowUp: viewCasesProcedure
      .input(createFollowUpInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          // An outbound entry reaches the client, so it takes the key for
          // its channel rather than the key for writing on the case.
          await requirePermissionForOrg(
            ctx.org.tenantDb,
            ctx.org.orgSchema,
            ctx.user.roleId,
            permissionForFollowUpType(input.type),
          );
          if (
            input.type === "internal_note" &&
            input.noteTypeId !== undefined &&
            deps.createNoteTypeSvc
          ) {
            const ntSvc = deps.createNoteTypeSvc(ctx.org.tenantDb);
            const minRole = await ntSvc.getMinCreateRole(input.noteTypeId);
            if (
              minRole !== undefined &&
              !meetsRoleThreshold({
                userRoleId: ctx.user.roleId,
                minRoleId: minRole,
              })
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
            attachments: input.attachments.map((att) => ({
              attachmentId: att.attachmentId,
              portalCopy: att.portalCopy
                ? {
                    ephemeralPoint: Buffer.from(
                      att.portalCopy.ephemeralPoint,
                      "base64",
                    ),
                    nonce: Buffer.from(att.portalCopy.nonce, "base64"),
                    ciphertext: Buffer.from(
                      att.portalCopy.ciphertext,
                      "base64",
                    ),
                  }
                : undefined,
            })),
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

    listFollowUps: viewCasesProcedure.input(followUpListInputSchema).query(
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

    listFollowUpSummary: viewCasesProcedure
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

    listFollowUpsByIds: viewCasesProcedure
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

    getReadCursor: viewCasesProcedure
      .input(z.object({ ticketId: ticketIdSchema }))
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

    updateReadCursor: viewCasesProcedure
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
    updateInternalNote: writeCaseNotesProcedure
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
            enqueueLifecycleNotification(
              ctx,
              "followup_added",
              ticket,
              [],
              input.noteTypeId,
            );
          }

          return {
            ...record,
            encryptedContent: b64(record.encryptedContent),
            keyWrap: b64KeyWrap(record.keyWrap),
          };
        }),
      ),

    deleteInternalNote: viewCasesProcedure
      .input(deleteInternalNoteInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createFollowUpSvc(ctx.org.tenantDb, access);
          // Your own notes are yours to delete. Reaching somebody else's
          // takes DELETE_OTHERS_NOTES; the service decides which case
          // applies from the note's author.
          const mayDeleteOthers = await hasPermissionForOrg(
            ctx.org.tenantDb,
            ctx.org.orgSchema,
            ctx.user.roleId,
            Permission.DELETE_OTHERS_NOTES,
          );
          await svc.softDeleteInternalNote(
            ctx.user.id,
            input.followUpId,
            mayDeleteOthers,
          );
        }),
      ),

    toggleReaction: viewCasesProcedure
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

    getReactions: viewCasesProcedure
      .input(z.object({ followUpIds: z.array(followupIdSchema).max(100) }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createFollowUpSvc(ctx.org.tenantDb, access);
          const map = await svc.getReactions(input.followUpIds);
          return Object.fromEntries(map);
        }),
      ),

    // --- Presets ---
    createPreset: managePresetsProcedure
      .input(createPresetReplyInputSchema)
      .mutation(
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

    listPresets: viewCasesProcedure
      .input(z.object({ queueId: queueIdSchema.optional() }))
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

    updatePreset: managePresetsProcedure
      .input(updatePresetReplyInputSchema)
      .mutation(
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

    deletePreset: managePresetsProcedure
      .input(z.object({ presetId: presetReplyIdSchema }))
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createPresetSvc(ctx.org.tenantDb);
          // care-y-ignore-next-line route-delegates-to-service -- single service call, no business logic
          await svc.delete(input.presetId);
        }),
      ),

    // --- Dependencies ---
    addDependency: linkCasesProcedure.input(addDependencyInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const { access } = ticketSvc(ctx.org.tenantDb);
        const svc = deps.createDependencySvc(ctx.org.tenantDb, access);
        return svc.add({
          userId: ctx.user.id,
          ticketId: input.ticketId,
          dependsOnTicketId: input.dependsOnTicketId,
        });
      }),
    ),

    removeDependency: linkCasesProcedure
      .input(addDependencyInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const { access } = ticketSvc(ctx.org.tenantDb);
          const svc = deps.createDependencySvc(ctx.org.tenantDb, access);
          await svc.remove({
            userId: ctx.user.id,
            ticketId: input.ticketId,
            dependsOnTicketId: input.dependsOnTicketId,
          });
        }),
      ),

    listDependencies: viewCasesProcedure
      .input(z.object({ ticketId: ticketIdSchema }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createDependencySvc(ctx.org.tenantDb);
          return svc.listForTicket(input.ticketId);
        }),
      ),

    // --- Client Merge ---
    mergeClients: mergeClientsProcedure.input(mergeClientsInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = deps.createMergeSvc(ctx.org.tenantDb);
        const result = await svc.merge({
          primaryClientId: input.primaryClientId,
          secondaryClientId: input.secondaryClientId,
          encryptedSnapshot: Buffer.from(input.encryptedSnapshot, "base64"),
          keepChannelOf: input.keepChannelOf,
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

    undoMerge: mergeClientsProcedure.input(undoMergeInputSchema).mutation(
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

    lockMerge: mergeClientsProcedure
      .input(
        z.object({
          mergeEventId: clientMergeEventIdSchema,
          locked: z.boolean(),
        }),
      )
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

    getMergeChannelInfo: mergeClientsProcedure
      .input(
        z.object({
          primaryClientId: clientIdSchema,
          secondaryClientId: clientIdSchema,
        }),
      )
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const [primary, secondary] = await Promise.all([
            getActiveChannelSummary(ctx.org.tenantDb, input.primaryClientId),
            getActiveChannelSummary(ctx.org.tenantDb, input.secondaryClientId),
          ]);
          return {
            primary: primary
              ? {
                  kind: primary.kind,
                  createdAt: primary.createdAt.toISOString(),
                  hasPassphrase: primary.hasPassphrase,
                }
              : null,
            secondary: secondary
              ? {
                  kind: secondary.kind,
                  createdAt: secondary.createdAt.toISOString(),
                  hasPassphrase: secondary.hasPassphrase,
                }
              : null,
          };
        }),
      ),

    // --- Media ---
    getRecording: downloadCaseMediaProcedure
      .input(z.object({ recordingId: recordingIdSchema }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = mediaSvc(ctx.org.tenantDb);
          const rec = await svc.getRecording(ctx.user.id, input.recordingId);
          return {
            ...rec,
            fileKeyWrap: b64n(rec.fileKeyWrap),
          };
        }),
      ),

    getAttachment: downloadCaseMediaProcedure
      .input(z.object({ attachmentId: attachmentIdSchema }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = mediaSvc(ctx.org.tenantDb);
          const att = await svc.getAttachment(ctx.user.id, input.attachmentId);
          return {
            ...att,
            encryptedFilename: b64n(att.encryptedFilename),
            fileKeyWrap: b64n(att.fileKeyWrap),
          };
        }),
      ),

    listRecordings: downloadCaseMediaProcedure
      .input(recordingListInputSchema)
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = mediaSvc(ctx.org.tenantDb);
          const recs = await svc.listRecordings(ctx.user.id, input.ticketId, {
            limit: input.limit,
            cursor: input.cursor,
            direction: input.direction,
            followupId: input.followupId,
          });
          return recs.map((r) => ({
            ...r,
            fileKeyWrap: b64n(r.fileKeyWrap),
          }));
        }),
      ),

    /**
     * Store one encrypted file for a ticket, before the message that
     * carries it exists.
     *
     * Upload precedes the follow-up so a large file gets its own progress
     * and its own retry, and a failed send does not cost the upload again.
     * The row is left with no follow-up until `createFollowUp` links it,
     * and media cleanup sweeps anything never linked.
     */
    uploadAttachment: sendClientMediaProcedure
      .input(uploadTicketAttachmentInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          await access.assertAccess(ctx.user.id, input.ticketId);

          const attachmentId = await storeAttachment(
            ctx.org.tenantDb,
            deps.blobStore,
            ctx.org.orgSchema,
            {
              attachmentId: input.attachmentId,
              ticketId: input.ticketId,
              blob: Buffer.from(input.blob, "base64"),
              declaredSize: input.sizeBytes,
              contentType: input.contentType,
              fileKeyWrap: Buffer.from(input.fileKeyWrap, "base64"),
              encryptedFilename: Buffer.from(input.encryptedFilename, "base64"),
            },
          );

          return { attachmentId };
        }),
      ),

    listAttachments: downloadCaseMediaProcedure
      .input(attachmentListInputSchema)
      .query(
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
            fileKeyWrap: b64n(a.fileKeyWrap),
          }));
        }),
      ),

    // --- Queues ---
    createQueue: manageQueuesProcedure.input(createQueueInputSchema).mutation(
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

    listQueues: viewCasesProcedure.query(
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

    updateQueue: manageQueuesProcedure.input(updateQueueInputSchema).mutation(
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

    reorderQueues: manageQueuesProcedure
      .input(reorderQueuesInputSchema)
      .mutation(
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

    deleteQueue: manageQueuesProcedure.input(deleteQueueInputSchema).mutation(
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
    assign: assignCasesProcedure.input(assignTicketInputSchema).mutation(
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

    take: claimCasesProcedure.input(takeTicketInputSchema).mutation(
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

    release: claimCasesProcedure.input(releaseTicketInputSchema).mutation(
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

    assignTo: assignCasesProcedure.input(assignToInputSchema).mutation(
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
    watchTicket: viewCasesProcedure.input(watchTicketInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const access = deps.createTicketAccess(ctx.org.tenantDb);
        const svc = deps.createWatchersSvc(ctx.org.tenantDb, access);
        await svc.subscribe(ctx.user.id, input.ticketId);
      }),
    ),

    unwatchTicket: viewCasesProcedure.input(watchTicketInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const access = deps.createTicketAccess(ctx.org.tenantDb);
        const svc = deps.createWatchersSvc(ctx.org.tenantDb, access);
        await svc.unsubscribe(ctx.user.id, input.ticketId);
      }),
    ),

    isWatching: viewCasesProcedure.input(watchTicketInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const access = deps.createTicketAccess(ctx.org.tenantDb);
        await access.assertAccess(ctx.user.id, input.ticketId);
        const svc = deps.createWatchersSvc(ctx.org.tenantDb, access);
        return svc.isWatching(ctx.user.id, input.ticketId);
      }),
    ),

    addQueueWatcher: manageQueueNotificationsProcedure
      .input(queueWatcherInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createWatchersSvc(ctx.org.tenantDb, access);
          await svc.addQueueWatcher(input.queueId, input.userId);
        }),
      ),

    removeQueueWatcher: manageQueueNotificationsProcedure
      .input(queueWatcherInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          const svc = deps.createWatchersSvc(ctx.org.tenantDb, access);
          await svc.removeQueueWatcher(input.queueId, input.userId);
        }),
      ),

    // --- Queue Assignments ---
    addQueueMember: manageQueueMembershipProcedure
      .input(queueAssignmentInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createQueuePermissionsSvc(ctx.org.tenantDb);
          await svc.addMember(input.queueId, input.userId);
        }),
      ),

    removeQueueMember: manageQueueMembershipProcedure
      .input(queueAssignmentInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createQueuePermissionsSvc(ctx.org.tenantDb);
          await svc.removeMember(input.queueId, input.userId);
        }),
      ),

    listQueueMembers: viewCasesProcedure
      .input(z.object({ queueId: queueIdSchema }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createQueuePermissionsSvc(ctx.org.tenantDb);
          return svc.getQueueMembers(input.queueId);
        }),
      ),

    getUserQueues: manageQueueMembershipProcedure
      .input(z.object({ userId: userIdSchema }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createQueuePermissionsSvc(ctx.org.tenantDb);
          return svc.getUserQueues(input.userId);
        }),
      ),

    listAllQueueAssignments: manageQueueMembershipProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const svc = deps.createQueuePermissionsSvc(ctx.org.tenantDb);
        return svc.listAllAssignments();
      }),
    ),

    // --- Volunteers (for @mention autocomplete) ---
    listVolunteers: viewCasesProcedure.query(
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
    listParticipants: viewCasesProcedure
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
    recentActivity: viewCasesProcedure
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
    myQueues: viewCasesProcedure.query(
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
    dashboardInfo: viewCasesProcedure.query(
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

    // --- Audit log query (VIEW_AUDIT_LOG permission, injected by 5d wiring) ---
    ...(deps.createAuditSvc ? buildAuditRoutes(deps.createAuditSvc) : {}),

    // --- Ticket content editing (7.5b) ---
    // No audit() call here: the service writes the snapshot row
    // transactionally. No notify either: audit-only event.
    updateContent: editCaseSummaryProcedure
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
    rewrapFollowUp: viewCasesProcedure
      .input(
        z.object({
          followUpId: followupIdSchema,
          encryptedContent: z.string().min(1),
          blobUpdates: z
            .array(
              z.object({
                oldBlobKey: blobKeySchema,
                encryptedData: z.string().min(1),
                category: z.enum(["attachment", "recording"] as const),
              }),
            )
            .optional(),
          // Attachments encrypted under a file key: convergence moves the
          // wrap and leaves the blob where it is (ADR-089).
          fileKeyUpdates: z
            .array(
              z.object({
                attachmentId: attachmentIdSchema,
                fileKeyWrap: z.string().min(1),
                encryptedFilename: z.string().min(1).optional(),
              }),
            )
            .optional(),
          // Recordings encrypted under a file key (ADR-092): same shape
          // as fileKeyUpdates minus filename (recordings have none).
          recordingFileKeyUpdates: z
            .array(
              z.object({
                recordingId: recordingIdSchema,
                fileKeyWrap: z.string().min(1),
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
              fileKeyUpdates: input.fileKeyUpdates?.map((f) => ({
                attachmentId: f.attachmentId,
                fileKeyWrap: Buffer.from(f.fileKeyWrap, "base64"),
                encryptedFilename:
                  f.encryptedFilename !== undefined
                    ? Buffer.from(f.encryptedFilename, "base64")
                    : undefined,
              })),
              recordingFileKeyUpdates: input.recordingFileKeyUpdates?.map(
                (r) => ({
                  recordingId: r.recordingId,
                  fileKeyWrap: Buffer.from(r.fileKeyWrap, "base64"),
                }),
              ),
            },
            deps.blobStore,
            ctx.org.orgSchema,
          );
        }),
      ),

    // --- Intake wrap conversion ---
    getIntakeConversionTargets: viewCasesProcedure
      .input(z.object({ ticketId: ticketIdSchema }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          return getConversionTargets(
            ctx.org.tenantDb,
            access,
            ctx.user.id,
            input.ticketId,
            ctx.org.orgSchema,
          );
        }),
      ),

    convertIntakeKeyWrap: viewCasesProcedure
      .input(
        z.object({
          ticketId: ticketIdSchema,
          wraps: z.array(
            z.object({
              volunteerId: userIdSchema,
              ephemeralPoint: z.string().min(1),
              nonce: z.string().min(1),
              wrappedKey: z.string().min(1),
            }),
          ),
        }),
      )
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          return convertIntakeKeyWrap(
            ctx.org.tenantDb,
            access,
            ctx.user.id,
            {
              ticketId: input.ticketId,
              wraps: input.wraps.map((w) => ({
                volunteerId: w.volunteerId,
                ephemeralPoint: Buffer.from(w.ephemeralPoint, "base64"),
                nonce: Buffer.from(w.nonce, "base64"),
                wrappedKey: Buffer.from(w.wrappedKey, "base64"),
              })),
            },
            ctx.org.orgSchema,
          );
        }),
      ),

    // --- Secure Link tier management ---

    upgradeToSecureLink: managePortalChannelProcedure
      .input(upgradeToSecureLinkInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const { svc } = ticketSvc(ctx.org.tenantDb);
          // findById asserts ticket access for the caller
          await assertSecureLinkEnabled(ctx.org.tenantDb);
          const ticket = await svc.findById(input.ticketId, ctx.user.id);
          const clientId = ticket.clientId;

          const reg: ChannelRegistration = {
            channelId: channelSecretSchema.parse(input.channelId),
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

    regenerateSecureLink: managePortalChannelProcedure
      .input(
        z.object({
          ticketId: ticketIdSchema,
          channelId: channelSecretSchema,
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

    revokeSecureLink: managePortalChannelProcedure
      .input(z.object({ ticketId: ticketIdSchema }))
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

    updateOutboundMessage: editSentPortalMessageProcedure
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

    // --- Encrypted Account: volunteer-side reset ---

    resetClientAccount: resetClientLoginProcedure
      .input(resetClientAccountInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const { svc } = ticketSvc(ctx.org.tenantDb);
          const ticket = await svc.findById(input.ticketId, ctx.user.id);

          const hasAccount = await clientHasAccount(
            ctx.org.tenantDb,
            ticket.clientId,
          );
          if (!hasAccount) {
            throw new NotFoundError(ErrorCode.ACCOUNT_NOT_FOUND);
          }

          await resetAccount(ctx.org.tenantDb, ticket.clientId);

          audit(ctx.org.tenantDb, {
            eventType: "client_account_reset",
            actorId: ctx.user.id,
            metadata: { operation: "reset" },
          });
        }),
      ),

    // --- Portal thread reseed (volunteer re-seals history to new channel) ---

    listForClient: viewCasesProcedure
      .input(listTicketsForClientInputSchema)
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const access = deps.createTicketAccess(ctx.org.tenantDb);
          return listTicketsForClient(
            ctx.org.tenantDb,
            access,
            ctx.user.id,
            input.clientId,
          );
        }),
      ),

    reseedPortalHistory: managePortalChannelProcedure
      .input(reseedPortalHistoryInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          // In-resolver rate limit
          if (deps.reseedLimiter) {
            const limitResult = deps.reseedLimiter.check(ctx.user.id);
            if (!limitResult.allowed) {
              const retryAfterSeconds = Math.ceil(
                limitResult.retryAfterMs / 1000,
              );
              throw new RateLimitError(
                `Rate limited. Retry after ${String(retryAfterSeconds)}s`,
                retryAfterSeconds,
              );
            }
          }

          const access = deps.createTicketAccess(ctx.org.tenantDb);

          // Decode base64 triples to Buffers at the router
          const decodedMessages = input.messages.map((m) => ({
            followupId: m.followupId,
            copy: {
              ephemeralPoint: Buffer.from(m.copy.ephemeralPoint, "base64"),
              nonce: Buffer.from(m.copy.nonce, "base64"),
              ciphertext: Buffer.from(m.copy.ciphertext, "base64"),
            },
          }));

          const decodedAttachmentWraps = input.attachmentWraps.map((a) => ({
            attachmentId: a.attachmentId,
            followupId: a.followupId,
            copy: {
              ephemeralPoint: Buffer.from(a.copy.ephemeralPoint, "base64"),
              nonce: Buffer.from(a.copy.nonce, "base64"),
              ciphertext: Buffer.from(a.copy.ciphertext, "base64"),
            },
          }));

          const decodedRecordingWraps = input.recordingWraps.map((r) => ({
            recordingId: r.recordingId,
            followupId: r.followupId,
            copy: {
              ephemeralPoint: Buffer.from(r.copy.ephemeralPoint, "base64"),
              nonce: Buffer.from(r.copy.nonce, "base64"),
              ciphertext: Buffer.from(r.copy.ciphertext, "base64"),
            },
          }));

          try {
            const result = await reseedPortalHistory(
              ctx.org.tenantDb,
              access,
              ctx.user.id,
              {
                clientId: input.clientId,
                channelId: input.channelId,
                messages: decodedMessages,
                attachmentWraps: decodedAttachmentWraps,
                recordingWraps: decodedRecordingWraps,
              },
            );

            audit(ctx.org.tenantDb, {
              eventType: "portal_history_reseed_chunk",
              actorId: ctx.user.id,
              metadata: {
                operation: "portal_history_reseed_chunk",
                inserted: result.inserted,
                skipped: result.skipped,
              },
            });

            return result;
          } catch (err: unknown) {
            if (err instanceof PortalChannelMismatchError) {
              throw new NotFoundError(ErrorCode.PORTAL_CHANNEL_MISMATCH);
            }
            if (err instanceof ReseedValidationError) {
              throw new NotFoundError(ErrorCode.PORTAL_RESEED_VALIDATION);
            }
            throw err;
          }
        }),
      ),

    convertBlobForReseed: managePortalChannelProcedure
      .input(convertBlobForReseedInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          // In-resolver rate limit
          if (deps.reseedBlobLimiter) {
            const limitResult = deps.reseedBlobLimiter.check(ctx.user.id);
            if (!limitResult.allowed) {
              const retryAfterSeconds = Math.ceil(
                limitResult.retryAfterMs / 1000,
              );
              throw new RateLimitError(
                `Rate limited. Retry after ${String(retryAfterSeconds)}s`,
                retryAfterSeconds,
              );
            }
          }

          const access = deps.createTicketAccess(ctx.org.tenantDb);

          try {
            const result = await convertBlobForReseed(
              ctx.org.tenantDb,
              access,
              ctx.user.id,
              {
                clientId: input.clientId,
                channelId: input.channelId,
                kind: input.kind,
                rowId: input.rowId,
                followupId: input.followupId,
                encryptedData: Buffer.from(input.encryptedData, "base64"),
                fileKeyWrap: Buffer.from(input.fileKeyWrap, "base64"),
                copy: {
                  ephemeralPoint: Buffer.from(
                    input.copy.ephemeralPoint,
                    "base64",
                  ),
                  nonce: Buffer.from(input.copy.nonce, "base64"),
                  ciphertext: Buffer.from(input.copy.ciphertext, "base64"),
                },
              },
              deps.blobStore,
              ctx.org.orgSchema,
            );

            audit(ctx.org.tenantDb, {
              eventType: "portal_reseed_blob_converted",
              actorId: ctx.user.id,
              metadata: {
                operation: "portal_reseed_blob_converted",
                kind: input.kind,
              },
            });

            return result;
          } catch (err: unknown) {
            if (err instanceof PortalChannelMismatchError) {
              throw new NotFoundError(ErrorCode.PORTAL_CHANNEL_MISMATCH);
            }
            if (err instanceof ReseedValidationError) {
              throw new NotFoundError(ErrorCode.PORTAL_RESEED_VALIDATION);
            }
            if (err instanceof ReseedAlreadyConvertedError) {
              throw new NotFoundError(
                ErrorCode.PORTAL_RESEED_ALREADY_CONVERTED,
              );
            }
            if (err instanceof ReseedRowNotFoundError) {
              throw new NotFoundError(ErrorCode.PORTAL_CHANNEL_NOT_FOUND);
            }
            throw err;
          }
        }),
      ),

    // --- Reply token revocation ---

    revokeReplyToken: revokeReplyLinksProcedure
      .input(z.object({ ticketId: ticketIdSchema }))
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const { svc } = ticketSvc(ctx.org.tenantDb);
          // Assert the caller can access this ticket
          await svc.findById(input.ticketId, ctx.user.id);
          const revoked = await revokeTokensForTicket(
            ctx.org.tenantDb,
            input.ticketId,
          );
          audit(ctx.org.tenantDb, {
            eventType: "reply_token_revoked",
            actorId: ctx.user.id,
            ticketId: input.ticketId,
            metadata: { revokedCount: revoked },
          });
          return { revokedCount: revoked };
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
                // Destructure rather than forward the result: the seeder
                // also returns the content key of every ticket it created,
                // for in-process seeders that need to add follow-ups. That
                // must never leave the process. The default JSON
                // serializer would flatten the Map to {} today, which is
                // luck, not a guarantee.
                const { ticketIds } = await seedTestTickets(
                  ctx.org.tenantDb,
                  deps.blobStore,
                  ctx.user.id,
                  ctx.org.orgSchema,
                  { handcraftedOnly: input?.handcraftedOnly },
                );
                return { ticketIds };
              }),
            ),
        }
      : {}),
  });
}
