/**
 * Portal message service.
 *
 * Provides bootstrap (auth-gated read), client reply, volunteer-side
 * client copy storage, 30-day lazy expiry, and SMS nudge for Secure
 * Link portal channels.
 *
 * All ciphertext fields are opaque passthrough. This service never
 * calls buffer.toString() on any content field.
 *
 * The account portal reuses storeClientCopy and nudgeClient for
 * account-session channels. Keep service functions keyed on a resolved
 * channel row, not on the auth mechanism.
 */

import type { Kysely, Transaction } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { PortalChannelRow } from "./channel-service.js";
import type { TelephonyProvider } from "../telephony/provider.js";
import type { CallerIdResolver } from "../telephony/phone-resolver.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import type { NotificationService } from "../notifications/service.js";
import type { BlobStore } from "../storage/store.js";
import { enqueueNotification } from "../notifications/outbox.js";
import { reopenClosedTicket } from "../tickets/ticket-reopen.js";
import { portal_nudge_sms_body } from "@care-y/shared/paraglide/messages.js";
import type { Locale } from "@care-y/shared/paraglide/runtime.js";
import { resolveClientPhone } from "../routes/relay.js";
import { NotFoundError } from "../errors.js";
import { ErrorCode } from "@care-y/shared";
import { encode } from "@care-y/crypto";
import { PORTAL_SURFACE_KINDS } from "@care-y/shared";
import type {
  TicketId,
  FollowupId,
  KeyGeneration,
  ChannelRowId,
  OrgId,
  OrgSchema,
  OrgSlug,
  PortalMessageId,
} from "@care-y/shared";
import {
  prepareAttachment,
  insertAttachmentRow,
  insertClientWrap,
  listChannelAttachments,
  purgeChannelAttachments,
  type AttachmentInput,
  type PortalAttachmentWire,
  type PreparedAttachment,
} from "./portal-attachment-service.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EXPIRY_DAYS = 30;

// ---------------------------------------------------------------------------
// Input / output types
// ---------------------------------------------------------------------------

export interface EciesTripleBuffers {
  readonly ephemeralPoint: Buffer;
  readonly nonce: Buffer;
  readonly ciphertext: Buffer;
}

export interface PortalReplyServiceInput {
  readonly ticketId: TicketId;
  readonly followUpId: FollowupId;
  readonly keyGeneration: KeyGeneration;
  readonly encryptedContent: Buffer;
  readonly wrappedTkTemp: Buffer;
  readonly selfCopy: EciesTripleBuffers;
  /** Followup type: "message" (default) or "contact_correction". */
  readonly kind?: "message" | "contact_correction";
  /** Attachments riding the reply, each already encrypted under its own file key. */
  readonly attachments?: readonly ReplyAttachmentInput[];
}

/**
 * One attachment on a client reply, with the wrap that keeps it readable
 * to the sender.
 *
 * The self copy sits on the attachment rather than in a second array
 * beside it. Two arrays walked by index can fall out of step, and the
 * failure is quiet. The file is stored, the wrap is missing, and the
 * person who sent it finds a file they cannot open with nothing logged.
 */
export interface ReplyAttachmentInput extends AttachmentInput {
  readonly selfCopy: EciesTripleBuffers;
}

export interface PortalMessageWire {
  readonly id: string;
  readonly followupId: string;
  readonly direction: string;
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly ciphertext: string;
  readonly createdAt: string;
  readonly editedAt: string | null;
}

export interface PortalBootstrapResult {
  readonly hasPassphrase: boolean;
  readonly keyCheck: {
    readonly ephemeralPoint: string;
    readonly nonce: string;
    readonly ciphertext: string;
  };
  readonly ticketId: TicketId | null;
  readonly messages: readonly PortalMessageWire[];
  readonly attachments: readonly PortalAttachmentWire[];
  readonly messagesExpireDays: number;
  /** Org-configured quick-exit target; null falls back to the client default. */
  readonly safeExitUrl: string | null;
  /** True when a Secure Link channel has the account offer enabled. */
  readonly accountOffer: boolean;
}

