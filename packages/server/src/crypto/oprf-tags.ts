/**
 * OPRF tag construction for per-identity key derivation.
 *
 * Tags are public strings naming what an evaluation is for. Each share
 * process derives its working share as scalar_reduce(hkdf(master_share, tag)),
 * so the combined per-tag key is well defined but exists nowhere.
 *
 * Tags are always constructed server-side from validated context, never
 * accepted from the client as free strings.
 *
 * Format:
 *   volunteer:<userId>
 *   account:<accountId>
 *   channel:<orgUuid>:<channelId>
 */

import type {
  UserId,
  ClientAccountId,
  OrgId,
  ChannelSecret,
} from "@care-y/shared";

// ---------------------------------------------------------------------------
// Tag kind union
// ---------------------------------------------------------------------------

export type OprfTagKind = "volunteer" | "account" | "channel";

// ---------------------------------------------------------------------------
// Tag builders
// ---------------------------------------------------------------------------

export function volunteerTag(userId: UserId): string {
  return `volunteer:${userId}`;
}

export function accountTag(accountId: ClientAccountId): string {
  return `account:${accountId}`;
}

export function channelTag(orgUuid: OrgId, channelId: ChannelSecret): string {
  return `channel:${orgUuid}:${channelId}`;
}

/**
 * Build a tag from structured parts. Exhaustive over OprfTagKind so
 * adding a new kind is a compile error until this switch is extended.
 */
export function buildTag(
  parts:
    | { kind: "volunteer"; userId: UserId }
    | { kind: "account"; accountId: ClientAccountId }
    | { kind: "channel"; orgUuid: OrgId; channelId: ChannelSecret },
): string {
  switch (parts.kind) {
    case "volunteer":
      return volunteerTag(parts.userId);
    case "account":
      return accountTag(parts.accountId);
    case "channel":
      return channelTag(parts.orgUuid, parts.channelId);
  }
}
