/**
 * Ticket CRUD service.
 *
 * Implements the one-ticket-per-client model (ADR-018):
 * - Each client has at most one open ticket
 * - Creating a ticket for a client with a closed ticket reopens it
 * - Close checks unresolved dependencies
 * - Status transitions are recorded as system follow-ups
 * - No activity timestamps on the ticket row (ADR-018 section 7)
 */

import { type Kysely, type Transaction } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { keysetAfter } from "../db/keyset.js";
import { createPhoneRepository } from "../telephony/models/phone-repo.js";
import { createClientRepository } from "../telephony/models/client-repo.js";
import type {
  RecentFollowUpsInput,
  ListReadStateInput,
  SweepReadStateInput,
  TicketStatus,
  TicketPriority,
  TicketSortField,
  TicketId,
  ClientId,
  QueueId,
  UserId,
  KeyGeneration,
  PhoneId,
  NoteTypeId,
  FollowupId,
  OrgSchema,
  PhoneHash,
  PhoneMatchHash,
} from "@care-y/shared";
import type { TicketAccessChecker } from "./access.js";
import {
  NotFoundError,
  ConflictError,
  InternalError,
  ValidationError,
  TicketError,
  MergeError,
} from "../errors.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import { maskPhone } from "../utils/sql.js";
import { createDependencyService } from "./dependency-service.js";
import { createReadCursorService } from "./read-cursor-service.js";
import { ErrorCode, aliasHashSchema } from "@care-y/shared";
import { encode } from "@care-y/crypto";

export interface TicketRecord {
  readonly id: TicketId;
  readonly clientId: ClientId;
  readonly queueId: QueueId;
  readonly status: TicketStatus;
  readonly priority: TicketPriority;
  readonly onHold: boolean;
  readonly assignedTo: UserId | null;
  readonly encryptedTitle: Buffer;
  readonly encryptedDescription: Buffer;
  readonly keyGeneration: KeyGeneration;
  readonly createdAt: Date;
}

/** Enriched ticket with joined metadata for list/detail views. */
export interface TicketListRecord extends TicketRecord {
  readonly encryptedClientAlias: Buffer;
  readonly hasPhone: boolean;
  /** OPS-encrypted phone number buffer, or null when the client has no phone. */
  readonly clientPhoneEncrypted: Buffer | null;
  /** Phone record id, or null when the client has no phone. */
  readonly clientPhoneId: PhoneId | null;
  readonly encryptedQueueName: Buffer;
  readonly queueSortOrder: number;
  readonly lastActivityAt: Date | null;
  readonly followUpCount: number;
  /** Org-key encrypted display name of the assigned volunteer, or null if unassigned. */
  readonly assignedDisplayName: Buffer | null;
}

export interface TicketKeyWrap {
  readonly ephemeralPoint: string; // base64url (no padding)
  readonly nonce: string; // base64url (no padding)
  readonly wrappedKey: string; // base64url (no padding)
}

export interface PortalChannelMeta {
  readonly clientPublic: string;
  readonly hasPassphrase: boolean;
  readonly createdAt: string;
  readonly lastSeenAt: string | null;
  readonly kind: string;
  readonly accountOffer: boolean;
}

export interface TicketWithKeyWrap extends TicketListRecord {
  readonly keyWrap: TicketKeyWrap | null;
  /**
   * Base64-encoded sealed-box wrap of tk sealed to the org public key.
   * Present only on intake tickets that have not been converted yet
   * (intake_key_wraps row exists AND this volunteer has no ECIES wrap).
   * The Worker uses crypto_box_seal_open to recover tk from this wrap.
   */
  readonly intakeWrap: string | null;
  /** Communication tier of the ticket's client. */
  readonly clientTier: string;
  /** True iff the client has an active portal channel (server-computed). */
  readonly portalCapable: boolean;
  /** Active portal channel metadata, or null when none exists. */
  readonly portalChannel: PortalChannelMeta | null;
}

export interface FollowUpPreview {
  readonly id: FollowupId;
  readonly ticketId: TicketId;
  readonly source: string;
  readonly type: string;
  readonly encryptedContent: Buffer;
  readonly createdAt: Date;
  readonly keyWrap: TicketKeyWrap | null;
  readonly hasRecording: boolean;
  readonly hasImage: boolean;
  readonly hasFile: boolean;
  readonly noteTypeId: NoteTypeId | null;
  readonly eventParams: Record<string, unknown> | null;
}

/**
 * Read state for one ticket in a list window: the user's opaque cursor
 * ciphertext (null when the detail view never created a row) plus recent
 * non-system follow-up timestamps. The client decrypts the cursor and
 * counts newer timestamps; the server never learns read state.
 */
export interface TicketReadState {
  readonly encryptedReadCursor: Buffer | null;
  readonly followUpCreatedAt: Date[];
}

/**
 * Newest non-system follow-up timestamps returned per ticket by
 * listReadState. Bounds the payload for a 50-ticket window; client-side
 * unread counts cap at this window size by design.
 */
const READ_STATE_TIMESTAMPS_PER_TICKET = 20;

/**
 * One cursor row in the global read-state sweep: the opaque cursor
 * ciphertext (dummies included; the client AEAD-fails those to
 * not-unread), the newest non-system activity time (null when only
 * system events exist), and the user's key wrap at the ticket's current
 * generation. The wrap rides along because swept tickets may not be in
 * the loaded list window, and without it the client cannot decrypt the
 * cursor at all.
 */
export interface SweepReadStateEntry {
  readonly ticketId: TicketId;
  readonly encryptedReadCursor: Buffer;
  readonly latestActivityAt: Date | null;
  readonly keyWrap: TicketKeyWrap | null;
}

export interface SweepReadStateResult {
  readonly items: SweepReadStateEntry[];
  readonly nextCursor: TicketId | null;
}

export interface CreateTicketKeyWrap {
  readonly ephemeralPoint: Buffer;
  readonly nonce: Buffer;
  readonly wrappedKey: Buffer;
}

export interface CreateTicketInput {
  /** Client-minted ticket id the content AAD was bound to (ADR-053). */
  readonly id: TicketId;
  readonly clientId?: ClientId;
  readonly clientToken?: string;
  readonly queueId: QueueId;
  readonly encryptedTitle: Buffer;
  readonly encryptedDescription: Buffer;
  readonly priority: TicketPriority;
  readonly keyGeneration: KeyGeneration;
  readonly keyWrap: CreateTicketKeyWrap;
}

export interface UpdateTicketInput {
  readonly ticketId: TicketId;
  readonly status?: TicketStatus;
  readonly priority?: TicketPriority;
  readonly queueId?: QueueId;
  readonly onHold?: boolean;
}

export type TicketSortDirection = "asc" | "desc";

export interface TicketListOpts {
  readonly statuses?: TicketStatus[];
  readonly queueIds?: QueueId[];
  readonly priorities?: TicketPriority[];
  readonly onHold?: boolean;
  readonly assignedTo?: UserId | null;
  readonly createdAfter?: string;
  readonly createdBefore?: string;
  readonly sortBy?: TicketSortField;
  readonly sortDirection?: TicketSortDirection;
  readonly limit: number;
  readonly cursor?: TicketId;
}

export interface CreateTarget {
  readonly openTicketId: TicketId | null;
  readonly reopenTicketId: TicketId | null;
}

