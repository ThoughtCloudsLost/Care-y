/**
 * Shared helper for provider log deletion with job queue fallback.
 *
 * Multiple handlers (recording-handler, inbound-sms) need to delete
 * provider-side logs and fall back to enqueuing a retry job on failure.
 * This centralizes that pattern.
 */

import type { TelephonyProvider } from "./provider.js";
import type { JobQueue } from "../jobs/queue.js";
import type { LogDeletionPayload } from "../jobs/log-deletion.js";
import type { OrgId } from "@care-y/shared";

type ResourceType = LogDeletionPayload["resourceType"];

/**
 * Attempt to delete a provider log record. On failure, enqueue a
 * retry job instead. Deletion is best-effort: if both the immediate
 * delete and the enqueue fail, the error is silently swallowed.
 * The caller's primary flow (storing encrypted data) is never blocked.
 */
export async function deleteOrEnqueue(
  provider: TelephonyProvider,
  jobQueue: JobQueue,
  orgId: OrgId,
  resourceType: ResourceType,
  resourceId: string,
): Promise<void> {
  try {
    switch (resourceType) {
      case "call":
        await provider.deleteCallLog(resourceId);
        break;
      case "message":
        await provider.deleteMessageLog(resourceId);
        break;
      case "recording":
        await provider.deleteRecording(resourceId);
        break;
    }
  } catch {
    await jobQueue.enqueue("log-deletion", {
      orgId,
      resourceType,
      resourceId,
    });
  }
}
