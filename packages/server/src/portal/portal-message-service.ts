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
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import type { NotificationService } from "../notifications/service.js";
import type {
  NotificationRecipient,
  NotificationRecipientList,
} from "../tickets/notification-recipients.js";
import { reopenClosedTicket } from "../tickets/ticket-reopen.js";
import { portal_nudge_sms_body } from "@care-y/shared/paraglide/messages.js";
import type { Locale } from "@care-y/shared/paraglide/runtime.js";
import { resolveClientPhone } from "../routes/relay.js";
import { NotFoundError } from "../errors.js";
import { ErrorCode } from "@care-y/shared";
import { encode } from "@care-y/crypto";
import type {
  TicketId,
  FollowupId,
  KeyGeneration,
  ChannelRowId,
  OrgId,
  OrgSchema,
  OrgSlug,
  QueueId,
  UserId,
} from "@care-y/shared";

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
}

export interface PortalMessageWire {
  readonly id: string;
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
  readonly messagesExpireDays: number;
  /** Org-configured quick-exit target; null falls back to the client default. */
  readonly safeExitUrl: string | null;
  /** True when a Secure Link channel has the account offer enabled. */
  readonly accountOffer: boolean;
}

export interface PortalMessageServiceDeps {
  readonly getProvider: (orgId: OrgId) => Promise<TelephonyProvider | null>;
  readonly resolveCallerIdByPurpose: (
    org: { readonly orgId: OrgId; readonly orgSchema: OrgSchema },
    purpose: "outbound" | "system",
  ) => Promise<string | null>;
  readonly fieldEncryptor: FieldEncryptor;
  readonly notificationService: NotificationService;
  readonly orgId: OrgId;
  readonly orgSchema: OrgSchema;
  readonly orgSlug: OrgSlug;
}

// ---------------------------------------------------------------------------
// bootstrap
// ---------------------------------------------------------------------------

/**
 * Stamps last_seen_at, lazily deletes expired client copies, resolves
 * the client's current ticket (open, else most recent; never creates),
 * and returns the channel's portal_messages ordered by created_at.
 */
export async function bootstrap(
  db: Kysely<TenantDatabase>,
  channel: PortalChannelRow,
): Promise<PortalBootstrapResult> {
  // Stamp last_seen_at (justified server timestamp: autonomous nudge dedup)
  await db
    .updateTable("portal_channels")
    .set({ last_seen_at: new Date() })
    .where("id", "=", channel.id)
    .execute();

  // Lazy expiry: delete copies whose channel has been inactive past the boundary
  const lastActivity = channel.last_seen_at ?? channel.created_at;
  const boundaryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  if (Date.now() - lastActivity.getTime() > boundaryMs) {
    await db
      .deleteFrom("portal_messages")
      .where("channel_id", "=", channel.id)
      .execute();
  }

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

  const messages: PortalMessageWire[] = rows.map((r) => ({
    id: r.id,
    direction: r.direction,
    ephemeralPoint: encode(new Uint8Array(r.ephemeral_point)),
    nonce: encode(new Uint8Array(r.nonce)),
    ciphertext: encode(new Uint8Array(r.ciphertext)),
    createdAt: r.created_at.toISOString(),
    editedAt: r.edited_at ? r.edited_at.toISOString() : null,
  }));

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
    messagesExpireDays: EXPIRY_DAYS,
    safeExitUrl: orgConfig?.portal_safe_exit_url ?? null,
    accountOffer: channel.kind === "secure_link" && channel.account_offer,
  };
}

// ---------------------------------------------------------------------------
// clientReply
// ---------------------------------------------------------------------------

/**
 * Client reply: validates ticket ownership, reopens closed tickets,
 * inserts follow-up + portal_reply_key_wraps + from_client self copy
 * in one transaction. After commit, dispatches the volunteer
 * ticket_updated notification (best-effort, fire-and-forget).
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

  await db.transaction().execute(async (trx) => {
    // Reopen closed ticket via the shared helper
    if (ticket.status === "closed") {
      await reopenClosedTicket(trx, ticket.id);
    }

    // Insert follow-up (source: client, type: message)
    await trx
      .insertInto("followups")
      .values({
        id: input.followUpId,
        ticket_id: input.ticketId,
        source: "client",
        type: "message",
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
  });

  // Post-commit: best-effort volunteer notification (fire-and-forget)
  dispatchClientReplyNotification(db, deps, queueId, input.ticketId);
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
    if (callerId == null || callerId === "") return;

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

// ---------------------------------------------------------------------------
// Notification helper (fire-and-forget, best-effort)
// ---------------------------------------------------------------------------

/**
 * Dispatches followup_added to queue volunteers after a client reply.
 * Best-effort: logs on failure, never throws. No actor to exclude
 * (client has no user id).
 */
function dispatchClientReplyNotification(
  db: Kysely<TenantDatabase>,
  deps: PortalMessageServiceDeps,
  queueId: QueueId,
  ticketId: TicketId,
): void {
  void (async () => {
    try {
      const watchers = await db
        .selectFrom("queue_watchers")
        .select("user_id")
        .where("queue_id", "=", queueId)
        .execute();

      // Also include ticket watchers and the assigned volunteer
      const ticketRow = await db
        .selectFrom("tickets")
        .select(["assigned_to"])
        .where("id", "=", ticketId)
        .executeTakeFirst();

      const ticketWatchers = await db
        .selectFrom("ticket_watchers")
        .select("user_id")
        .where("ticket_id", "=", ticketId)
        .execute();

      const seen = new Set<UserId>();
      const recipients: NotificationRecipient[] = [];

      // Assigned owner first
      if (ticketRow?.assigned_to != null && ticketRow.assigned_to !== "") {
        seen.add(ticketRow.assigned_to);
        recipients.push({
          userId: ticketRow.assigned_to,
          source: "owner",
        });
      }

      // Ticket watchers
      for (const tw of ticketWatchers) {
        if (!seen.has(tw.user_id)) {
          seen.add(tw.user_id);
          recipients.push({ userId: tw.user_id, source: "cc" });
        }
      }

      // Queue watchers
      for (const qw of watchers) {
        if (!seen.has(qw.user_id)) {
          seen.add(qw.user_id);
          recipients.push({ userId: qw.user_id, source: "queue_watcher" });
        }
      }

      const recipientList: NotificationRecipientList = { recipients };

      await deps.notificationService.dispatch(
        db,
        deps.orgId,
        deps.orgSchema,
        deps.orgSlug,
        "followup_added",
        ticketId,
        queueId,
        recipientList,
      );
    } catch (err: unknown) {
      console.error(
        "Portal reply notification dispatch failed:",
        err instanceof Error ? err.message : String(err),
      );
    }
  })();
}