export interface PortalMessageServiceDeps {
  readonly getProvider: (orgId: OrgId) => Promise<TelephonyProvider | null>;
  readonly resolveCallerIdByPurpose: CallerIdResolver;
  readonly fieldEncryptor: FieldEncryptor;
  readonly notificationService: NotificationService;
  readonly blobStore: BlobStore;
  readonly orgId: OrgId;
  readonly orgSchema: OrgSchema;
  readonly orgSlug: OrgSlug;
}

// ---------------------------------------------------------------------------
// Row-to-wire mapping (shared by bootstrap and listMessages)
// ---------------------------------------------------------------------------

interface PortalMessageRow {
  readonly id: string;
  readonly followup_id: string;
  readonly direction: string;
  readonly ephemeral_point: Buffer;
  readonly nonce: Buffer;
  readonly ciphertext: Buffer;
  readonly created_at: Date;
  readonly edited_at: Date | null;
}

/** Maps a raw portal_messages row to the base64-encoded wire shape. */
function rowToWire(r: PortalMessageRow): PortalMessageWire {
  return {
    id: r.id,
    followupId: r.followup_id,
    direction: r.direction,
    ephemeralPoint: encode(new Uint8Array(r.ephemeral_point)),
    nonce: encode(new Uint8Array(r.nonce)),
    ciphertext: encode(new Uint8Array(r.ciphertext)),
    createdAt: r.created_at.toISOString(),
    editedAt: r.edited_at ? r.edited_at.toISOString() : null,
  };
}

export interface PortalMessageListResult {
  readonly messages: PortalMessageWire[];
  readonly totalCount: number;
}

// ---------------------------------------------------------------------------
// bootstrap
// ---------------------------------------------------------------------------

/**
 * Mark the channel seen and drop copies past the inactivity boundary.
 *
 * Every read path runs this before returning messages, because the expiry
 * is lazy: a channel that went quiet past the boundary must not hand back
 * copies that were supposed to be gone. Kept separate from `bootstrap` so
 * a paging read can carry the same session semantics without also loading
 * the whole conversation and resolving a ticket it does not use.
 */
async function touchChannel(
  db: Kysely<TenantDatabase>,
  channel: PortalChannelRow,
): Promise<void> {
  // Stamp last_seen_at (justified server timestamp: autonomous nudge dedup)
  await db
    .updateTable("portal_channels")
    .set({ last_seen_at: new Date() })
    .where("id", "=", channel.id)
    .execute();

  const lastActivity = channel.last_seen_at ?? channel.created_at;
  const boundaryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  if (Date.now() - lastActivity.getTime() > boundaryMs) {
    // Drop both message copies and attachment wraps in one transaction
    // so the expired thread's files stop opening for the client atomically.
    await db.transaction().execute(async (trx) => {
      await trx
        .deleteFrom("portal_messages")
        .where("channel_id", "=", channel.id)
        .execute();
      await purgeChannelAttachments(trx, channel.id);
    });
  }
}

export async function bootstrap(
  db: Kysely<TenantDatabase>,
  channel: PortalChannelRow,
): Promise<PortalBootstrapResult> {
  await touchChannel(db, channel);

  // Resolve current ticket: open first, else most recent
  const ticket = await db
    .selectFrom("tickets")
    .select(["id", "status"])
    .where("client_id", "=", channel.client_id)
    .orderBy(
      (eb) => eb.case().when("status", "=", "open").then(0).else(1).end(),
      "asc",
    )
    .orderBy("created_at", "desc")
    .executeTakeFirst();

  // Load messages (both directions, ordered by created_at)
  const rows = await db
    .selectFrom("portal_messages")
    .select([
      "id",
      "followup_id",
      "direction",
      "ephemeral_point",
      "nonce",
      "ciphertext",
      "created_at",
      "edited_at",
    ])
    .where("channel_id", "=", channel.id)
    .orderBy("created_at", "asc")
    .execute();

  const messages: PortalMessageWire[] = rows.map(rowToWire);
  const attachments = await listChannelAttachments(db, channel.id);

  const orgConfig = await db
    .selectFrom("org_config")
    .select("portal_safe_exit_url")
    .executeTakeFirst();

  return {
    hasPassphrase: channel.has_passphrase,
    keyCheck: {
      ephemeralPoint: encode(new Uint8Array(channel.key_check_ephemeral_point)),
      nonce: encode(new Uint8Array(channel.key_check_nonce)),
      ciphertext: encode(new Uint8Array(channel.key_check_ciphertext)),
    },
    ticketId: ticket?.id ?? null,
    messages,
    attachments,
    messagesExpireDays: EXPIRY_DAYS,
    safeExitUrl: orgConfig?.portal_safe_exit_url ?? null,
    accountOffer:
      (PORTAL_SURFACE_KINDS as readonly string[]).includes(channel.kind) &&
      channel.account_offer,
  };
}

