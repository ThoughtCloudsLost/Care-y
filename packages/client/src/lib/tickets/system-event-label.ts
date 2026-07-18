import * as m from "$lib/paraglide/messages.js";

function priorityLabel(value: string): string {
  switch (value) {
    case "low":
      return m.ticket_new_priority_low();
    case "normal":
      return m.ticket_new_priority_normal();
    case "high":
      return m.ticket_new_priority_high();
    case "urgent":
      return m.ticket_new_priority_urgent();
    default:
      return value;
  }
}

type LabelResolver = (
  eventParams?: Record<string, unknown> | null,
  resolveUserName?: (userId: string) => string,
) => string;

const labelMap: Record<string, LabelResolver> = {
  hold_placed: () => m.ticket_system_hold_placed(),
  hold_removed: () => m.ticket_system_hold_removed(),
  status_opened: () => m.ticket_system_status_opened(),
  status_closed: () => m.ticket_system_status_closed(),
  priority_changed: (p) => {
    const to = typeof p?.to === "string" ? p.to : null;
    return m.ticket_system_priority_changed({
      priority: to !== null ? priorityLabel(to) : "?",
    });
  },
  volunteer_assigned: (p, resolve) => {
    const userId = typeof p?.userId === "string" ? p.userId : null;
    const name =
      userId !== null && resolve !== undefined
        ? resolve(userId)
        : m.ticket_system_volunteer_fallback();
    return m.ticket_system_volunteer_assigned({ name });
  },
  volunteer_unassigned: (p, resolve) => {
    const userId = typeof p?.userId === "string" ? p.userId : null;
    const name =
      userId !== null && resolve !== undefined
        ? resolve(userId)
        : m.ticket_system_volunteer_fallback();
    return m.ticket_system_volunteer_unassigned({ name });
  },
  merge_note: () => m.ticket_system_merge_note(),
};

export function systemEventLabel(
  type: string,
  eventParams?: Record<string, unknown> | null,
  resolveUserName?: (userId: string) => string,
): string {
  // eslint-disable-next-line security/detect-object-injection -- constant map with string keys, no user input reaches the key set
  const resolver = labelMap[type];
  return resolver !== undefined
    ? resolver(eventParams, resolveUserName)
    : m.ticket_system_event();
}
