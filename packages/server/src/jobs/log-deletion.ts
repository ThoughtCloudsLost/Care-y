import type { JobQueue } from "./queue.js";
import type { ProviderFactory } from "../telephony/factory.js";
import { ValidationError } from "../errors.js";

export interface LogDeletionPayload {
  readonly orgId: string;
  readonly resourceType: "call" | "message" | "recording";
  readonly resourceId: string;
}

const QUEUE_NAME = "log-deletion";
function isValidResourceType(
  value: string,
): value is LogDeletionPayload["resourceType"] {
  return value === "call" || value === "message" || value === "recording";
}

function validatePayload(raw: Record<string, unknown>): LogDeletionPayload {
  const { orgId, resourceType, resourceId } = raw;

  if (typeof orgId !== "string" || orgId.length === 0) {
    throw new ValidationError("Log deletion payload missing valid orgId");
  }
  if (typeof resourceType !== "string" || !isValidResourceType(resourceType)) {
    throw new ValidationError(
      `Log deletion payload has invalid resourceType: ${String(resourceType)}`,
    );
  }
  if (typeof resourceId !== "string" || resourceId.length === 0) {
    throw new ValidationError("Log deletion payload missing valid resourceId");
  }

  return { orgId, resourceType, resourceId };
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
