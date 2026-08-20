/**
 * Centralized TanStack Query key factories.
 *
 * Every query key in the app is built from these factories. The hierarchy
 * is designed so that prefix-based invalidation cascades predictably:
 * invalidating a parent key (e.g., ticketKeys.followUps(id)) invalidates
 * all children (initial, page, filtered, notes, byIds, summary).
 *
 * This file is pure data with no runtime dependencies.
 */

// "tickets" (plural) is the list-level namespace.
// "ticket" (singular) is the detail-level namespace.
// This split is intentional: invalidating ["tickets"] does not thrash
// every open detail view, and vice versa.

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export const ticketsKeys = {
  all: ["tickets"] as const,
  lists: () => [...ticketsKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...ticketsKeys.lists(), params] as const,
  counts: () => [...ticketsKeys.all, "counts"] as const,
  recentActivity: () => [...ticketsKeys.all, "recentActivity"] as const,
  myQueues: () => [...ticketsKeys.all, "myQueues"] as const,
  dashboardInfo: () => [...ticketsKeys.all, "dashboardInfo"] as const,

  // Read-state families for the list's unread pills. readStates() is the
  // invalidation root for the batched loaded-window lookups; the sweep is
  // the single global-unread completeness pass. Both are invalidated
  // together by the detail view's cursor flush and by follow-up SSE.
  readStates: () => [...ticketsKeys.all, "readState"] as const,
  readState: (ticketIds: readonly string[]) =>
    [...ticketsKeys.readStates(), ticketIds] as const,
  readStateSweep: () => [...ticketsKeys.all, "readStateSweep"] as const,
  // Unread-but-unloaded tickets fetched by id (tickets.get) so the sort
  // can pin them above the loaded window and the unread filter can show
  // them. Lives under the list namespace: it is list presentation data.
  unreadPinned: (ticketIds: readonly string[]) =>
    [...ticketsKeys.all, "unreadPinned", ticketIds] as const,
};

export const ticketKeys = {
  all: (ticketId: string) => ["ticket", ticketId] as const,
  detail: (ticketId: string): readonly ["ticket", string] =>
    ticketKeys.all(ticketId),
  readCursor: (ticketId: string) =>
    [...ticketKeys.all(ticketId), "readCursor"] as const,
  participants: (ticketId: string) =>
    [...ticketKeys.all(ticketId), "participants"] as const,
  isWatching: (ticketId: string) =>
    [...ticketKeys.all(ticketId), "isWatching"] as const,

  // All follow-up-related data lives under this prefix.
  // Invalidating followUps(id) cascades to everything below.
  followUps: (ticketId: string) =>
    [...ticketKeys.all(ticketId), "followUps"] as const,
  followUpsInitial: (ticketId: string) =>
    [...ticketKeys.followUps(ticketId), "initial"] as const,
  followUpsPage: (ticketId: string, cursor: string) =>
    [...ticketKeys.followUps(ticketId), "page", cursor] as const,
  followUpsFiltered: (ticketId: string, ...filterParams: unknown[]) =>
    [...ticketKeys.followUps(ticketId), "filtered", ...filterParams] as const,
  followUpsNotes: (ticketId: string) =>
    [...ticketKeys.followUps(ticketId), "notes"] as const,
  followUpsByIds: (ticketId: string, key: string) =>
    [...ticketKeys.followUps(ticketId), "byIds", key] as const,
  followUpSummary: (ticketId: string, ...filterParams: unknown[]) =>
    [...ticketKeys.followUps(ticketId), "summary", ...filterParams] as const,

  attachments: (ticketId: string) =>
    [...ticketKeys.all(ticketId), "attachments"] as const,
  recordings: (ticketId: string) =>
    [...ticketKeys.all(ticketId), "recordings"] as const,
  followupAttachments: (ticketId: string, followupId: string) =>
    [...ticketKeys.attachments(ticketId), "followup", followupId] as const,
  followupRecordings: (ticketId: string, followupId: string) =>
    [...ticketKeys.recordings(ticketId), "followup", followupId] as const,
};

export const kbKeys = {
  all: ["kb"] as const,
  items: () => [...kbKeys.all, "items"] as const,
  itemList: (params: Record<string, unknown>) =>
    [...kbKeys.items(), params] as const,
  item: (articleId: string) => [...kbKeys.all, "item", articleId] as const,
  categories: () => [...kbKeys.all, "categories"] as const,
  authors: () => [...kbKeys.all, "authors"] as const,
  recentItems: () => [...kbKeys.all, "recentItems"] as const,
  attachments: (articleId: string) =>
    [...kbKeys.all, "attachments", articleId] as const,
  vote: (articleId: string) => [...kbKeys.all, "vote", articleId] as const,
};

