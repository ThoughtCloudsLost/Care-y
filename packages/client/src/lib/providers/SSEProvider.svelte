<!--
  SSEProvider: manages the Server-Sent Events connection lifecycle.

  Connects to the SSE endpoint on mount, disconnects on teardown.
  Receives metadata-only events (no PII) and triggers TanStack Query
  cache invalidation for real-time updates.

  Sits inside CryptoProvider because SSE reconnection will eventually
  need auth state. Sits above BrandingProvider/ThemeProvider because
  those have no dependency on real-time events.
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { createSSEListener } from "$lib/sse/index.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";

  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

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

  onMount(() => {
    if (!browser) return;

    // SSE connects unconditionally for now; auth guard added when login flow exists (6i)
    sseListener.connect();

    return () => {
      sseListener.disconnect();
    };
  });
</script>

{@render children()}
