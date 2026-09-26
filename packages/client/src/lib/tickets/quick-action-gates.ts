/**
 * Which ticket quick actions the signed-in account may use.
 *
 * Cards, swipe zones and the bulk bar render only the actions in this
 * set. Reply is allowed when any written channel is, because the reply
 * sheet offers whichever ones the account holds. Every other action maps
 * to the one procedure or channel it calls.
 */

import type { Permission } from "@care-y/shared";
import type { TicketQuickAction } from "$lib/components/tickets/ticket-types.js";
import { canCall, canUseChannel } from "$lib/auth/procedure-gates.js";

export function allowedQuickActions(
  permissions: ReadonlySet<Permission>,
): ReadonlySet<TicketQuickAction> {
  const allowed = new Set<TicketQuickAction>();

  if (
    canUseChannel(permissions, "portal") ||
    canUseChannel(permissions, "sms") ||
    canUseChannel(permissions, "email")
  ) {
    allowed.add("reply");
  }
  if (canUseChannel(permissions, "call")) allowed.add("call");
  if (canCall(permissions, "tickets.assignTo")) allowed.add("assign");
  if (canCall(permissions, "tickets.update")) {
    allowed.add("hold");
    allowed.add("unhold");
  }
  if (canCall(permissions, "tickets.take")) allowed.add("take");

  return allowed;
}
