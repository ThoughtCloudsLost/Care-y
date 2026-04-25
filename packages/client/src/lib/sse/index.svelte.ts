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

export function handleEvent(event: SSEEvent, queryClient: QueryClient): void {
  switch (event.type) {
    case "ticket:updated":
    case "ticket:created":
      void queryClient.invalidateQueries({ queryKey: ticketsKeys.all });
      if (event.ticketId !== undefined) {
        void queryClient.invalidateQueries({
          queryKey: ticketKeys.all(event.ticketId),
        });
      }
      break;
    case "followup:created":
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
