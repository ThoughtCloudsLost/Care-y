import type { DataCardProps } from "./ticket-card-props.js";

/**
 * One skeleton prop blob for every loading TicketCard block (tickets
 * page initial load, pinned-rows placeholder, dashboard preview list).
 * A factory rather than a shared const: createdAt stays fresh per
 * consumer init instead of freezing at module load.
 */
export function makeSkeletonCardProps(): DataCardProps {
  return {
    ticketId: "",
    queueName: null,
    displayStatus: "active",
    priority: "normal",
    titleResult: { status: "loading" },
    clientAlias: "",
    assignedName: null,
    createdAt: new Date(),
    lastActivityAt: null,
    followUpCount: 0,
    unreadCount: 0,
    previewFollowUps: undefined,
    ontap: () => {
      /* loading skeleton, no-op */
    },
  };
}
