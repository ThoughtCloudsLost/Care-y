import * as m from "$lib/paraglide/messages.js";

/** The fields a call label is derived from, shared by the timeline
 *  rows and the conversation call entries. */
export interface CallLabelInput {
  readonly source: string;
  readonly callStatus: string | null;
  readonly callDurationSeconds: number | null;
}

function formatCallDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, "0");
  return `${String(mins)}:${secs}`;
}

/** Human label for a phone_call follow-up: direction plus duration for
 *  completed calls, the outcome for everything else. */
export function formatCallLabel(item: CallLabelInput): string {
  const status = item.callStatus;
  if (status === null) {
    return m.followup_type_phone_call();
  }

  if (status === "completed") {
    const dur = item.callDurationSeconds;
    const duration = dur !== null ? formatCallDuration(dur) : "0:00";
    return item.source === "client"
      ? m.call_status_completed_inbound({ duration })
      : m.call_status_completed_outbound({ duration });
  }

  if (status === "no_answer") return m.call_status_no_answer();
  if (status === "busy") return m.call_status_busy();
  if (status === "failed") return m.call_status_failed();
  if (status === "canceled") return m.call_status_canceled();
  return m.followup_type_phone_call();
}
