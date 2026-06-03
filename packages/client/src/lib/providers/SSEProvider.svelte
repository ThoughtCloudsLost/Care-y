<!--
  SSEProvider: manages the Server-Sent Events connection lifecycle.

  Connects to the SSE endpoint only when `enabled` is true (auth state
  confirmed). Disconnects on teardown or when enabled transitions to false.
  Receives metadata-only events (no PII) and triggers TanStack Query
  cache invalidation for real-time updates.

  Sits inside AppCryptoProvider in the (app) layout. The `enabled` prop
  is gated by auth state so SSE never connects on unauthenticated pages.
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { createSSEListener } from "$lib/sse/index.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";

  import type { Snippet } from "svelte";

  let { children, enabled = false }: { children: Snippet; enabled?: boolean } =
    $props();

  const queryClient = useQueryClient();

  const sseListener = createSSEListener({
    url: "/sse/events",
    queryClient,
    onConnectionChange: (isConnected) => {
      if (!isConnected) {
        announceToLiveRegion(
          "assertive",
          "Real-time connection lost. Reconnecting...",
        );
      }
    },
  });

  $effect(() => {
    if (!browser) return;

    if (enabled) {
      sseListener.connect();
    } else {
      sseListener.disconnect();
    }

    return () => {
      sseListener.disconnect();
    };
  });
</script>

{@render children()}
