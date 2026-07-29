import type {
  TicketCardProps,
  TicketQuickAction,
} from "$lib/components/tickets/ticket-types.js";
import type { RawFollowUpPreview } from "./preview-loader.svelte.js";
import type { ReactionSummary, TicketStatus } from "@care-y/shared";
import { deriveDisplayStatus, type DisplayStatus } from "./display-status.js";
import {
  resolveAsyncDecrypt,
  type DecryptResult,
} from "$lib/crypto/decrypt-result.js";
import { reactionsForTicket } from "./ticket-list-utils.js";
import type { QueueAppearance } from "$lib/utils/queue-appearance.js";
import * as m from "$lib/paraglide/messages.js";

export type DataCardProps = Omit<
  TicketCardProps,
  "viewMode" | "selected" | "multiSelectActive"
>;

export interface TicketLikeRecord {
  readonly id: string;
  readonly queueId: string;
  readonly encryptedQueueName: string;
  readonly status: TicketStatus;
  readonly onHold: boolean;
  readonly priority: "low" | "normal" | "high" | "urgent";
  readonly encryptedTitle: string;
  readonly keyWrap: unknown;
  readonly clientId: string;
  readonly encryptedClientAlias: string;
  readonly assignedTo: string | null;
  readonly assignedDisplayName: string | null;
  readonly createdAt: string;
  readonly lastActivityAt: string | null;
  readonly followUpCount: number;
}

export interface CardPropsMapperDeps {
  readonly orgDecrypt: (
    cacheKey: string,
    ciphertext: string | null,
  ) => string | null;
  readonly decryptTitle: (
    ticketId: string,
    keyWrap: unknown,
    encryptedTitle: string,
  ) => string | undefined;
  readonly currentUserId: string;
  readonly unreadCount: (ticketId: string) => number;
  readonly getPreview: (ticketId: string) => RawFollowUpPreview[] | undefined;
  readonly previewReactionsMap: ReadonlyMap<string, ReactionSummary[]>;
  readonly ontap: (ticketId: string) => void;
  readonly onaction: (ticketId: string, action: TicketQuickAction) => void;
  readonly onencryptedhelp: () => void;
  readonly onselect?: (ticketId: string) => void;
  readonly onfullopen?: (ticketId: string) => void;
  /** Queue color/icon lookup from the surface's queues list, if it has one. */
  readonly queueAppearance?: (queueId: string) => QueueAppearance | undefined;
}

/** The subset of mapper deps the display-field core reads. */
export type TicketDisplayFieldDeps = Pick<
  CardPropsMapperDeps,
  "orgDecrypt" | "decryptTitle" | "currentUserId"
>;

/**
 * Display fields every ticket surface derives from a raw record. Cards,
 * table rows, and search results all read this one shape; the mapper and
 * the search provider compose it with their surface-specific extras.
 */
export interface TicketDisplayFields {
  readonly ticketId: string;
  readonly queueName: string | null;
  readonly displayStatus: DisplayStatus;
  readonly priority: "low" | "normal" | "high" | "urgent";
  readonly titleResult: DecryptResult;
  readonly clientAlias: string | null;
  readonly assignedName: string | null;
  readonly assignedIsSelf: boolean;
  readonly createdAt: Date;
  readonly lastActivityAt: Date | null;
  readonly followUpCount: number;
}

export function mapTicketDisplayFields(
  t: TicketLikeRecord,
  deps: TicketDisplayFieldDeps,
): TicketDisplayFields {
  const assignedIsSelf =
    t.assignedTo !== null && t.assignedTo === deps.currentUserId;
  let assignedName: string | null = null;
  if (assignedIsSelf) {
    assignedName = m.dashboard_assigned_you();
  } else if (t.assignedTo !== null) {
    assignedName =
      deps.orgDecrypt(`assignee:${t.assignedTo}`, t.assignedDisplayName) ??
      null;
  }

  return {
    ticketId: t.id,
    queueName: deps.orgDecrypt(`queue:${t.queueId}`, t.encryptedQueueName),
    displayStatus: deriveDisplayStatus(t.status, t.onHold, t.followUpCount),
    priority: t.priority,
    titleResult: resolveAsyncDecrypt(
      deps.decryptTitle(t.id, t.keyWrap, t.encryptedTitle),
      t.keyWrap !== null,
    ),
    clientAlias: deps.orgDecrypt(
      `client-alias:${t.clientId}`,
      t.encryptedClientAlias,
    ),
    assignedName,
    assignedIsSelf,
    createdAt: new Date(t.createdAt),
    lastActivityAt:
      t.lastActivityAt !== null ? new Date(t.lastActivityAt) : null,
    followUpCount: t.followUpCount,
  };
}

export function createCardPropsMapper(
  deps: CardPropsMapperDeps,
): (ticket: TicketLikeRecord) => DataCardProps {
  return (t) => {
    const previews = deps.getPreview(t.id);

    return {
      ...mapTicketDisplayFields(t, deps),
      queueAppearance: deps.queueAppearance?.(t.queueId),
      unreadCount: deps.unreadCount(t.id),
      previewFollowUps: previews,
      previewReactions: reactionsForTicket(previews, deps.previewReactionsMap),
      ontap: deps.ontap,
      onfullopen: deps.onfullopen,
      onselect: deps.onselect
        ? (id: string) => {
            deps.onselect?.(id);
          }
        : undefined,
      onaction: deps.onaction,
      onencryptedhelp: deps.onencryptedhelp,
    };
  };
}
