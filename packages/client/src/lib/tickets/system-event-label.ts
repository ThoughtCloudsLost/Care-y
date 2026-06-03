import * as m from "$lib/paraglide/messages.js";

const labelMap: Record<string, () => string> = {
  assignment_change: m.ticket_system_assignment_change,
  status_change: m.ticket_system_status_change,
  hold_change: m.ticket_system_hold_change,
  priority_change: m.ticket_system_priority_change,
  merge_note: m.ticket_system_merge_note,
};

export function systemEventLabel(type: string): string {
  // eslint-disable-next-line security/detect-object-injection -- constant map with string keys, no user input reaches the key set
  const resolver = labelMap[type];
  return resolver !== undefined ? resolver() : m.ticket_system_event();
}
