import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { CallTracker } from "./call-tracker.js";
import { resolveOrCreateTicket } from "../tickets/server-ticket-create.js";
import { requireSodium } from "@care-y/crypto";

export interface CallStatusDeps {
  readonly callTracker: CallTracker;
  readonly getTenantDb: (orgSchema: string) => Kysely<TenantDatabase>;
  readonly intakeQueueId: string | null;
}

const TERMINAL_STATUSES = new Set([
  "completed",
  "no-answer",
  "busy",
  "failed",
  "canceled",
]);

function normalizeTwilioStatus(raw: string): string {
  return raw.replace(/-/g, "_");
}

export async function handleCallStatus(
  orgSchema: string,
  body: Record<string, string>,
  deps: CallStatusDeps,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/dot-notation -- Twilio keys are PascalCase strings, not identifiers
  const callSid = body["CallSid"];
  // eslint-disable-next-line @typescript-eslint/dot-notation
  const rawStatus = body["CallStatus"];

  if (callSid === undefined || callSid === "") return;
  if (rawStatus === undefined || rawStatus === "") return;
  if (!TERMINAL_STATUSES.has(rawStatus)) return;

  const tracked = deps.callTracker.get(callSid);
  if (!tracked) return;

  // Do NOT remove the tracker entry here. The recording callback is a
  // separate Twilio webhook that arrives after the status callback. If
  // we remove the entry, the recording handler loses ticket context.
  // The CallTracker's 1-hour TTL handles cleanup.

  const status = normalizeTwilioStatus(rawStatus);
  // eslint-disable-next-line @typescript-eslint/dot-notation
  const durationStr = body["Duration"];
  const duration = durationStr !== undefined ? parseInt(durationStr, 10) : null;

  const tDb = deps.getTenantDb(
    tracked.orgSchema.length > 0 ? tracked.orgSchema : orgSchema,
  );

  let ticketId = tracked.ticketId;
  const source = tracked.direction === "outbound" ? "volunteer" : "client";

  if (
    ticketId === "" &&
    tracked.direction === "inbound" &&
    tracked.clientId !== null
  ) {
    if (deps.intakeQueueId === null) return;

    const titleBuf = Buffer.from(`Call from ${tracked.clientId}`, "utf-8");
    const descBuf = Buffer.from("Inbound call", "utf-8");

    const result = await resolveOrCreateTicket(
      tDb,
      tracked.clientId,
      deps.intakeQueueId,
      titleBuf,
      descBuf,
    );

    // phone_call follow-ups contain no PII content (metadata in columns
    // only, encrypted_content = "system"). Zero tk immediately.
    if (result.tk) {
      const sodium = requireSodium();
      sodium.memzero(result.tk);
    }

    ticketId = result.ticketId;
  }

  if (ticketId === "") return;

  await tDb
    .insertInto("followups")
    .values({
      ticket_id: ticketId,
      source,
      type: "phone_call",
      encrypted_content: Buffer.from("system"),
      created_by: tracked.userId,
      call_sid: callSid,
      call_status: status,
      call_duration_seconds:
        duration !== null && !Number.isNaN(duration) ? duration : null,
    })
    .execute();
}
