import type { trpc } from "$lib/trpc/index.js";
import { ticketIdSchema, userIdSchema } from "@care-y/shared";
import type { PendingEntryOpts } from "./create-send-message.svelte.js";

type TicketsRouter = NonNullable<(typeof trpc)["tickets"]>;

/** One row of the ticket detail's follow-up list, as the server returns it. */
export type FollowUpListEntry = Awaited<
  ReturnType<TicketsRouter["listFollowUps"]["query"]>
>["followUps"][number];

/**
 * Builds the optimistic follow-up written into the follow-ups query
 * cache while a volunteer reply is in flight. Shared by the ticket
 * detail orchestrator and the reply sheet so the pending shape cannot
 * drift between the two send surfaces.
 */
export function buildPendingFollowUpEntry(
  opts: PendingEntryOpts,
): FollowUpListEntry {
  return {
    id: opts.pendingId,
    ticketId: ticketIdSchema.parse(opts.ticketId),
    source: "volunteer",
    type: "message",
    isPrivate: false,
    mentionedPseudonyms: opts.mentionedPseudonyms,
    encryptedContent: "",
    createdBy:
      opts.currentUserId == null
        ? null
        : userIdSchema.parse(opts.currentUserId),
    createdAt: new Date().toISOString(),
    hasRecording: false,
    hasImage: false,
    hasFile: false,
    noteTypeId: null,
    callSid: null,
    callStatus: null,
    callDurationSeconds: null,
    keyGeneration: null,
    keyWrap: null,
    portalWrap: null,
    editedAt: null,
    eventParams: null,
  };
}
