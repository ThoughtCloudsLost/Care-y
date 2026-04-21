/**
 * Inbound SMS handler. Receives parsed SMS data from the Twilio webhook,
 * encrypts the message body and caller phone number with sealed box
 * (server-blind), finds or creates the client via blind index lookup,
 * sends an auto-reply, and triggers Twilio log deletion (GAP-16 M2).
 *
 * All plaintext is zeroed immediately after encryption (via crypto-helpers).
 * No PII is logged at any point.
 */

import type { TelephonyProvider, IncomingSmsData } from "./provider.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { BlindIndexer } from "../crypto/field-encryptor.js";
import type { BlobStore } from "../storage/store.js";
import type { JobQueue } from "../jobs/queue.js";
import type { ClientRepository } from "./models/client-repo.js";
import type { SmsResponseRepository } from "./models/sms-response-repo.js";
import type { BlocklistRepository } from "./models/blocklist-repo.js";
import { selectAutoReply } from "./sms-auto-reply.js";
import { enqueueLogDeletion } from "../jobs/log-deletion.js";
import { TelephonyError } from "../errors.js";
import { sealString } from "./crypto-helpers.js";

export interface InboundSmsResult {
  readonly clientId: string;
  readonly phoneId: string;
  readonly isNewClient: boolean;
  readonly bodyBlobKey: string;
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
  readonly orgId: string;
  readonly orgSchema: string;
  readonly defaultLocale: string;
}

/**
 * Process an inbound SMS: encrypt, store, find/create client, auto-reply,
 * and schedule provider log deletion.
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
    orgId,
    orgSchema,
    defaultLocale,
  } = deps;

  // 1. Compute blind index and check blocklist BEFORE any storage
  const phoneHash = indexer.hash(smsData.from, orgId);
  const isBlocked = await blocklistRepo.exists(phoneHash);
  if (isBlocked) return null;

  // 2. Encrypt SMS body (sealed box, server-blind)
  const encryptedBody = sealString(sealedBox, smsData.body);

  // 3. Store encrypted body blob
  const bodyBlobKey = await blobStore.put(
    orgSchema,
    "attachment",
    encryptedBody,
  );

  // 4. Encrypt caller phone
  const encryptedPhone = sealString(sealedBox, smsData.from);

  // 5. Find or create client by phone hash
  const { client, phone, isNew } = await clientRepo.findOrCreateByPhoneHash(
    phoneHash,
    encryptedPhone,
  );

  // 6. Send auto-reply
  const autoReply = await selectAutoReply(
    smsResponseRepo,
    phone.locale,
    "new_client",
    defaultLocale,
  );
  await provider.sendSms(smsData.from, autoReply.text, smsData.to);

  // 7. Delete provider message log (GAP-16 M2)
  try {
    await provider.deleteMessageLog(smsData.messageId);
  } catch (deleteErr: unknown) {
    // Immediate deletion failed. Enqueue a retry job.
    // The job payload contains only IDs, never PII.
    try {
      await enqueueLogDeletion(jobQueue, {
        orgId,
        resourceType: "message",
        resourceId: smsData.messageId,
      });
    } catch {
      // Log deletion is best-effort. If both the immediate attempt and
      // the retry enqueue fail, surface the original error but do not
      // block the inbound SMS flow. The message is already encrypted
      // and stored; failing here would lose the client interaction.
      throw new TelephonyError(
        `Failed to delete or enqueue deletion for message log: ${
          deleteErr instanceof Error ? deleteErr.message : String(deleteErr)
        }`,
      );
    }
  }

  // 8. Return result
  return {
    clientId: client.id,
    phoneId: phone.id,
    isNewClient: isNew,
    bodyBlobKey,
  };
}
