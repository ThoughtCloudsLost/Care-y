import * as m from "$lib/paraglide/messages.js";

const labelMap: Record<string, () => string> = {
  hold_placed: m.ticket_system_hold_placed,
  hold_removed: m.ticket_system_hold_removed,
  volunteer_assigned: () =>
    m.ticket_system_volunteer_assigned({
      name: m.ticket_system_volunteer_fallback(),
    }),
  volunteer_unassigned: () =>
    m.ticket_system_volunteer_unassigned({
      name: m.ticket_system_volunteer_fallback(),
    }),
  status_opened: m.ticket_system_status_opened,
  status_closed: m.ticket_system_status_closed,
  priority_changed: () => m.ticket_system_priority_changed({ priority: "?" }),
  merge_note: m.ticket_system_merge_note,
};

export function systemEventLabel(type: string): string {
  // eslint-disable-next-line security/detect-object-injection -- constant map with string keys, no user input reaches the key set
  const resolver = labelMap[type];
  return resolver !== undefined ? resolver() : m.ticket_system_event();
}
