/**
 * Ticket priority labels, in display order.
 *
 * Single source for every surface that names a priority to the user:
 * the picker sheet, the create form, the edit sheet, and the timeline's
 * system event line.
 *
 * Labels are thunks rather than strings, matching the label registries
 * in `$lib/shell/tabs.ts` and `$lib/admin/destinations.ts`. A message
 * evaluated at module scope keeps whichever locale was active when the
 * module first loaded, so a runtime locale switch would leave these
 * labels behind; a thunk re-reads the locale on every render.
 *
 * PriorityStamp is deliberately not a consumer. Its stamp carries a
 * separate, shorter uppercase wording (the `priority_stamp_*` messages)
 * and renders nothing at all for "normal", because priority is the one
 * hue channel in a list. Merging the two sets would put stamp wording
 * into the pickers and a fourth stamp into every list row.
 */

import * as m from "$lib/paraglide/messages.js";
import type { TicketPriority } from "@care-y/shared";

export interface PriorityOption {
  readonly value: TicketPriority;
  readonly label: () => string;
}

/** Display order matches `ticketPrioritySchema.options` (asserted in tests). */
export const PRIORITY_OPTIONS: readonly PriorityOption[] = [
  { value: "low", label: m.ticket_new_priority_low },
  { value: "normal", label: m.ticket_new_priority_normal },
  { value: "high", label: m.ticket_new_priority_high },
  { value: "urgent", label: m.ticket_new_priority_urgent },
];

// Map lookup rather than object indexing, per the lint security rules.
const LABEL_BY_VALUE = new Map<string, () => string>(
  PRIORITY_OPTIONS.map((option) => [option.value, option.label]),
);

/**
 * Label for a priority that arrives as a plain string (event params,
 * server payloads). Unknown values fall back to the raw value so a
 * priority added server-side still reads as something.
 */
export function priorityLabel(value: string): string {
  return LABEL_BY_VALUE.get(value)?.() ?? value;
}