export const adminKeys = {
  all: ["admin"] as const,
  users: () => [...adminKeys.all, "users"] as const,
  orgGeneral: () => [...adminKeys.all, "orgGeneral"] as const,
  hubStatus: () => [...adminKeys.all, "hubStatus"] as const,
  branding: () => [...adminKeys.all, "branding"] as const,
  blocklist: () => [...adminKeys.all, "blocklist"] as const,
  greetings: () => [...adminKeys.all, "greetings"] as const,
  telephony: () => [...adminKeys.all, "telephony"] as const,
  telephonyConfig: () => [...adminKeys.telephony(), "config"] as const,
  telephonyPhones: () =>
    [...adminKeys.telephony(), "provisionedPhones"] as const,
  telephonyPhonePurpose: () =>
    [...adminKeys.telephony(), "phonePurpose"] as const,
  smsTemplates: () => [...adminKeys.all, "smsTemplates"] as const,
  reports: () => [...adminKeys.all, "reports"] as const,
  reportActiveCount: () => [...adminKeys.reports(), "activeCount"] as const,
  reportVolumeTrends: () => [...adminKeys.reports(), "volumeTrends"] as const,
  reportResolutionTrends: () =>
    [...adminKeys.reports(), "resolutionTrends"] as const,
  reportQueueStats: () => [...adminKeys.reports(), "queueStats"] as const,
  queueAssignments: () => [...adminKeys.all, "queue-assignments"] as const,
  quarantine: () => [...adminKeys.all, "quarantine"] as const,
  intakeQueue: () => [...adminKeys.all, "intakeQueue"] as const,
  callLog: (params: Record<string, unknown>) =>
    [...adminKeys.all, "callLog", params] as const,
  auditLog: (params: Record<string, unknown>) =>
    [...adminKeys.all, "auditLog", params] as const,
  escalationRules: (queueId: string) =>
    [...adminKeys.all, "escalationRules", queueId] as const,
  rolePermissions: () => [...adminKeys.all, "rolePermissions"] as const,
};

export const queueKeys = {
  all: ["queues"] as const,
  members: (queueId: string) => ["queue-members", queueId] as const,
  membersAll: () => ["queue-members"] as const,
};

export const volunteerKeys = {
  all: ["volunteers"] as const,
};

export const noteTypeKeys = {
  all: ["noteTypes"] as const,
  full: () => [...noteTypeKeys.all, "all"] as const,
};

export const presetKeys = {
  byQueue: (queueId: string | undefined) => ["presets", queueId] as const,
};

export const consultantKeys = {
  all: ["consultant"] as const,
  self: () => [...consultantKeys.all, "self"] as const,
};

export const orgKeyKeys = {
  wrappedOrgKey: () => ["keys", "wrappedOrgKey"] as const,
};

export const inviteKeys = {
  all: ["invites"] as const,
  pending: () => [...inviteKeys.all, "pending"] as const,
};

export const onboardingKeys = {
  all: ["onboarding"] as const,
  status: () => [...onboardingKeys.all, "status"] as const,
  validateInvite: (token: string) =>
    [...onboardingKeys.all, "validateInvite", token] as const,
};

export const twoFactorKeys = {
  all: ["twoFactor"] as const,
  status: () => [...twoFactorKeys.all, "status"] as const,
};

export const brandingKeys = {
  all: ["branding"] as const,
  public: () => [...brandingKeys.all, "public"] as const,
};

export const notificationKeys = {
  all: ["notifications"] as const,
  preferences: () => [...notificationKeys.all, "preferences"] as const,
};

/** Search, sort, and filter state that scopes a client list query. */
export interface ClientListKeyParams {
  readonly query: string;
  readonly sortBy: string;
  readonly sortDirection: string;
  readonly hasApplications?: boolean;
  readonly createdAfter?: string;
  readonly createdBefore?: string;
  readonly includeMerged?: boolean;
  readonly aliasHash?: string;
}

export const clientKeys = {
  all: ["clients"] as const,
  list: (params: ClientListKeyParams) =>
    [...clientKeys.all, "list", params] as const,
  detail: (clientId: string) =>
    [...clientKeys.all, "detail", clientId] as const,
  mergeCandidates: () => [...clientKeys.all, "mergeCandidates"] as const,
  dismissals: () => [...clientKeys.all, "dismissals"] as const,
};

// Reaction summaries for internal notes, fetched by follow-up id set.
// The set spans tickets on the list surface and is scoped to one ticket
// on the detail surfaces, so the family lives outside both namespaces.
// byIds callers pass a SORTED id list so key identity is order-free.
export const reactionKeys = {
  all: ["reactions"] as const,
  byIds: (followUpIds: readonly string[]) =>
    [...reactionKeys.all, followUpIds] as const,
};

export const intakeFormKeys = {
  all: ["intakeForms"] as const,
  list: () => [...intakeFormKeys.all, "list"] as const,
  detail: (formId: string) =>
    [...intakeFormKeys.all, "detail", formId] as const,
};

export const portalKeys = {
  all: ["portal"] as const,
  orgPublicKey: () => [...portalKeys.all, "orgPublicKey"] as const,
  bootstrap: (channelId: string) =>
    [...portalKeys.all, "bootstrap", channelId] as const,
  messages: (channelId: string) =>
    [...portalKeys.all, "messages", channelId] as const,
};
