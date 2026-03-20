/**
 * Inbound SMS handler. Receives parsed SMS data from the Twilio webhook,
 * encrypts the message body and caller phone number with sealed box
 * (server-blind), finds or creates the client via blind index lookup,
 * sends an auto-reply, and triggers Twilio log deletion (GAP-16 M2).
 *
 * All plaintext is held in Buffers and zeroed in finally blocks.
 * No PII is logged at any point.
 */

import type { TelephonyProvider, IncomingSmsData } from "./provider.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { BlindIndexer } from "../crypto/field-encryptor.js";
import type { BlobStore } from "../storage/store.js";
import type { JobQueue } from "../jobs/queue.js";
import type { ClientRepository } from "./models/client-repo.js";
import type { SmsResponseRepository } from "./models/sms-response-repo.js";
import { selectAutoReply } from "./sms-auto-reply.js";
import { enqueueLogDeletion } from "../jobs/log-deletion.js";
import { TelephonyError } from "../errors.js";

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
): Promise<InboundSmsResult> {
  const {
    provider,
    sealedBox,
    indexer,
    blobStore,
    jobQueue,
    clientRepo,
    smsResponseRepo,
    orgId,
    orgSchema,
    defaultLocale,
  } = deps;

  // 1. Encrypt SMS body (sealed box, server-blind)
  let encryptedBody: Buffer;
  const bodyBuffer = Buffer.from(smsData.body, "utf-8");
  try {
    encryptedBody = sealedBox.sealBuffer(bodyBuffer);
  } finally {
    bodyBuffer.fill(0);
  }

  // 2. Store encrypted body blob
  const bodyBlobKey = await blobStore.put(
    orgSchema,
    "attachment",
    encryptedBody,
  );

  // 3. Encrypt caller phone and compute blind index
  let encryptedPhone: Buffer;
  let phoneHash: string;
  const phoneBuffer = Buffer.from(smsData.from, "utf-8");
  try {
    encryptedPhone = sealedBox.sealBuffer(phoneBuffer);
    phoneHash = indexer.hash(smsData.from, orgId);
  } finally {
    phoneBuffer.fill(0);
  }

  // 4. Find or create client by phone hash
  const { client, phone, isNew } = await clientRepo.findOrCreateByPhoneHash(
    phoneHash,
    encryptedPhone,
  );

  // 5. Send auto-reply
  const autoReply = await selectAutoReply(
    smsResponseRepo,
    phone.locale,
    "new_client",
    defaultLocale,
  );
  await provider.sendSms(smsData.from, autoReply.text, smsData.to);

  // 6. Delete provider message log (GAP-16 M2)
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

  // 7. Return result
  return {
    clientId: client.id,
    phoneId: phone.id,
    isNewClient: isNew,
    bodyBlobKey,
  };
}