export interface UpdateTicketContentServiceInput {
  readonly ticketId: TicketId;
  /** Audit row author; the router passes ctx.user.id. */
  readonly actorId: UserId;
  readonly encryptedTitle?: Buffer;
  readonly encryptedDescription?: Buffer;
  readonly keyGeneration: KeyGeneration;
}

export interface TicketService {
  create(userId: UserId, input: CreateTicketInput): Promise<TicketRecord>;
  /** Where a create for this client lands (open blocks, closed reopens). */
  getCreateTarget(clientId: ClientId): Promise<CreateTarget>;
  findById(ticketId: TicketId, userId: UserId): Promise<TicketWithKeyWrap>;
  list(userId: UserId, opts: TicketListOpts): Promise<TicketWithKeyWrap[]>;
  update(userId: UserId, input: UpdateTicketInput): Promise<TicketRecord>;
  close(userId: UserId, ticketId: TicketId): Promise<TicketRecord>;
  reopen(
    userId: UserId,
    ticketId: TicketId,
    newKeyGeneration: KeyGeneration,
  ): Promise<TicketRecord>;
  recentFollowUps(
    userId: UserId,
    input: RecentFollowUpsInput,
  ): Promise<Record<string, FollowUpPreview[]>>;
  listReadState(
    userId: UserId,
    input: ListReadStateInput,
  ): Promise<Record<string, TicketReadState>>;
  sweepReadState(
    userId: UserId,
    input: SweepReadStateInput,
  ): Promise<SweepReadStateResult>;
  counts(userId: UserId): Promise<TicketCounts>;
  /**
   * Alias search over clients the caller can already reach.
   *
   * Scoped to the caller's accessible queues plus tickets they are assigned
   * to or watching. Admins bypass the scoping and search org-wide.
   */
  searchClients(
    query: string,
    limit: number,
    userId: UserId,
    isAdmin: boolean,
  ): Promise<ClientSearchResult[]>;
  updateContent(
    userId: UserId,
    input: UpdateTicketContentServiceInput,
  ): Promise<TicketRecord>;
}

export interface ClientSearchResult {
  readonly id: ClientId;
  readonly encryptedAlias: Buffer;
  readonly maskedPhone: string | null;
}

export interface TicketCounts {
  readonly total: number;
  readonly new: number;
  readonly active: number;
  readonly closed: number;
  readonly onHold: number;
  readonly unassigned: number;
  readonly mine: number;
  readonly byPriority: {
    readonly low: number;
    readonly normal: number;
    readonly high: number;
    readonly urgent: number;
  };
}

interface BaseTicketRow {
  id: TicketId;
  client_id: ClientId;
  queue_id: QueueId;
  status: TicketStatus;
  priority: TicketPriority;
  on_hold: boolean;
  assigned_to: UserId | null;
  encrypted_title: Buffer;
  encrypted_description: Buffer;
  key_generation: KeyGeneration;
  created_at: Date;
}

interface EnrichedTicketRow extends BaseTicketRow {
  encrypted_client_alias: Buffer;
  has_phone: boolean | 0 | 1;
  client_phone_encrypted: Buffer | null;
  client_phone_id: PhoneId | null;
  encrypted_queue_name: Buffer;
  queue_sort_order: number;
  last_activity_at: Date | null;
  followup_count: string | number | bigint | null;
  assigned_display_name: Buffer | null;
}

function toRecord(row: BaseTicketRow): TicketRecord {
  return {
    id: row.id,
    clientId: row.client_id,
    queueId: row.queue_id,
    status: row.status,
    priority: row.priority,
    onHold: row.on_hold,
    assignedTo: row.assigned_to,
    encryptedTitle: row.encrypted_title,
    encryptedDescription: row.encrypted_description,
    keyGeneration: row.key_generation,
    createdAt: row.created_at,
  };
}

function toListRecord(row: EnrichedTicketRow): TicketListRecord {
  return {
    ...toRecord(row),
    encryptedClientAlias: row.encrypted_client_alias,
    hasPhone: Boolean(row.has_phone),
    clientPhoneEncrypted: row.client_phone_encrypted ?? null,
    clientPhoneId: row.client_phone_id ?? null,
    encryptedQueueName: row.encrypted_queue_name,
    queueSortOrder: row.queue_sort_order,
    lastActivityAt: row.last_activity_at,
    followUpCount: Number(row.followup_count),
    assignedDisplayName: row.assigned_display_name,
  };
}

function buildKeyWrap(
  ep: Buffer | null,
  n: Buffer | null,
  wk: Buffer | null,
): TicketKeyWrap | null {
  if (!ep || !n || !wk) return null;
  return {
    ephemeralPoint: encode(new Uint8Array(ep)),
    nonce: encode(new Uint8Array(n)),
    wrappedKey: encode(new Uint8Array(wk)),
  };
}

function toRecordWithKeyWrap(
  row: EnrichedTicketRow & {
    ephemeral_point: Buffer | null;
    nonce: Buffer | null;
    wrapped_key: Buffer | null;
    intake_wrapped_tk?: Buffer | null;
    communication_tier?: string;
    portal_channel_id?: string | null;
    portal_client_public?: Buffer | null;
    portal_has_passphrase?: boolean | null;
    portal_created_at?: Date | null;
    portal_last_seen_at?: Date | null;
    portal_kind?: string | null;
    portal_account_offer?: boolean | null;
  },
): TicketWithKeyWrap {
  const keyWrap = buildKeyWrap(row.ephemeral_point, row.nonce, row.wrapped_key);
  // Populate intakeWrap only when the volunteer has no ECIES wrap but an
  // intake_key_wraps row exists. The Worker uses this to unseal tk via
  // crypto_box_seal_open with the org secret key.
  const intakeWrap =
    keyWrap === null && row.intake_wrapped_tk
      ? encode(new Uint8Array(row.intake_wrapped_tk))
      : null;

  const clientTier = row.communication_tier ?? "sms_email";
  const hasActiveChannel =
    row.portal_channel_id !== undefined && row.portal_channel_id !== null;

  // The join guarantees the key-material columns whenever the channel id
  // is present; narrow on the columns themselves rather than asserting.
  const portalChannel: PortalChannelMeta | null =
    hasActiveChannel &&
    row.portal_client_public != null &&
    row.portal_created_at != null
      ? {
          clientPublic: encode(new Uint8Array(row.portal_client_public)),
          hasPassphrase: Boolean(row.portal_has_passphrase),
          createdAt: row.portal_created_at.toISOString(),
          lastSeenAt: row.portal_last_seen_at
            ? row.portal_last_seen_at.toISOString()
            : null,
          kind: row.portal_kind ?? "secure_link",
          accountOffer: Boolean(row.portal_account_offer),
        }
      : null;

  return {
    ...toListRecord(row),
    keyWrap,
    intakeWrap,
    clientTier,
    portalCapable: hasActiveChannel,
    portalChannel,
  };
}

export interface PendingClient {
  readonly phoneHash: PhoneHash;
  readonly opsEncryptedPhone: Buffer;
  readonly phoneMatchHash: PhoneMatchHash | null;
  readonly orgSchema: OrgSchema;
  readonly createdAt: number;
}

