/**
 * Derived display status for ticket cards and filter chips.
 *
 * The server stores two fields: status ("open" | "closed") and onHold (boolean).
 * Volunteers think in four states: New, Active, On Hold, Closed.
 * "New" vs "Active" is derived from hasResponse, which the server sets once
 * a volunteer has replied or reached out, or a call was answered:
 *   - New = open, nobody has responded yet
 *   - Active = open, someone has responded
 * The inbound message that opened a ticket, system events and internal
 * notes do not count as a response, so followUpCount cannot stand in here.
 *
 * This derivation uses only plaintext metadata (no decryption needed).
 */

import type { TicketStatus } from "@care-y/shared";

export type DisplayStatus = "new" | "active" | "hold" | "closed";

export function deriveDisplayStatus(
  status: TicketStatus,
  onHold: boolean,
  hasResponse: boolean,
): DisplayStatus {
  if (onHold) return "hold";
  if (status === "closed") return "closed";
  return hasResponse ? "active" : "new";
}
