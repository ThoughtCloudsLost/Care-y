/**
 * Inbound SMS handler. Receives parsed SMS data from the Twilio webhook,
 * finds or creates the client via blind index lookup, resolves or creates
 * a ticket with per-ticket ECIES encryption, creates an encrypted follow-up,
 * sends an auto-reply, and triggers Twilio log deletion (GAP-16 M2).
 *
 * All plaintext is zeroed immediately after encryption. No PII is logged.
 */

import type { Kysely } from "kysely";
import type { TelephonyProvider, IncomingSmsData } from "./provider.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { BlindIndexer } from "../crypto/field-encryptor.js";
import type { BlobStore } from "../storage/store.js";
import type { JobQueue } from "../jobs/queue.js";
import type { ClientRepository } from "./models/client-repo.js";
import type { SmsResponseRepository } from "./models/sms-response-repo.js";
import type { BlocklistRepository } from "./models/blocklist-repo.js";
import type { TenantDatabase } from "../db/types.js";
import { requireSodium, eciesEncrypt, toRistrettoPoint } from "@care-y/crypto";
import type { ChannelRowId } from "@care-y/shared";
import type {
  OrgId,
  OrgSchema,
  QueueId,
  ClientId,
  PhoneId,
  TicketId,
  FollowupId,
} from "@care-y/shared";
import { selectAutoReply } from "./sms-auto-reply.js";
import { enqueueLogDeletion } from "../jobs/log-deletion.js";
import { TelephonyError } from "../errors.js";
import { sealString } from "./crypto-helpers.js";
import { resolveOrCreateTicket } from "../tickets/server-ticket-create.js";
import {
  createEncryptedFollowUp,
  createFollowUpWithTk,
} from "../tickets/server-followup-create.js";
import { processAttachments } from "./inbound-mms.js";
import { findActiveChannel } from "../portal/channel-service.js";
import { storeClientCopy } from "../portal/portal-message-service.js";
import type { EciesTripleBuffers } from "../portal/portal-message-service.js";

export interface InboundSmsResult {
  readonly clientId: ClientId;
  readonly phoneId: PhoneId;
  readonly isNewClient: boolean;
  readonly ticketId: TicketId;
  readonly followUpId: FollowupId;
}

export interface InboundSmsDeps {
  readonly provider: TelephonyProvider;
  readonly sealedBox: SealedBoxEncryptor;
  readonly indexer: BlindIndexer;
  readonly blobStore: BlobStore;
  readonly jobQueue: JobQueue;
  readonly clientRepo: ClientRepository;
  readonly smsResponseRepo: SmsResponseRepository;
  readonly blocklistRepo: BlocklistRepository;
  readonly tDb: Kysely<TenantDatabase>;
  readonly intakeQueueId: QueueId;
  readonly orgId: OrgId;
  readonly orgSchema: OrgSchema;
  readonly defaultLocale: string;
}

/**
 * Process an inbound SMS: find/create client, resolve/create ticket with
 * per-ticket ECIES, encrypt SMS body as a follow-up, process MMS attachments,
 * auto-reply, and schedule provider log deletion.
 */
