/**
 * Derived display status for ticket cards and filter chips.
 *
 * The server stores two fields: status ("open" | "closed") and onHold (boolean).
 * Volunteers think in four states: New, Active, On Hold, Closed.
 * "New" vs "Active" is derived from followUpCount:
 *   - New = open, no follow-ups yet
 *   - Active = open, at least one follow-up
 *
 * This derivation uses only plaintext metadata (no decryption needed).
 */

import type { TicketStatus } from "@care-y/shared";

export type DisplayStatus = "new" | "active" | "hold" | "closed";

export function deriveDisplayStatus(
  status: TicketStatus,
  onHold: boolean,
  followUpCount: number,
): DisplayStatus {
  if (onHold) return "hold";
  if (status === "closed") return "closed";
  return followUpCount === 0 ? "new" : "active";
}
