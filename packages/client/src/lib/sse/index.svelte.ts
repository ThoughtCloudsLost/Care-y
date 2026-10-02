/**
 * SSE listener for real-time cache invalidation.
 *
 * Connects to the server's SSE endpoint after authentication. Receives
 * metadata-only events (opaque IDs + event type strings, never PII or
 * encrypted content) and triggers surgical TanStack Query cache invalidation.
 *
 * Reconnects with exponential backoff (capped at 30s) on connection loss.
 */

import { browser } from "$app/environment";
import type { QueryClient } from "@tanstack/svelte-query";
import {
  ticketsKeys,
  ticketKeys,
  kbKeys,
  notificationKeys,
  adminKeys,
  orgDeletionKeys,
  fundKeys,
} from "$lib/query/keys";

export interface SSEEvent {
  type: string;
  ticketId?: string;
  entityType?: string;
}

export interface SSEListenerOptions {
  url: string;
  queryClient: QueryClient;
  onConnectionChange?: (connected: boolean) => void;
}

const MAX_BACKOFF_MS = 30_000;

/**
 * How long ticket_changed events collect before one invalidation pass runs.
 * A burst (a run of inbound messages, a queue deleted with its tickets
 * moved) then costs one refetch rather than one per event. The window
 * starts at the first event and is not extended by later ones, so a
 * steady stream still flushes every window.
 */
export const TICKET_CHANGED_FLUSH_MS = 300;

interface PendingTicketChanges {
  readonly ticketIds: Set<string>;
  timer: ReturnType<typeof setTimeout> | null;
}

// Keyed by client so separate caches never share a window.
const pendingTicketChanges = new WeakMap<QueryClient, PendingTicketChanges>();

function flushTicketChanges(
  queryClient: QueryClient,
  pending: PendingTicketChanges,
): void {
  pending.timer = null;
  const ticketIds = [...pending.ticketIds];
  pending.ticketIds.clear();
  void queryClient.invalidateQueries({ queryKey: ticketsKeys.all });
  for (const ticketId of ticketIds) {
    void queryClient.invalidateQueries({ queryKey: ticketKeys.all(ticketId) });
  }
}

function pendingFor(queryClient: QueryClient): PendingTicketChanges {
  const existing = pendingTicketChanges.get(queryClient);
  if (existing !== undefined) return existing;
  const created: PendingTicketChanges = { ticketIds: new Set(), timer: null };
  pendingTicketChanges.set(queryClient, created);
  return created;
}

function queueTicketChanged(
  ticketId: string | undefined,
  queryClient: QueryClient,
): void {
  const pending = pendingFor(queryClient);
  if (ticketId !== undefined) pending.ticketIds.add(ticketId);
  if (pending.timer !== null) return;
  pending.timer = setTimeout(() => {
    flushTicketChanges(queryClient, pending);
  }, TICKET_CHANGED_FLUSH_MS);
}

