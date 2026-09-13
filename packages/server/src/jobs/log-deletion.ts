import type { JobQueue } from "./queue.js";
import type { ProviderFactory } from "../telephony/factory.js";
import { ValidationError } from "../errors.js";
import type { OrgId } from "@care-y/shared";
import { orgIdSchema } from "@care-y/shared";
import { z } from "zod";

export interface LogDeletionPayload {
  readonly orgId: OrgId;
  readonly resourceType: "call" | "message" | "recording";
  readonly resourceId: string;
}

const QUEUE_NAME = "log-deletion";

const logDeletionPayloadSchema = z.object({
  orgId: orgIdSchema,
  resourceType: z.enum(["call", "message", "recording"]),
  resourceId: z.string().min(1),
});

function validatePayload(raw: Record<string, unknown>): LogDeletionPayload {
  const result = logDeletionPayloadSchema.safeParse(raw);
  if (!result.success) {
    throw new ValidationError(
      `Log deletion payload validation failed: ${result.error.message}`,
    );
  }
  return result.data;
}

/**
 * Registers a handler on the "log-deletion" queue that dispatches
 * to the correct TelephonyProvider delete method based on resource type.
 * The JobQueue handles retries on failure; this handler does not catch errors.
 */
export function registerLogDeletionHandler(
  jobQueue: JobQueue,
  providerFactory: ProviderFactory,
): void {
  jobQueue.process(QUEUE_NAME, async (raw) => {
    const payload = validatePayload(raw);
    const provider = await providerFactory.getProvider(payload.orgId);

    switch (payload.resourceType) {
      case "call":
        await provider.deleteCallLog(payload.resourceId);
        break;
      case "message":
        await provider.deleteMessageLog(payload.resourceId);
        break;
      case "recording":
        await provider.deleteRecording(payload.resourceId);
        break;
    }
  });
}

/**
 * Enqueues a log deletion job with exponential backoff retries.
 * Payloads contain only SIDs and org IDs, never PII.
 * Returns the job ID.
 */
export async function enqueueLogDeletion(
  jobQueue: JobQueue,
  payload: LogDeletionPayload,
): Promise<string> {
  return jobQueue.enqueue(
    QUEUE_NAME,
    {
      orgId: payload.orgId,
      resourceType: payload.resourceType,
      resourceId: payload.resourceId,
    },
    {
      maxRetries: 3,
      backoff: "exponential",
      baseDelayMs: 60_000,
    },
  );
}
