<script lang="ts">
  /**
   * Lane glyph, the second identity channel beside the lane color.
   * Written as a switch rather than a lookup table so the icon set is
   * exhaustive over FlowLane at compile time.
   */

  import {
    Database,
    Server,
    ArrowLeftRight,
    Lock,
    Smartphone,
  } from "@lucide/svelte";
  import type { FlowLane } from "./bridge.js";

  interface Props {
    lane: FlowLane;
    size?: number;
  }

  let { lane, size = 14 }: Props = $props();
</script>

{#if lane === "db"}
  <Database {size} />
{:else if lane === "server"}
  <Server {size} />
{:else if lane === "trpc"}
  <ArrowLeftRight {size} />
{:else if lane === "crypto"}
  <Lock {size} />
{:else}
  <Smartphone {size} />
{/if}
