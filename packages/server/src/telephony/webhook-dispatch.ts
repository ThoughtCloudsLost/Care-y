/**
 * Webhook dispatch callbacks for inbound telephony events.
 *
 * Extracted from index.ts to keep the composition root free of business logic.
 * Each callback resolves org context, creates tenant-scoped repositories,
 * and delegates to the appropriate handler.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { OrgService } from "../org/service.js";
import type { ProviderFactory } from "./factory.js";
import type { BlindIndexer } from "../crypto/field-encryptor.js";
import type { BlobStore } from "../storage/store.js";
import type { JobQueue } from "../jobs/queue.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { NotificationService } from "../notifications/service.js";
import type { WebhookDispatch } from "../routes/webhooks.js";
import { createSealedBoxEncryptor } from "../crypto/sealed-box.js";
import { createPhoneRepository } from "./models/phone-repo.js";
import { createClientRepository } from "./models/client-repo.js";
import { createSmsResponseRepository } from "./models/sms-response-repo.js";
import { createGreetingRepository } from "./models/greeting-repo.js";
import { createBlocklistRepository } from "./models/blocklist-repo.js";
import { handleInboundSms } from "./inbound-sms.js";
import { handleInboundCall } from "./inbound-call.js";
import { handleRecordingComplete } from "./recording-handler.js";
import type { CallTracker } from "./call-tracker.js";
import { handleCallStatus } from "./call-status-handler.js";

// ---------------------------------------------------------------------------
// Org context resolution
// ---------------------------------------------------------------------------

export interface WebhookOrgContext {
  readonly orgId: string;
  readonly orgSchema: string;
  readonly orgSlug: string;
  readonly tDb: Kysely<TenantDatabase>;
  readonly sealedBox: SealedBoxEncryptor;
  readonly intakeQueueId: string | null;
}

/**
 * Resolves org context for webhook processing: verifies the org is active,
 * opens a tenant DB, builds a SealedBoxEncryptor from the org's public key,
 * and fetches the intake queue ID for server-initiated ticket creation.
 *
 * Returns null if the org does not exist, is inactive, or has no public key.
 */
export async function resolveOrgForWebhook(
  orgId: string,
  orgService: OrgService,
  tenantDb: (schema: string) => Kysely<TenantDatabase>,
): Promise<WebhookOrgContext | null> {
  const org = await orgService.findById(orgId);
  if (org?.isActive !== true) return null;

  const tDb = tenantDb(org.schemaName);
  const row = await tDb
    .selectFrom("org_config")
    .select(["org_public_key", "intake_queue_id"])
    .executeTakeFirst();

  if (!row?.org_public_key) return null;

  const sealedBox = createSealedBoxEncryptor(row.org_public_key);
  return {
    orgId: org.id,
    orgSchema: org.schemaName,
    orgSlug: org.slug,
    tDb,
    sealedBox,
    intakeQueueId: row.intake_queue_id ?? null,
  };
}

// ---------------------------------------------------------------------------
// Dispatch factory
// ---------------------------------------------------------------------------

export interface WebhookDispatchDeps {
  readonly orgService: OrgService;
  readonly tenantDb: (schema: string) => Kysely<TenantDatabase>;
  readonly providerFactory: ProviderFactory;
  readonly indexer: BlindIndexer;
  readonly blobStore: BlobStore;
  readonly jobQueue: JobQueue;
  readonly webhookBaseUrl: string;
  readonly callTracker: CallTracker;
  readonly notificationService: NotificationService;
}

/**
 * Creates the WebhookDispatch callbacks used by the webhook HTTP handler.
 *
 * Each callback resolves org context, creates tenant-scoped repositories,
 * and delegates to the inbound handler functions.
 */
export function createWebhookDispatch(
  deps: WebhookDispatchDeps,
): WebhookDispatch {
  const {
    orgService,
    tenantDb,
    providerFactory,
    indexer,
    blobStore,
    jobQueue,
    webhookBaseUrl,
  } = deps;

  return {
    async onInboundSms(
      orgId: string,
      body: Record<string, string>,
    ): Promise<string | null> {
      const org = await resolveOrgForWebhook(orgId, orgService, tenantDb);
      if (!org) return null;

      if (org.intakeQueueId === null) return null;

      const provider = await providerFactory.getProvider(orgId);
      const phoneRepo = createPhoneRepository(org.tDb);
      const clientRepo = createClientRepository(org.tDb, phoneRepo);
      const smsResponseRepo = createSmsResponseRepository(org.tDb);
      const blocklistRepo = createBlocklistRepository(org.tDb);

      const smsData = provider.parseIncomingSms(body);

      await handleInboundSms(smsData, {
        provider,
        sealedBox: org.sealedBox,
        indexer,
        blobStore,
        jobQueue,
        clientRepo,
        smsResponseRepo,
        blocklistRepo,
        tDb: org.tDb,
        intakeQueueId: org.intakeQueueId,
        orgId,
        orgSchema: org.orgSchema,
        defaultLocale: "en-US",
      });

      return null; // No TwiML response (auto-reply sent via API)
    },

    async onInboundVoice(
      orgId: string,
      body: Record<string, string>,
    ): Promise<string | null> {
      const org = await resolveOrgForWebhook(orgId, orgService, tenantDb);
      if (!org) return null;

      const provider = await providerFactory.getProvider(orgId);

      // Recording-complete callback (RecordingSid present)
      // eslint-disable-next-line @typescript-eslint/dot-notation
      const recordingSid = body["RecordingSid"];
      if (recordingSid !== undefined && recordingSid !== "") {
        await handleRecordingComplete(body, {
          provider,
          blobStore,
          jobQueue,
          callTracker: deps.callTracker,
          getTenantDb: tenantDb,
          intakeQueueId: org.intakeQueueId,
          orgSchema: org.orgSchema,
          orgId,
          sealedBox: org.sealedBox,
          orgSlug: org.orgSlug,
          notificationService: deps.notificationService,
        });
        return null;
      }

      const phoneRepo = createPhoneRepository(org.tDb);
      const clientRepo = createClientRepository(org.tDb, phoneRepo);
      const greetingRepo = createGreetingRepository(org.tDb);
      const blocklistRepo = createBlocklistRepository(org.tDb);

      const callData = provider.parseIncomingCall(body);

      const instructions = await handleInboundCall(callData, body, {
        sealedBox: org.sealedBox,
        indexer,
        phoneRepo,
        clientRepo,
        greetingRepo,
        blocklistRepo,
        orgId,
        orgSchema: org.orgSchema,
        webhookBaseUrl,
        defaultLocale: "en-US",
        callTracker: deps.callTracker,
      });

      return provider.generateVoiceResponse(instructions);
    },

    async onStatusCallback(
      orgId: string,
      body: Record<string, string>,
    ): Promise<void> {
      const org = await resolveOrgForWebhook(orgId, orgService, tenantDb);
      if (!org) return;
      await handleCallStatus(org.orgSchema, body, {
        callTracker: deps.callTracker,
        getTenantDb: tenantDb,
        intakeQueueId: org.intakeQueueId,
      });
    },
  };
}
