import type {
  TicketCardProps,
  TicketQuickAction,
} from "$lib/components/tickets/ticket-types.js";
import type { RawFollowUpPreview } from "./preview-loader.svelte.js";
import type { ReactionSummary, TicketStatus } from "@care-y/shared";
import { deriveDisplayStatus } from "./display-status.js";
import { resolveAsyncDecrypt } from "$lib/crypto/decrypt-result.js";
import { reactionsForTicket } from "./ticket-list-utils.js";
import * as m from "$lib/paraglide/messages.js";

export type DataCardProps = Omit<
  TicketCardProps,
  "viewMode" | "selected" | "multiSelectActive"
>;

export interface TicketLikeRecord {
  readonly id: string;
  readonly queueId: string;
  readonly encryptedQueueName: unknown;
  readonly status: TicketStatus;
  readonly onHold: boolean;
  readonly priority: "low" | "normal" | "high" | "urgent";
  readonly encryptedTitle: unknown;
  readonly keyWrap: unknown;
  readonly clientAlias: string;
  readonly assignedTo: string | null;
  readonly assignedDisplayName: unknown;
  readonly createdAt: string;
  readonly lastActivityAt: string | null;
  readonly followUpCount: number;
}

export interface CardPropsMapperDeps {
  readonly orgDecrypt: (cacheKey: string, ciphertext: unknown) => string | null;
  readonly decryptTitle: (
    ticketId: string,
    keyWrap: unknown,
    encryptedTitle: unknown,
  ) => string | undefined;
  readonly currentUserId: string;
  readonly unreadCount: (ticketId: string) => number;
  readonly getPreview: (ticketId: string) => RawFollowUpPreview[] | undefined;
  readonly previewReactionsMap: Map<string, ReactionSummary[]>;
  readonly ontap: (ticketId: string) => void;
  readonly onaction: (ticketId: string, action: TicketQuickAction) => void;
  readonly onencryptedhelp: () => void;
  readonly onselect?: (ticketId: string) => void;
}

export function createCardPropsMapper(
  deps: CardPropsMapperDeps,
): (ticket: TicketLikeRecord) => DataCardProps {
  return (t) => {
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

    const previews = deps.getPreview(t.id);

    return {
      ticketId: t.id,
      queueName: deps.orgDecrypt(`queue:${t.queueId}`, t.encryptedQueueName),
      displayStatus: deriveDisplayStatus(t.status, t.onHold, t.followUpCount),
      priority: t.priority,
      titleResult: resolveAsyncDecrypt(
        deps.decryptTitle(t.id, t.keyWrap, t.encryptedTitle),
        t.keyWrap !== null,
      ),
      clientAlias: t.clientAlias,
      assignedName,
      assignedIsSelf,
      createdAt: new Date(t.createdAt),
      lastActivityAt:
        t.lastActivityAt !== null ? new Date(t.lastActivityAt) : null,
      followUpCount: t.followUpCount,
      unreadCount: deps.unreadCount(t.id),
      previewFollowUps: previews,
      previewReactions: reactionsForTicket(previews, deps.previewReactionsMap),
      ontap: deps.ontap,
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