export interface TicketServiceDeps {
  readonly pendingClients?: Map<string, PendingClient>;
  readonly fieldEncryptor?: FieldEncryptor;
  readonly sealedBox?: SealedBoxEncryptor;
}

export function createTicketService(
  db: Kysely<TenantDatabase>,
  access: TicketAccessChecker,
  getAccessibleQueueIds: (userId: UserId) => Promise<readonly QueueId[]>,
  deps?: TicketServiceDeps,
): TicketService {
  const depService = createDependencyService(db);
  const readCursors = createReadCursorService(db, access);

  async function createSystemFollowUp(
    trxOrDb: Kysely<TenantDatabase> | Transaction<TenantDatabase>,
    ticketId: TicketId,
    type: string,
    eventParams?: Record<string, unknown>,
  ): Promise<void> {
    await trxOrDb
      .insertInto("followups")
      .values({
        ticket_id: ticketId,
        source: "system",
        type,
        encrypted_content: Buffer.alloc(0),
        event_params: eventParams ?? null,
      })
      .execute();
  }

  async function insertKeyWrap(
    trx: Kysely<TenantDatabase> | Transaction<TenantDatabase>,
    ticketId: TicketId,
    volunteerId: UserId,
    keyGeneration: KeyGeneration,
    keyWrap: CreateTicketKeyWrap,
  ): Promise<void> {
    await trx
      .insertInto("ticket_key_wraps")
      .values({
        ticket_id: ticketId,
        volunteer_id: volunteerId,
        key_generation: keyGeneration,
        ephemeral_point: keyWrap.ephemeralPoint,
        nonce: keyWrap.nonce,
        wrapped_key: keyWrap.wrappedKey,
        algorithm: "ecies-ristretto255-v1",
      })
      .execute();
  }

  return {
    async getCreateTarget(clientId): Promise<CreateTarget> {
      const existing = await db
        .selectFrom("tickets")
        .select(["id", "status"])
        .where("client_id", "=", clientId)
        .orderBy("created_at", "desc")
        .executeTakeFirst();

      if (!existing) return { openTicketId: null, reopenTicketId: null };
      return existing.status === "open"
        ? { openTicketId: existing.id, reopenTicketId: null }
        : { openTicketId: null, reopenTicketId: existing.id };
    },

    async create(userId, input) {
      return db.transaction().execute(async (trx) => {
        // Resolve clientId from token if needed
        let clientId: ClientId;

        if (input.clientToken !== undefined) {
          if (!deps?.pendingClients) {
            throw new InternalError(
              "pendingClients map not wired into ticket service",
            );
          }
          const pending = deps.pendingClients.get(input.clientToken);
          if (!pending) throw new NotFoundError(ErrorCode.TOKEN_EXPIRED);
          deps.pendingClients.delete(input.clientToken);

          const phoneRepo = createPhoneRepository(trx);
          if (!deps.sealedBox) {
            throw new InternalError("sealedBox not wired into ticket service");
          }
          const clientRepo = createClientRepository(
            trx,
            phoneRepo,
            deps.sealedBox,
          );
          const result = await clientRepo.findOrCreateByPhoneHash(
            pending.phoneHash,
            pending.opsEncryptedPhone,
            pending.phoneMatchHash,
          );
          clientId = result.client.id;
        } else if (input.clientId !== undefined) {
          clientId = input.clientId;
        } else {
          throw new ValidationError(
            "Either clientId or clientToken must be provided",
          );
        }

        // Validate queue exists
        const queue = await trx
          .selectFrom("queues")
          .select("id")
          .where("id", "=", input.queueId)
          .where("is_active", "=", true)
          .executeTakeFirst();
        if (!queue) throw new NotFoundError(ErrorCode.QUEUE_NOT_FOUND);

        // Validate client exists and is not merged
        const client = await trx
          .selectFrom("clients")
          .select(["id", "merged_into"])
          .where("id", "=", clientId)
          .executeTakeFirst();
        if (!client) throw new NotFoundError(ErrorCode.CLIENT_NOT_FOUND);
        if (client.merged_into !== null) {
          throw new MergeError(ErrorCode.CLIENT_MERGED);
        }

        // One-ticket-per-client: check for existing ticket
        const existing = await trx
          .selectFrom("tickets")
          .selectAll()
          .where("client_id", "=", clientId)
          .executeTakeFirst();

        let ticket: TicketRecord;

        if (existing) {
          if (existing.status === "open") {
            throw new ConflictError(ErrorCode.TICKET_ALREADY_OPEN);
          }
          // Closed ticket exists: reopen it (ADR-018 section 2). The
          // client must have encrypted against this exact id (ADR-053);
          // a mismatch means its resolveCreateTarget view went stale.
          if (existing.id !== input.id) {
            throw new ConflictError(ErrorCode.TICKET_CREATE_TARGET_CHANGED);
          }
          const reopened = await trx
            .updateTable("tickets")
            .set({
              status: "open",
              key_generation: input.keyGeneration,
              encrypted_title: input.encryptedTitle,
              encrypted_description: input.encryptedDescription,
              queue_id: input.queueId,
              priority: input.priority,
            })
            .where("id", "=", existing.id)
            .returningAll()
            .executeTakeFirstOrThrow();

          await createSystemFollowUp(trx, existing.id, "status_opened");
          ticket = toRecord(reopened);
        } else {
          // No existing ticket: create new under the client-minted id
          const row = await trx
            .insertInto("tickets")
            .values({
              id: input.id,
              client_id: clientId,
              queue_id: input.queueId,
              encrypted_title: input.encryptedTitle,
              encrypted_description: input.encryptedDescription,
              priority: input.priority,
              key_generation: input.keyGeneration,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

          ticket = toRecord(row);
        }

        // Insert key wrap (ticket + key wrap must succeed or fail together)
        await insertKeyWrap(
          trx,
          ticket.id,
          userId,
          input.keyGeneration,
          input.keyWrap,
        );

        return ticket;
      });
    },

    async findById(ticketId, userId) {
      await access.assertAccess(userId, ticketId);

      const row = await db
        .selectFrom("tickets as t")
        .leftJoin("ticket_key_wraps as tkw", (join) =>
          join
            .onRef("tkw.ticket_id", "=", "t.id")
            .on("tkw.volunteer_id", "=", userId)
            .onRef("tkw.key_generation", "=", "t.key_generation"),
        )
        .leftJoin("intake_key_wraps as ikw", "ikw.ticket_id", "t.id")
        .innerJoin("clients as c", "c.id", "t.client_id")
        .leftJoin("phones as ph", "ph.id", "c.phone_id")
        .innerJoin("queues as q", "q.id", "t.queue_id")
        .leftJoin("users as u", (join) =>
          join.on((eb) =>
            eb(eb.cast("t.assigned_to", "uuid"), "=", eb.ref("u.id")),
          ),
        )
        .leftJoin("portal_channels as pc", (join) =>
          join
            .onRef("pc.client_id", "=", "c.id")
            .on("pc.status", "=", "active"),
        )
        .selectAll("t")
        .select(["tkw.ephemeral_point", "tkw.nonce", "tkw.wrapped_key"])
        .select("ikw.wrapped_tk as intake_wrapped_tk")
        .select("c.encrypted_alias as encrypted_client_alias")
        .select("c.communication_tier")
        .select((eb) => eb("c.phone_id", "is not", null).as("has_phone"))
        .select("ph.encrypted_number as client_phone_encrypted")
        .select("ph.id as client_phone_id")
        .select("q.encrypted_name as encrypted_queue_name")
        .select("q.sort_order as queue_sort_order")
        .select("u.encrypted_display_name as assigned_display_name")
        .select("pc.id as portal_channel_id")
        .select("pc.client_public as portal_client_public")
        .select("pc.has_passphrase as portal_has_passphrase")
        .select("pc.created_at as portal_created_at")
        .select("pc.last_seen_at as portal_last_seen_at")
        .select("pc.kind as portal_kind")
        .select("pc.account_offer as portal_account_offer")
        .select((eb) => [
          // Creation counts as the ticket's first activity: GREATEST
          // ignores the NULL max() of an empty follow-up set, so tickets
          // with no messages rank by creation recency instead of
          // carrying a NULL that needs a special sort tail. Matches the
          // client comparator's `lastActivityAt ?? createdAt` fallback.
          eb
            .fn<Date>("greatest", [
              eb
                .selectFrom("followups as f")
                .select((sb) => sb.fn.max("f.created_at").as("max_at"))
                .whereRef("f.ticket_id", "=", "t.id"),
              eb.ref("t.created_at"),
            ])
            .as("last_activity_at"),
          eb
            .selectFrom("followups as f")
            .select((sb) => sb.fn.countAll().as("cnt"))
            .whereRef("f.ticket_id", "=", "t.id")
            .as("followup_count"),
        ])
        .where("t.id", "=", ticketId)
        .executeTakeFirst();

      if (!row) throw new NotFoundError(ErrorCode.TICKET_NOT_FOUND);
      return toRecordWithKeyWrap(row);
    },

    async list(userId, opts) {
      const sortBy: TicketSortField = opts.sortBy ?? "date";
      const sortDirection: TicketSortDirection = opts.sortDirection ?? "desc";

      // Scope to queues the user has access to (queue membership check).
      // Without this, any authenticated volunteer could enumerate all
      // ticket metadata across queues they are not assigned to.
      const accessibleQueues = await getAccessibleQueueIds(userId);
      if (accessibleQueues.length === 0) return [];

      let query = db
        .selectFrom("tickets as t")
        .leftJoin("ticket_key_wraps as tkw", (join) =>
          join
            .onRef("tkw.ticket_id", "=", "t.id")
            .on("tkw.volunteer_id", "=", userId)
            .onRef("tkw.key_generation", "=", "t.key_generation"),
        )
        .leftJoin("intake_key_wraps as ikw", "ikw.ticket_id", "t.id")
        .innerJoin("clients as c", "c.id", "t.client_id")
        .leftJoin("phones as ph", "ph.id", "c.phone_id")
        .innerJoin("queues as q", "q.id", "t.queue_id")
        .leftJoin("users as u", (join) =>
          join.on((eb) =>
            eb(eb.cast("t.assigned_to", "uuid"), "=", eb.ref("u.id")),
          ),
        )
        .selectAll("t")
        .select(["tkw.ephemeral_point", "tkw.nonce", "tkw.wrapped_key"])
        .select("ikw.wrapped_tk as intake_wrapped_tk")
        .select("c.encrypted_alias as encrypted_client_alias")
        .select((eb) => eb("c.phone_id", "is not", null).as("has_phone"))
        .select("ph.encrypted_number as client_phone_encrypted")
        .select("ph.id as client_phone_id")
        .select("q.encrypted_name as encrypted_queue_name")
        .select("q.sort_order as queue_sort_order")
        .select("u.encrypted_display_name as assigned_display_name")
        .select((eb) => [
          // Creation counts as the ticket's first activity: GREATEST
          // ignores the NULL max() of an empty follow-up set, so tickets
          // with no messages rank by creation recency instead of
          // carrying a NULL that needs a special sort tail. Matches the
          // client comparator's `lastActivityAt ?? createdAt` fallback.
          eb
            .fn<Date>("greatest", [
              eb
                .selectFrom("followups as f")
                .select((sb) => sb.fn.max("f.created_at").as("max_at"))
                .whereRef("f.ticket_id", "=", "t.id"),
              eb.ref("t.created_at"),
            ])
            .as("last_activity_at"),
          eb
            .selectFrom("followups as f")
            .select((sb) => sb.fn.countAll().as("cnt"))
            .whereRef("f.ticket_id", "=", "t.id")
            .as("followup_count"),
        ])
        .where("t.queue_id", "in", [...accessibleQueues]);

      if (opts.queueIds !== undefined && opts.queueIds.length > 0) {
        query = query.where("t.queue_id", "in", opts.queueIds);
      }
      if (opts.statuses !== undefined && opts.statuses.length > 0) {
        query = query.where("t.status", "in", opts.statuses);
      }
      if (opts.priorities !== undefined && opts.priorities.length > 0) {
        query = query.where("t.priority", "in", opts.priorities);
      }
      if (opts.onHold !== undefined) {
        query = query.where("t.on_hold", "=", opts.onHold);
      }
      if (opts.assignedTo === null) {
        query = query.where("t.assigned_to", "is", null);
      } else if (opts.assignedTo !== undefined) {
        query = query.where("t.assigned_to", "=", opts.assignedTo);
      }
      if (opts.createdAfter !== undefined) {
        query = query.where("t.created_at", ">=", new Date(opts.createdAfter));
      }
      if (opts.createdBefore !== undefined) {
        query = query.where("t.created_at", "<=", new Date(opts.createdBefore));
      }
      // --- Dynamic sort + keyset cursor ---
      //
      // Keyset pagination: the cursor WHERE must match the ORDER BY columns.
      // Each sort mode produces a different composite keyset comparison.
      // Timestamp comparisons use subqueries to preserve PostgreSQL's
      // microsecond precision (JS Date truncates to milliseconds).

      const gt = sortDirection === "asc" ? (">" as const) : ("<" as const);

      // The id tie-break always compares with ">" regardless of direction:
      // every ORDER BY below pins t.id ASC, so the cursor filter must walk
      // ids ascending within equal-key groups. Flipping it with the sort
      // direction makes descending pages skip and repeat rows on ties.

      if (opts.cursor !== undefined) {
        const cursorId = opts.cursor;

        // Subquery: cursor row's created_at (reused across all sort modes)
        const cursorCreatedAt = db
          .selectFrom("tickets")
          .select("created_at")
          .where("id", "=", cursorId);

        if (sortBy === "priority") {
          // Subquery: cursor row's priority sort key. Higher key = more
          // urgent, so desc puts urgent first (matching the client
          // comparator's direction semantics).
          const cursorPriorityKey = db
            .selectFrom("tickets")
            .select((sub) =>
              sub
                .case("priority")
                .when("urgent")
                .then(3)
                .when("high")
                .then(2)
                .when("normal")
                .then(1)
                .when("low")
                .then(0)
                .else(-1)
                .end()
                .as("sort_key"),
            )
            .where("id", "=", cursorId);

          // Three-column keyset: (priority_sort_key, created_at, id)
          query = query.where((eb) => {
            const rowKey = eb
              .case("t.priority")
              .when("urgent")
              .then(3)
              .when("high")
              .then(2)
              .when("normal")
              .then(1)
              .when("low")
              .then(0)
              .else(-1)
              .end();

            return keysetAfter(
              eb,
              gt,
              [
                [rowKey, cursorPriorityKey],
                ["t.created_at", cursorCreatedAt],
              ],
              { column: "t.id", cursorId },
            );
          });
        } else if (sortBy === "last_activity") {
          // Activity is never NULL (GREATEST with created_at treats
          // creation as the first activity), so this is a plain
          // three-column keyset: (activity, created_at, id).
          const cursorLastActivity = db
            .selectFrom("tickets")
            .select((sub) =>
              sub
                .fn<Date>("greatest", [
                  sub
                    .selectFrom("followups")
                    .select((sb) =>
                      sb.fn.max("followups.created_at").as("max_at"),
                    )
                    .whereRef("followups.ticket_id", "=", "tickets.id"),
                  sub.ref("tickets.created_at"),
                ])
                .as("last_activity"),
            )
            .where("tickets.id", "=", cursorId);

          query = query.where((eb) => {
            const rowActivity = eb.fn<Date>("greatest", [
              eb
                .selectFrom("followups as f2")
                .select((sb) => sb.fn.max("f2.created_at").as("max_at"))
                .whereRef("f2.ticket_id", "=", "t.id"),
              eb.ref("t.created_at"),
            ]);

            return keysetAfter(
              eb,
              gt,
              [
                [rowActivity, cursorLastActivity],
                ["t.created_at", cursorCreatedAt],
              ],
              { column: "t.id", cursorId },
            );
          });
        } else if (sortBy === "queue") {
          // Subquery: cursor row's queue sort_order via JOIN
          const cursorSortOrder = db
            .selectFrom("tickets")
            .innerJoin("queues", "queues.id", "tickets.queue_id")
            .select("queues.sort_order")
            .where("tickets.id", "=", cursorId);

          // Three-column keyset: (sort_order, created_at, id)
          query = query.where((eb) =>
            keysetAfter(
              eb,
              gt,
              [
                ["q.sort_order", cursorSortOrder],
                ["t.created_at", cursorCreatedAt],
              ],
              { column: "t.id", cursorId },
            ),
          );
        } else if (sortBy === "msgs") {
          const cursorFollowupCount = db
            .selectFrom("followups")
            .select((sb) => sb.fn.count<number>("followups.id").as("cnt"))
            .where("followups.ticket_id", "=", cursorId);

          query = query.where((eb) => {
            const rowCount = eb
              .selectFrom("followups as f3")
              .select((sb) => sb.fn.count<number>("f3.id").as("cnt"))
              .whereRef("f3.ticket_id", "=", "t.id");

            return keysetAfter(
              eb,
              gt,
              [
                [rowCount, cursorFollowupCount],
                ["t.created_at", cursorCreatedAt],
              ],
              { column: "t.id", cursorId },
            );
          });
        } else {
          // "date": two-column keyset (created_at, id)
          query = query.where((eb) =>
            keysetAfter(eb, gt, [["t.created_at", cursorCreatedAt]], {
              column: "t.id",
              cursorId,
            }),
          );
        }
      }

      // ORDER BY: must match the keyset cursor columns above
      if (sortBy === "priority") {
        // Higher key = more urgent: desc puts urgent first, matching the
        // client comparator. Unknown priorities (else -1) sink on desc.
        query = query
          .orderBy(
            (eb) =>
              eb
                .case("t.priority")
                .when("urgent")
                .then(3)
                .when("high")
                .then(2)
                .when("normal")
                .then(1)
                .when("low")
                .then(0)
                .else(-1)
                .end(),
            sortDirection,
          )
          .orderBy("t.created_at", sortDirection)
          .orderBy("t.id", "asc");
      } else if (sortBy === "last_activity") {
        // last_activity_at is never NULL: creation counts as the first
        // activity (see the GREATEST select above), so empty tickets rank
        // by creation recency, and sorting "least recent activity" surfaces
        // them as exactly-as-stale-as-their-age instead of hiding them in
        // a NULL tail.
        query = query
          .orderBy("last_activity_at", sortDirection)
          .orderBy("t.created_at", sortDirection)
          .orderBy("t.id", "asc");
      } else if (sortBy === "queue") {
        query = query
          .orderBy("q.sort_order", sortDirection)
          .orderBy("t.created_at", sortDirection)
          .orderBy("t.id", "asc");
      } else if (sortBy === "msgs") {
        // The count sort computes a correlated count per candidate row
        // with no index help, fine at current org scale. If it measurably
        // degrades, replace with a leftJoinLateral computing counts once
        // per row, not a denormalized counter column (drift liability).
        query = query
          .orderBy("followup_count", sortDirection)
          .orderBy("t.created_at", sortDirection)
          .orderBy("t.id", "asc");
      } else {
        // "date" (default)
        query = query
          .orderBy("t.created_at", sortDirection)
          .orderBy("t.id", "asc");
      }

      const rows = await query.limit(opts.limit).execute();

      return rows.map(toRecordWithKeyWrap);
    },

    async counts(userId) {
      const queueIds = await getAccessibleQueueIds(userId);
      if (queueIds.length === 0) {
        return {
          total: 0,
          new: 0,
          active: 0,
          closed: 0,
          onHold: 0,
          unassigned: 0,
          mine: 0,
          byPriority: { low: 0, normal: 0, high: 0, urgent: 0 },
        };
      }

      // Left join follow-up counts so we can distinguish new (0 follow-ups)
      // from active (1+ follow-ups) within open tickets.
      const rows = await db
        .selectFrom("tickets as t")
        .leftJoin(
          (eb) =>
            eb
              .selectFrom("followups")
              .select([
                "followups.ticket_id",
                (sb) => sb.fn.countAll().as("fu_count"),
              ])
              .groupBy("followups.ticket_id")
              .as("fc"),
          (join) => join.onRef("fc.ticket_id", "=", "t.id"),
        )
        .where("t.queue_id", "in", [...queueIds])
        .select([
          (eb) =>
            eb.fn
              .sum(
                eb
                  .case()
                  .when(
                    eb.and([
                      eb("t.status", "=", "open"),
                      eb("t.on_hold", "=", false),
                      eb(eb.fn.coalesce("fc.fu_count", eb.lit(0)), "=", 0),
                    ]),
                  )
                  .then(1)
                  .else(0)
                  .end(),
              )
              .as("new_count"),
          (eb) =>
            eb.fn
              .sum(
                eb
                  .case()
                  .when(
                    eb.and([
                      eb("t.status", "=", "open"),
                      eb("t.on_hold", "=", false),
                      eb(eb.fn.coalesce("fc.fu_count", eb.lit(0)), ">", 0),
                    ]),
                  )
                  .then(1)
                  .else(0)
                  .end(),
              )
              .as("active_count"),
          (eb) =>
            eb.fn
              .sum(
                eb
                  .case()
                  .when(eb("t.status", "=", "closed"))
                  .then(1)
                  .else(0)
                  .end(),
              )
              .as("closed_count"),
          (eb) =>
            eb.fn
              .sum(
                eb
                  .case()
                  .when(eb("t.on_hold", "=", true))
                  .then(1)
                  .else(0)
                  .end(),
              )
              .as("on_hold_count"),
          (eb) =>
            eb.fn
              .sum(
                eb
                  .case()
                  .when(
                    eb.and([
                      eb("t.assigned_to", "is", null),
                      eb("t.status", "=", "open"),
                    ]),
                  )
                  .then(1)
                  .else(0)
                  .end(),
              )
              .as("unassigned_count"),
          (eb) =>
            eb.fn
              .sum(
                eb
                  .case()
                  .when(
                    eb.and([
                      eb("t.priority", "=", "low"),
                      eb("t.status", "=", "open"),
                    ]),
                  )
                  .then(1)
                  .else(0)
                  .end(),
              )
              .as("p_low"),
          (eb) =>
            eb.fn
              .sum(
                eb
                  .case()
                  .when(
                    eb.and([
                      eb("t.priority", "=", "normal"),
                      eb("t.status", "=", "open"),
                    ]),
                  )
                  .then(1)
                  .else(0)
                  .end(),
              )
              .as("p_normal"),
          (eb) =>
            eb.fn
              .sum(
                eb
                  .case()
                  .when(
                    eb.and([
                      eb("t.priority", "=", "high"),
                      eb("t.status", "=", "open"),
                    ]),
                  )
                  .then(1)
                  .else(0)
                  .end(),
              )
              .as("p_high"),
          (eb) =>
            eb.fn
              .sum(
                eb
                  .case()
                  .when(
                    eb.and([
                      eb("t.priority", "=", "urgent"),
                      eb("t.status", "=", "open"),
                    ]),
                  )
                  .then(1)
                  .else(0)
                  .end(),
              )
              .as("p_urgent"),
          (eb) =>
            eb.fn
              .sum(
                eb
                  .case()
                  .when(
                    eb.and([
                      eb("t.assigned_to", "=", userId),
                      eb("t.status", "=", "open"),
                    ]),
                  )
                  .then(1)
                  .else(0)
                  .end(),
              )
              .as("mine_count"),
          (eb) => eb.fn.countAll().as("total_count"),
        ])
        .executeTakeFirstOrThrow();

      return {
        total: Number(rows.total_count),
        new: Number(rows.new_count),
        active: Number(rows.active_count),
        closed: Number(rows.closed_count),
        onHold: Number(rows.on_hold_count),
        unassigned: Number(rows.unassigned_count),
        mine: Number(rows.mine_count),
        byPriority: {
          low: Number(rows.p_low),
          normal: Number(rows.p_normal),
          high: Number(rows.p_high),
          urgent: Number(rows.p_urgent),
        },
      };
    },

    async update(userId, input) {
      await access.assertAccess(userId, input.ticketId);

      const updates: Record<string, unknown> = {};
      if (input.status !== undefined) updates.status = input.status;
      if (input.priority !== undefined) updates.priority = input.priority;
      if (input.queueId !== undefined) updates.queue_id = input.queueId;
      if (input.onHold !== undefined) updates.on_hold = input.onHold;

      if (Object.keys(updates).length === 0) {
        const existing = await db
          .selectFrom("tickets")
          .selectAll()
          .where("id", "=", input.ticketId)
          .executeTakeFirst();
        if (!existing) throw new NotFoundError(ErrorCode.TICKET_NOT_FOUND);
        return toRecord(existing);
      }

      const row = await db
        .updateTable("tickets")
        .set(updates)
        .where("id", "=", input.ticketId)
        .returningAll()
        .executeTakeFirst();

      if (!row) throw new NotFoundError(ErrorCode.TICKET_NOT_FOUND);

      // Create system follow-ups for state changes
      if (input.onHold !== undefined) {
        await createSystemFollowUp(
          db,
          input.ticketId,
          input.onHold ? "hold_placed" : "hold_removed",
        );
      }
      if (input.priority !== undefined) {
        await createSystemFollowUp(db, input.ticketId, "priority_changed", {
          to: input.priority,
        });
      }
      if (input.status !== undefined) {
        await createSystemFollowUp(
          db,
          input.ticketId,
          input.status === "open" ? "status_opened" : "status_closed",
        );
      }

      return toRecord(row);
    },

    async close(userId, ticketId) {
      await access.assertAccess(userId, ticketId);

      // Check unresolved dependencies
      const resolved = await depService.allResolved(ticketId);
      if (!resolved) {
        throw new TicketError(ErrorCode.TICKET_UNRESOLVED_DEPS);
      }

      const row = await db
        .updateTable("tickets")
        .set({ status: "closed" })
        .where("id", "=", ticketId)
        .where("status", "=", "open")
        .returningAll()
        .executeTakeFirst();

      if (!row) throw new NotFoundError(ErrorCode.TICKET_NOT_FOUND_OR_CLOSED);

      await createSystemFollowUp(db, ticketId, "status_closed");
      return toRecord(row);
    },

    async reopen(userId, ticketId, newKeyGeneration) {
      await access.assertAccess(userId, ticketId);

      const row = await db
        .updateTable("tickets")
        .set({
          status: "open",
          key_generation: newKeyGeneration,
        })
        .where("id", "=", ticketId)
        .where("status", "=", "closed")
        .returningAll()
        .executeTakeFirst();

      if (!row) throw new NotFoundError(ErrorCode.TICKET_NOT_FOUND_OR_OPEN);

      await createSystemFollowUp(db, ticketId, "status_opened");
      return toRecord(row);
    },

    async recentFollowUps(
      userId: UserId,
      input: RecentFollowUpsInput,
    ): Promise<Record<string, FollowUpPreview[]>> {
      const accessibleQueues = await getAccessibleQueueIds(userId);
      if (accessibleQueues.length === 0) return {};

      // Derived table: rank follow-ups per ticket by recency.
      // Uses eb.fn.agg("row_number") with .over() for typesafe window function
      // (column names checked by Kysely). LATERAL JOIN is not supported by
      // Kysely, so ROW_NUMBER + outer filter achieves the same top-N-per-group.
      const ranked = db
        .selectFrom("followups as f")
        .select((eb) => [
          eb.ref("f.id").as("id"),
          eb.ref("f.ticket_id").as("ticket_id"),
          eb.ref("f.source").as("source"),
          eb.ref("f.type").as("type"),
          eb.ref("f.encrypted_content").as("encrypted_content"),
          eb.ref("f.created_at").as("created_at"),
          eb.ref("f.note_type_id").as("note_type_id"),
          eb.ref("f.event_params").as("event_params"),
          eb.ref("f.key_generation").as("key_generation"),
          eb.fn
            .agg<number>("row_number")
            .over((ob) =>
              ob.partitionBy("f.ticket_id").orderBy("f.created_at", "desc"),
            )
            .as("rn"),
          eb
            .exists(
              eb
                .selectFrom("recordings as r")
                .whereRef("r.followup_id", "=", "f.id")
                .where("r.deleted_at", "is", null)
                .select(eb.lit(1).as("one")),
            )
            .as("has_recording"),
          eb
            .exists(
              eb
                .selectFrom("attachments as a")
                .whereRef("a.followup_id", "=", "f.id")
                .where("a.deleted_at", "is", null)
                .where("a.content_type", "like", "image/%")
                .select(eb.lit(1).as("one")),
            )
            .as("has_image"),
          eb
            .exists(
              eb
                .selectFrom("attachments as a2")
                .whereRef("a2.followup_id", "=", "f.id")
                .where("a2.deleted_at", "is", null)
                .where((w) =>
                  w.or([
                    w("a2.content_type", "is", null),
                    w("a2.content_type", "not like", "image/%"),
                  ]),
                )
                .select(eb.lit(1).as("one")),
            )
            .as("has_file"),
        ])
        .where("f.ticket_id", "in", input.ticketIds)
        .$if(input.types !== undefined && input.types.length > 0, (qb) => {
          const types = input.types;
          if (types === undefined) return qb;
          return qb.where("f.type", "in", types);
        })
        .as("ranked_f");

      const rows = await db
        .selectFrom("tickets as t")
        .innerJoin(ranked, (join) =>
          join
            .onRef("ranked_f.ticket_id", "=", "t.id")
            .on("ranked_f.rn", "<=", input.perTicket),
        )
        .leftJoin("ticket_key_wraps as tkw", (join) =>
          join
            .onRef("tkw.ticket_id", "=", "t.id")
            .on("tkw.volunteer_id", "=", userId)
            .onRef("tkw.key_generation", "=", "t.key_generation"),
        )
        .select([
          "ranked_f.id",
          "ranked_f.ticket_id",
          "ranked_f.source",
          "ranked_f.type",
          "ranked_f.encrypted_content",
          "ranked_f.created_at",
          "ranked_f.has_recording",
          "ranked_f.has_image",
          "ranked_f.has_file",
          "ranked_f.note_type_id",
          "ranked_f.event_params",
          "ranked_f.key_generation",
          "tkw.ephemeral_point",
          "tkw.nonce",
          "tkw.wrapped_key",
        ])
        .where("t.id", "in", input.ticketIds)
        .where("t.queue_id", "in", [...accessibleQueues])
        .orderBy("ranked_f.ticket_id")
        .orderBy("ranked_f.created_at", "desc")
        .execute();

      const result: Record<string, FollowUpPreview[]> = {};
      for (const row of rows) {
        const preview: FollowUpPreview = {
          id: row.id,
          ticketId: row.ticket_id,
          source: row.source,
          type: row.type,
          encryptedContent: row.encrypted_content,
          createdAt: row.created_at,
          // A pending-convergence row (non-null key_generation) is
          // encrypted under tk_temp, not the canonical tk; attaching the
          // ticket wrap would make the list preview decrypt with the
          // wrong key and poison the shared client cache with an error
          // sentinel before the detail's sealed-wrap path can run. The
          // preview shows a placeholder until convergence instead.
          keyWrap:
            row.key_generation == null
              ? buildKeyWrap(row.ephemeral_point, row.nonce, row.wrapped_key)
              : null,
          hasRecording: Boolean(row.has_recording),
          hasImage: Boolean(row.has_image),
          hasFile: Boolean(row.has_file),
          noteTypeId: row.note_type_id ?? null,
          eventParams: row.event_params ?? null,
        };
        const list = result[row.ticket_id];
        if (list) {
          list.push(preview);
        } else {
          result[row.ticket_id] = [preview];
        }
      }
      return result;
    },

    async listReadState(
      userId: UserId,
      input: ListReadStateInput,
    ): Promise<Record<string, TicketReadState>> {
      const accessibleQueues = await getAccessibleQueueIds(userId);
      if (accessibleQueues.length === 0) return {};

      // Requested ids outside accessible queues are silently filtered,
      // mirroring recentFollowUps.
      const accessibleTickets = await db
        .selectFrom("tickets")
        .select("id")
        .where("id", "in", input.ticketIds)
        .where("queue_id", "in", [...accessibleQueues])
        .execute();
      const scopedIds = accessibleTickets.map((t) => t.id);
      if (scopedIds.length === 0) return {};

      // Read-only cursor fetch: never creates dummy rows. The list path
      // must not change the "row exists = opened detail once" surface.
      const cursors = await readCursors.getBatch(userId, scopedIds);

      // Newest non-system, non-self follow-up timestamps per ticket.
      // System events (status/hold/priority changes) are not replies, and
      // the caller's own replies are not unread to the caller, so neither
      // counts toward unread. IS DISTINCT FROM keeps client-authored rows,
      // where created_by is null. Same ROW_NUMBER top-N-per-group pattern
      // as recentFollowUps.
      const ranked = db
        .selectFrom("followups as f")
        .select((eb) => [
          eb.ref("f.ticket_id").as("ticket_id"),
          eb.ref("f.created_at").as("created_at"),
          eb.fn
            .agg<number>("row_number")
            .over((ob) =>
              ob.partitionBy("f.ticket_id").orderBy("f.created_at", "desc"),
            )
            .as("rn"),
        ])
        .where("f.ticket_id", "in", scopedIds)
        .where("f.source", "!=", "system")
        .where("f.created_by", "is distinct from", userId)
        .as("ranked_f");

      const timestampRows = await db
        .selectFrom(ranked)
        .select(["ticket_id", "created_at"])
        .where("rn", "<=", READ_STATE_TIMESTAMPS_PER_TICKET)
        .orderBy("ticket_id")
        .orderBy("created_at", "desc")
        .execute();

      const result: Record<string, TicketReadState> = Object.fromEntries(
        scopedIds.map((id): [string, TicketReadState] => [
          id,
          {
            encryptedReadCursor: cursors.get(id) ?? null,
            followUpCreatedAt: [],
          },
        ]),
      );
      for (const row of timestampRows) {
        result[row.ticket_id]?.followUpCreatedAt.push(row.created_at);
      }
      return result;
    },

    async sweepReadState(
      userId: UserId,
      input: SweepReadStateInput,
    ): Promise<SweepReadStateResult> {
      const accessibleQueues = await getAccessibleQueueIds(userId);
      if (accessibleQueues.length === 0) return { items: [], nextCursor: null };

      // Enumerates the user's own cursor rows for open tickets in
      // accessible queues. Row existence is deliberate metadata ("opened
      // the detail view once"), so the sweep reveals nothing the server
      // does not already hold. Zero writes; out-of-scope rows are
      // silently filtered, mirroring listReadState.
      const afterId = input.cursor;
      const rows = await db
        .selectFrom("ticket_read_cursors as rc")
        .innerJoin("tickets as t", "t.id", "rc.ticket_id")
        .leftJoin("ticket_key_wraps as tkw", (join) =>
          join
            .onRef("tkw.ticket_id", "=", "t.id")
            .on("tkw.volunteer_id", "=", userId)
            .onRef("tkw.key_generation", "=", "t.key_generation"),
        )
        .select((eb) => [
          "rc.ticket_id",
          "rc.encrypted_read_cursor",
          "tkw.ephemeral_point",
          "tkw.nonce",
          "tkw.wrapped_key",
          // Newest non-system, non-self activity: system events are not
          // replies and the caller's own replies are not unread to the
          // caller (same rules as listReadState; IS DISTINCT FROM keeps
          // null-authored client rows). A ticket with no such activity
          // reads as null and the client treats it as not-unread.
          eb
            .selectFrom("followups as f")
            .select((sb) => sb.fn.max("f.created_at").as("max_at"))
            .whereRef("f.ticket_id", "=", "t.id")
            .where("f.source", "!=", "system")
            .where("f.created_by", "is distinct from", userId)
            .as("latest_activity_at"),
        ])
        .where("rc.user_id", "=", userId)
        .where("t.status", "=", "open")
        .where("t.queue_id", "in", [...accessibleQueues])
        .$if(afterId !== undefined, (qb) => {
          if (afterId === undefined) return qb;
          return qb.where("rc.ticket_id", ">", afterId);
        })
        .orderBy("rc.ticket_id")
        .limit(input.limit)
        .execute();

      const items = rows.map((row): SweepReadStateEntry => ({
        ticketId: row.ticket_id,
        encryptedReadCursor: row.encrypted_read_cursor,
        latestActivityAt: row.latest_activity_at,
        keyWrap: buildKeyWrap(row.ephemeral_point, row.nonce, row.wrapped_key),
      }));

      const last = items.at(-1);
      return {
        items,
        nextCursor: items.length === input.limit && last ? last.ticketId : null,
      };
    },

    async searchClients(query, limit, userId, isAdmin) {
      // Queue scoping. Without this, any authenticated volunteer could
      // enumerate every client in the org through alias search, including
      // clients whose tickets live in queues they were never assigned to.
      // Admins are org-wide by design; a future org-level "all volunteers see
      // everything" flag can widen the bypass at this same branch.
      const accessibleQueues = isAdmin
        ? []
        : await getAccessibleQueueIds(userId);

      // The server cannot substring-match ciphertext, so this returns the
      // most recent clients in scope and the browser filters them after
      // decrypting. A non-empty query is a blind index hash and narrows to an
      // exact alias match, which reaches clients outside the recent window.
      //
      // The narrowing is conditional on purpose. Applying it unconditionally
      // would return nothing for an empty query, and would permanently hide
      // every client created by an inbound webhook, since those rows carry a
      // null alias_hash until a browser backfills it.
      let search = db
        .selectFrom("clients as c")
        .leftJoin("phones as p", "p.id", "c.phone_id")
        .select(["c.id", "c.encrypted_alias", "p.encrypted_number"])
        .where("c.merged_into", "is", null);

      if (query !== "") {
        search = search.where(
          "c.alias_hash",
          "=",
          aliasHashSchema.parse(query),
        );
      }

      if (!isAdmin) {
        search = search.where((eb) =>
          eb.exists(
            eb
              .selectFrom("tickets as t")
              .select("t.id")
              .whereRef("t.client_id", "=", "c.id")
              .where((inner) =>
                inner.or([
                  // Reachable through queue membership...
                  ...(accessibleQueues.length > 0
                    ? [inner("t.queue_id", "in", [...accessibleQueues])]
                    : []),
                  // ...or through direct assignment...
                  inner("t.assigned_to", "=", userId),
                  // ...or by being CC'd on the ticket.
                  inner.exists(
                    inner
                      .selectFrom("ticket_watchers as tw")
                      .select("tw.user_id")
                      .whereRef("tw.ticket_id", "=", "t.id")
                      .where("tw.user_id", "=", userId),
                  ),
                ]),
              ),
          ),
        );
      }

      const results = await search
        .orderBy("c.created_at", "desc")
        .limit(limit)
        .execute();

      const encryptor = deps?.fieldEncryptor;
      if (!encryptor) {
        return results.map((r) => ({
          id: r.id,
          encryptedAlias: r.encrypted_alias,
          maskedPhone: r.encrypted_number ? "***" : null,
        }));
      }

      return results.map((r) => ({
        id: r.id,
        encryptedAlias: r.encrypted_alias,
        maskedPhone: r.encrypted_number
          ? maskPhone(encryptor.decryptToBuffer(r.encrypted_number))
          : null,
      }));
    },

    async updateContent(
      userId: UserId,
      input: UpdateTicketContentServiceInput,
    ): Promise<TicketRecord> {
      await access.assertAccess(userId, input.ticketId);

      return db.transaction().execute(async (trx) => {
        const existing = await trx
          .selectFrom("tickets")
          .selectAll()
          .where("id", "=", input.ticketId)
          .executeTakeFirst();

        if (!existing) throw new NotFoundError(ErrorCode.TICKET_NOT_FOUND);

        if (existing.key_generation !== input.keyGeneration) {
          throw new TicketError(ErrorCode.TICKET_KEY_GENERATION_STALE);
        }

        const updates: Record<string, unknown> = {};
        if (input.encryptedTitle !== undefined) {
          updates.encrypted_title = input.encryptedTitle;
        }
        if (input.encryptedDescription !== undefined) {
          updates.encrypted_description = input.encryptedDescription;
        }

        // Guard the write with the same key_generation so a reopen
        // committing between the read above and this UPDATE cannot be
        // overwritten.
        const row = await trx
          .updateTable("tickets")
          .set(updates)
          .where("id", "=", input.ticketId)
          .where("key_generation", "=", input.keyGeneration)
          .returningAll()
          .executeTakeFirst();

        if (!row) throw new TicketError(ErrorCode.TICKET_KEY_GENERATION_STALE);

        // The snapshot insert is transactional with the UPDATE: the
        // previous ciphertext exists nowhere else once the edit commits,
        // so the edit and its snapshot must commit or roll back together.
        // Direct insert here, NOT AuditService.log(): that method
        // deliberately swallows failures (best-effort accountability
        // logging), which is the wrong contract when the audit row is
        // the only copy of replaced ciphertext.
        const metadata: Record<string, unknown> = {
          keyGeneration: input.keyGeneration,
        };
        if (input.encryptedTitle !== undefined) {
          metadata.previousEncryptedTitle =
            existing.encrypted_title.toString("base64url");
        }
        if (input.encryptedDescription !== undefined) {
          metadata.previousEncryptedDescription =
            existing.encrypted_description.toString("base64url");
        }

        await trx
          .insertInto("audit_log")
          .values({
            event_type: "ticket_content_updated",
            actor_id: input.actorId,
            ticket_id: input.ticketId,
            metadata,
          })
          .execute();

        return toRecord(row);
      });
    },
  };
}

// ---------------------------------------------------------------------------
// Encrypted Account helpers (volunteer-side, called from tickets router)
// ---------------------------------------------------------------------------

/**
 * Toggles the account_offer flag on a client's active secure_link channel.
 * Returns true when a row was updated. Returns false when no qualifying
 * channel exists (the caller maps this to a typed NotFound).
 */
export async function setAccountOfferForClient(
  db: Kysely<TenantDatabase>,
  clientId: ClientId,
  enabled: boolean,
): Promise<boolean> {
  const result = await db
    .updateTable("portal_channels")
    .set({ account_offer: enabled })
    .where("client_id", "=", clientId)
    .where("status", "=", "active")
    .where("kind", "=", "secure_link")
    .executeTakeFirst();

  return result.numUpdatedRows > 0n;
}

/**
 * Checks whether a client has an encrypted account row.
 * Used by the reset procedure to surface a typed NotFound before delegating
 * to account-service (which is no-op-safe and would silently succeed).
 */
export async function clientHasAccount(
  db: Kysely<TenantDatabase>,
  clientId: ClientId,
): Promise<boolean> {
  const row = await db
    .selectFrom("client_accounts")
    .select("id")
    .where("client_id", "=", clientId)
    .executeTakeFirst();
  return row !== undefined;
}