export async function handleInboundSms(
  smsData: IncomingSmsData,
  deps: InboundSmsDeps,
): Promise<InboundSmsResult | null> {
  const {
    provider,
    sealedBox,
    indexer,
    blobStore,
    jobQueue,
    clientRepo,
    smsResponseRepo,
    blocklistRepo,
    tDb,
    intakeQueueId,
    orgId,
    orgSchema,
    defaultLocale,
  } = deps;

  // 1. Compute blind index and check blocklist BEFORE any storage
  const phoneHash = indexer.hashPhone(smsData.from, orgId);
  const isBlocked = await blocklistRepo.exists(phoneHash);
  if (isBlocked) return null;

  // 2. Encrypt caller phone (sealed-box for ops-tier phone storage)
  const encryptedPhone = sealString(sealedBox, smsData.from);

  // 3. Find or create client by phone hash
  const { client, phone, isNew } = await clientRepo.findOrCreateByPhoneHash(
    phoneHash,
    encryptedPhone,
  );

  // 4. Resolve or create ticket
  const titleBuf = Buffer.from("Inbound SMS", "utf-8");
  const descBuf = Buffer.from("Inbound SMS", "utf-8");

  const ticketResult = await resolveOrCreateTicket(
    tDb,
    client.id,
    intakeQueueId,
    titleBuf,
    descBuf,
  );

  // 5. Resolve the client's active portal channel (best-effort).
  // Failure here must not block the forward path (ADR-090).
  let portalChannelId: ChannelRowId | null = null;
  let portalCopy: EciesTripleBuffers | null = null;

  // 6. Create encrypted follow-up with SMS body
  const bodyBuf = Buffer.from(smsData.body, "utf-8");

  // Process MMS attachments (inside this scope so tk/tk_temp is alive)
  let mmsAttachments: { data: Buffer; contentType: string }[] | undefined;
  if (smsData.numMedia > 0) {
    const mmsResult = await processAttachments(
      smsData.mediaUrls,
      smsData.mediaContentTypes,
    );
    if (mmsResult.accepted.length > 0) {
      mmsAttachments = mmsResult.accepted;
    }
  }

  try {
    const activeChannel = await findActiveChannel(tDb, client.id);
    if (activeChannel) {
      portalChannelId = activeChannel.id;
      // Seal bodyBuf to the channel's client_public BEFORE the follow-up
      // creation calls below, which zero bodyBuf in their finally blocks.
      // bodyBuf is passed uncopied: a copy could not be zeroed by the
      // follow-up helpers and would outlive the handler (ADR-090).
      const clientPoint = toRistrettoPoint(
        new Uint8Array(activeChannel.client_public),
      );
      const sealed = eciesEncrypt(bodyBuf, clientPoint);
      portalCopy = {
        ephemeralPoint: Buffer.from(sealed.ephemeralPoint),
        nonce: Buffer.from(sealed.nonce),
        ciphertext: Buffer.from(sealed.ciphertext),
      };
    }
  } catch {
    // Channel lookup or seal failure: log without content, continue
    // to the follow-up creation unchanged (ADR-090 fault isolation).
    console.warn("Portal copy dropped: channel lookup failed for client");
  }

  let followUpId: FollowupId;

  if (ticketResult.isNew && ticketResult.tk) {
    // New ticket: reuse the ticket's tk (wraps already created)
    const sodium = requireSodium();
    try {
      followUpId = await createFollowUpWithTk(
        tDb,
        ticketResult.ticketId,
        ticketResult.tk,
        bodyBuf,
        "sms_inbound",
        "client",
        mmsAttachments
          ? { attachments: mmsAttachments, blobStore, orgSchema }
          : undefined,
      );
    } finally {
      sodium.memzero(ticketResult.tk);
    }
  } else {
    // Existing ticket: generate tk_temp with its own ECIES wraps
    const result = await createEncryptedFollowUp(
      tDb,
      ticketResult.ticketId,
      bodyBuf,
      "sms_inbound",
      "client",
      mmsAttachments
        ? { attachments: mmsAttachments, blobStore, orgSchema }
        : undefined,
    );
    followUpId = result.followUpId;
  }

  // 7. Store portal copy (best-effort, after follow-up id is known).
  // Failure here must not block the auto-reply or log deletion (ADR-090).
  if (portalChannelId !== null && portalCopy !== null) {
    try {
      await storeClientCopy(
        tDb,
        portalChannelId,
        followUpId,
        portalCopy,
        "from_client",
      );
    } catch {
      console.warn("Portal copy dropped: copy write failed for client");
    }
  }

  // 8. Send auto-reply
  const autoReply = await selectAutoReply(
    smsResponseRepo,
    phone.locale,
    "new_client",
    defaultLocale,
  );
  await provider.sendSms(smsData.from, autoReply.text, smsData.to);

  // 9. Delete provider message log (GAP-16 M2)
  try {
    await provider.deleteMessageLog(smsData.messageId);
  } catch (deleteErr: unknown) {
    try {
      await enqueueLogDeletion(jobQueue, {
        orgId,
        resourceType: "message",
        resourceId: smsData.messageId,
      });
    } catch {
      throw new TelephonyError(
        `Failed to delete or enqueue deletion for message log: ${
          deleteErr instanceof Error ? deleteErr.message : String(deleteErr)
        }`,
      );
    }
  }

  // 10. Return result
  return {
    clientId: client.id,
    phoneId: phone.id,
    isNewClient: isNew,
    ticketId: ticketResult.ticketId,
    followUpId,
  };
}
