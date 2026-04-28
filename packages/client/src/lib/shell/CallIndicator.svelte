<script lang="ts">
  import { Link } from "konsta/svelte";
  import { Phone } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import * as m from "$lib/paraglide/messages.js";
  import { callStore } from "$lib/stores/call.svelte.js";

  async function navigateToCall(): Promise<void> {
    const active = callStore.active;
    if (!active) return;
    // eslint-disable-next-line svelte/no-navigation-without-resolve -- /tickets/[id] is a known app route
    await goto(`/tickets/${active.ticketId}`);
  }
</script>

{#if callStore.active}
  <Link iconOnly onclick={navigateToCall} aria-label={m.call_indicator_label()}>
    <Phone size={20} class="call-pulse" />
  </Link>
{/if}

<style>
  :global(.call-pulse) {
    color: #22c55e;
    animation: pulse-call 1.5s ease-in-out infinite;
  }

  @keyframes pulse-call {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>