export function handleEvent(event: SSEEvent, queryClient: QueryClient): void {
  switch (event.type) {
    // A ticket the viewer can open changed. Carries no detail, so every
    // list and count refetches along with that ticket's own queries.
    case "ticket_changed":
      queueTicketChanged(event.ticketId, queryClient);
      break;
    case "ticket_created":
    case "ticket_assigned":
    case "ticket_closed":
    case "ticket_reopened":
    case "ticket_escalated":
    case "mention":
    case "merge_completed":
      void queryClient.invalidateQueries({ queryKey: ticketsKeys.all });
      if (event.ticketId !== undefined) {
        void queryClient.invalidateQueries({
          queryKey: ticketKeys.all(event.ticketId),
        });
      }
      break;
    case "followup_added":
      if (event.ticketId !== undefined) {
        void queryClient.invalidateQueries({
          queryKey: ticketKeys.followUps(event.ticketId),
        });
        void queryClient.invalidateQueries({
          queryKey: ticketKeys.recordings(event.ticketId),
        });
        void queryClient.invalidateQueries({
          queryKey: ticketKeys.attachments(event.ticketId),
        });
        // A new follow-up changes unread state: refresh both list
        // read-state families (loaded-window batch + global sweep).
        void queryClient.invalidateQueries({
          queryKey: ticketsKeys.readStates(),
        });
        void queryClient.invalidateQueries({
          queryKey: ticketsKeys.readStateSweep(),
        });
        // It also changes follow-up count and last activity: refresh the
        // lists and the facet counts that label them.
        void queryClient.invalidateQueries({
          queryKey: ticketsKeys.lists(),
        });
        void queryClient.invalidateQueries({
          queryKey: ticketsKeys.facetIndex(),
        });
        // A message is an activity event: refresh the feed and every
        // filtered view of it.
        void queryClient.invalidateQueries({
          queryKey: ticketsKeys.recentActivity(),
        });
      }
      break;
    case "kb:updated":
      void queryClient.invalidateQueries({ queryKey: kbKeys.all });
      break;
    case "notification":
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
      break;
    case "voicemail_quarantined":
      void queryClient.invalidateQueries({
        queryKey: adminKeys.quarantine(),
      });
      break;
    case "org_deletion_requested":
    case "org_deletion_cancelled":
      void queryClient.invalidateQueries({
        queryKey: orgDeletionKeys.status(),
      });
      break;
    // Carries no fund or amount. Balances refetch and decrypt again.
    case "fund_entry_recorded":
      void queryClient.invalidateQueries({ queryKey: fundKeys.all });
      break;
    // A donation provider reported new gifts. The event names neither the
    // provider nor the fund, so every fund query refetches.
    case "funds_inflow_changed":
      void queryClient.invalidateQueries({ queryKey: fundKeys.all });
      break;
  }
}

function isSSEEvent(value: unknown): value is SSEEvent {
  if (typeof value !== "object" || value === null) return false;
  if (!("type" in value) || typeof value.type !== "string") return false;
  if (
    "ticketId" in value &&
    (typeof value.ticketId !== "string" || value.ticketId === "")
  )
    return false;
  if ("entityType" in value && typeof value.entityType !== "string")
    return false;
  return true;
}

function parseSSEEvent(raw: string): SSEEvent | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isSSEEvent(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function createSSEListener(options: SSEListenerOptions): {
  connect(): void;
  disconnect(): void;
  readonly connected: boolean;
} {
  if (!browser) {
    return {
      connect() {
        /* no-op during SSR */
      },
      disconnect() {
        /* no-op during SSR */
      },
      get connected() {
        return false;
      },
    };
  }

  let eventSource: EventSource | null = null;
  let connected = $state(false);
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempt = 0;

  function connect(): void {
    if (eventSource) return;

    eventSource = new EventSource(options.url, { withCredentials: true });

    eventSource.onopen = () => {
      connected = true;
      reconnectAttempt = 0;
      options.onConnectionChange?.(true);
    };

    eventSource.onmessage = (event: MessageEvent<string>) => {
      const data = parseSSEEvent(event.data);
      if (data === null) return;
      handleEvent(data, options.queryClient);
    };

    eventSource.onerror = () => {
      connected = false;
      options.onConnectionChange?.(false);
      eventSource?.close();
      eventSource = null;
      scheduleReconnect();
    };
  }

  function disconnect(): void {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    eventSource?.close();
    eventSource = null;
    const wasConnected = connected;
    connected = false;
    if (wasConnected) {
      options.onConnectionChange?.(false);
    }
  }

  function scheduleReconnect(): void {
    const delay = Math.min(1000 * 2 ** reconnectAttempt, MAX_BACKOFF_MS);
    reconnectAttempt++;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, delay);
  }

  return {
    connect,
    disconnect,
    get connected() {
      return connected;
    },
  };
}