// ---------------------------------------------------------------------------
// clientReply
// ---------------------------------------------------------------------------

/**
 * Client reply: validates ticket ownership, reopens closed tickets,
 * inserts follow-up + portal_reply_key_wraps + from_client self copy
 * in one transaction, and enqueues the volunteer notification in that
 * same transaction so the reply and the notification intent commit
 * together. Delivery happens later in the outbox drainer.
 *
 * Never creates a ticket. If the ticket is gone (deleted), rejects
 * with the generic error.
 */
export async function clientReply(
  db: Kysely<TenantDatabase>,
  deps: PortalMessageServiceDeps,
  channel: PortalChannelRow,
  input: PortalReplyServiceInput,
): Promise<void> {
  // Validate ticket ownership: the ticket must belong to this channel's client
  const ticket = await db
    .selectFrom("tickets")
    .select(["id", "status", "client_id", "queue_id"])
    .where("id", "=", input.ticketId)
    .executeTakeFirst();

  if (ticket?.client_id !== channel.client_id) {
    throw new NotFoundError(ErrorCode.PORTAL_CHANNEL_NOT_FOUND);
  }

  const queueId = ticket.queue_id;

  // Prepare attachments BEFORE opening the transaction. The blob store is
  // external storage (disk / object store) and must not be held inside a
  // database transaction, the same pattern as kb.ts uploads.
  const attachmentInputs = input.attachments ?? [];
  const prepared: {
    row: PreparedAttachment;
    selfCopy: EciesTripleBuffers;
  }[] = [];
  for (const att of attachmentInputs) {
    prepared.push({
      row: await prepareAttachment(deps.blobStore, deps.orgSchema, att),
      selfCopy: att.selfCopy,
    });
  }

  try {
    await db.transaction().execute(async (trx) => {
      // Reopen closed ticket via the shared helper
      if (ticket.status === "closed") {
        await reopenClosedTicket(trx, ticket.id);
      }

      // Insert follow-up (source: client, type from input or default "message")
      await trx
        .insertInto("followups")
        .values({
          id: input.followUpId,
          ticket_id: input.ticketId,
          source: "client",
          type: input.kind ?? "message",
          encrypted_content: input.encryptedContent,
          created_by: null,
          key_generation: input.keyGeneration,
        })
        .execute();

      // Insert portal_reply_key_wraps row (sealed tk_temp)
      await trx
        .insertInto("portal_reply_key_wraps")
        .values({
          followup_id: input.followUpId,
          wrapped_tk: input.wrappedTkTemp,
        })
        .execute();

      // Insert from_client self copy in portal_messages
      await storeClientCopy(
        trx,
        channel.id,
        input.followUpId,
        input.selfCopy,
        "from_client",
      );

      // Insert attachment rows and client wraps inside the same transaction
      for (const { row, selfCopy } of prepared) {
        await insertAttachmentRow(trx, row, input.followUpId);
        await insertClientWrap(trx, {
          attachmentId: row.attachmentId,
          channelRowId: channel.id,
          followupId: input.followUpId,
          direction: "from_client",
          copy: selfCopy,
        });
      }

      // Volunteer notification intent, written in the same transaction as
      // the reply so the two commit together. The drainer resolves
      // recipients and sends later, so nothing here waits on delivery.
      await enqueueNotification(trx, {
        eventType: "followup_added",
        ticketId: input.ticketId,
        queueId,
        formId: null,
        actorUserId: null,
      });
    });
  } catch (err: unknown) {
    // Best-effort cleanup: remove orphaned blobs if the DB transaction fails.
    // Failure here is harmless (orphaned blob on disk, no DB reference).
    for (const p of prepared) {
      await deps.blobStore.delete(p.row.blobKey).catch((_: unknown) => {
        // Intentional: blob orphan is harmless, swallow delete failure
      });
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// storeClientCopy
// ---------------------------------------------------------------------------

/**
 * Insert a portal_messages row for a client copy.
 *
 * Accepts a transaction handle so the caller (followup-service create,
 * clientReply) can include it in its atomic write. The account portal
 * reuses this for account-session channels.
 */
export async function storeClientCopy(
  trx: Kysely<TenantDatabase> | Transaction<TenantDatabase>,
  channelRowId: ChannelRowId,
  followupId: FollowupId,
  copy: EciesTripleBuffers,
  direction: "to_client" | "from_client" = "to_client",
): Promise<void> {
  await trx
    .insertInto("portal_messages")
    .values({
      channel_id: channelRowId,
      followup_id: followupId,
      direction,
      ephemeral_point: copy.ephemeralPoint,
      nonce: copy.nonce,
      ciphertext: copy.ciphertext,
    })
    .execute();
}

/**
 * How long an org reply counts as active engagement on a channel.
 * Matches the reply limiter window: an engaged conversation is exempt
 * from the per-IP reply cap for as long as one limiter window.
 */
export const ORG_ENGAGEMENT_WINDOW_MS = 60 * 60 * 1000;

/**
 * True when the org has replied on this channel within the window.
 *
 * Drives the per-IP reply cap exemption: a two-sided conversation is
 * the signal that the traffic is not abuse, and this check reads only
 * channel-side thread state, so the server never has to link an IP to
 * a channel to grant the exemption.
 */
export async function hasRecentOrgReply(
  db: Kysely<TenantDatabase> | Transaction<TenantDatabase>,
  channelRowId: ChannelRowId,
  windowMs: number = ORG_ENGAGEMENT_WINDOW_MS,
): Promise<boolean> {
  const row = await db
    .selectFrom("portal_messages")
    .select("id")
    .where("channel_id", "=", channelRowId)
    .where("direction", "=", "to_client")
    .where("created_at", ">", new Date(Date.now() - windowMs))
    .limit(1)
    .executeTakeFirst();
  return row !== undefined;
}

// ---------------------------------------------------------------------------
// listMessages
// ---------------------------------------------------------------------------

/**
 * Cursor-paged portal message listing.
 *
 * Keyset on (created_at, id) with a subquery for the cursor row's
 * timestamp so microsecond precision stays in Postgres. The "older"
 * direction walks backwards and reverses the result so callers always
 * receive oldest-first order.
 */
export async function listMessages(
  db: Kysely<TenantDatabase>,
  channel: PortalChannelRow,
  opts: {
    limit: number;
    cursor?: PortalMessageId;
    direction: "older" | "newer";
  },
): Promise<PortalMessageListResult> {
  await touchChannel(db, channel);

  const isOlder = opts.direction === "older";

  let query = db
    .selectFrom("portal_messages")
    .select([
      "id",
      "followup_id",
      "direction",
      "ephemeral_point",
      "nonce",
      "ciphertext",
      "created_at",
      "edited_at",
    ])
    .where("channel_id", "=", channel.id);

  if (opts.cursor !== undefined) {
    const cursorId = opts.cursor;
    const cursorCreatedAt = db
      .selectFrom("portal_messages")
      .select("created_at")
      .where("id", "=", cursorId)
      .where("channel_id", "=", channel.id);

    const timeOp = isOlder ? "<" : ">";
    const tieOp = isOlder ? "<" : ">";

    query = query.where((eb) =>
      eb.or([
        eb("created_at", timeOp, cursorCreatedAt),
        eb.and([
          eb("created_at", "=", cursorCreatedAt),
          eb("id", tieOp, cursorId),
        ]),
      ]),
    );
  }

  const sortDir = isOlder ? "desc" : "asc";
  const rows = await query
    .orderBy("created_at", sortDir)
    .orderBy("id", sortDir)
    .limit(opts.limit)
    .execute();

  const messages = isOlder
    ? rows.reverse().map(rowToWire)
    : rows.map(rowToWire);

  const countResult = await db
    .selectFrom("portal_messages")
    .select((eb) => eb.fn.countAll<number>().as("cnt"))
    .where("channel_id", "=", channel.id)
    .executeTakeFirstOrThrow();

  return {
    messages,
    // countAll<number>() plus the INT8 type parser in db.ts means this
    // arrives as a real number rather than the string node-postgres would
    // otherwise hand back for a bigint.
    totalCount: countResult.cnt,
  };
}

// ---------------------------------------------------------------------------
// nudgeClient
// ---------------------------------------------------------------------------

/**
 * SMS nudge: sends a static localized notification to the client's
 * phone when there is unread portal activity.
 *
 * Skips when:
 * - last_notified_at > last_seen_at (already nudged since last visit)
 * - client has no phone on file
 *
 * The nudge body contains no content, no link, no key material.
 * Phone Buffer is zeroed in the finally block.
 *
 * Failures log { orgSlug, reason } and never propagate. A nudge
 * failure must never fail a reply.
 */
export async function nudgeClient(
  db: Kysely<TenantDatabase>,
  deps: PortalMessageServiceDeps,
  channel: PortalChannelRow,
): Promise<void> {
  let phoneBuf: Buffer | null = null;

  try {
    // Dedup: skip if already nudged since last visit
    if (
      channel.last_notified_at !== null &&
      channel.last_seen_at !== null &&
      channel.last_notified_at.getTime() > channel.last_seen_at.getTime()
    ) {
      return;
    }
    // Also skip if never visited and already nudged
    if (channel.last_notified_at !== null && channel.last_seen_at === null) {
      return;
    }

    // Resolve client phone via the existing ticket-based phone resolution.
    // Find any ticket for this client to resolve the phone.
    const ticket = await db
      .selectFrom("tickets")
      .select("id")
      .where("client_id", "=", channel.client_id)
      .orderBy("created_at", "desc")
      .executeTakeFirst();

    if (!ticket) return;

    phoneBuf = await resolveClientPhone(ticket.id, db, deps.fieldEncryptor);

    if (!phoneBuf) return;

    const provider = await deps.getProvider(deps.orgId);
    if (!provider) return;

    const callerId = await deps.resolveCallerIdByPurpose(
      { orgId: deps.orgId, orgSchema: deps.orgSchema },
      "system",
    );
    // No empty-string guard: E164 is regex-validated at its parse boundary,
    // so the only non-null value that reaches here is a dialable number.
    if (callerId === null) return;

    // Static localized body (no content, no link, no key material).
    // Localized to the org default language: the server knows no
    // per-client language, and the sentence is deliberately generic.
    const orgLang = await db
      .selectFrom("org_config")
      .select("default_language")
      .executeTakeFirst();
    const locale: Locale = orgLang?.default_language === "es" ? "es" : "en";
    const body = portal_nudge_sms_body({}, { locale });

    const phoneStr = phoneBuf.toString("utf-8");
    try {
      await provider.sendSms(phoneStr, body, callerId);
    } catch {
      // Provider failure: log and swallow
      console.error(
        "Portal nudge SMS failed:",
        JSON.stringify({
          orgSlug: deps.orgSlug,
          reason: "provider_send_failed",
        }),
      );
      return;
    }

    // Stamp last_notified_at
    await db
      .updateTable("portal_channels")
      .set({ last_notified_at: new Date() })
      .where("id", "=", channel.id)
      .execute();
  } catch (err: unknown) {
    console.error(
      "Portal nudge failed:",
      JSON.stringify({
        orgSlug: deps.orgSlug,
        reason: err instanceof Error ? err.message : String(err),
      }),
    );
  } finally {
    phoneBuf?.fill(0);
  }
}
