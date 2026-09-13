<!--
  Test-only passthrough for PageShell that renders every slot the real
  component does. PassthroughShell only renders children, so it drops the
  navbar content entirely, breaking tests that assert on navbar output
  (org name, skeleton, logo) or on overlays the real PageShell renders
  around the scroll container (the client drawer sits in afterScroll).
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    navbar?: Snippet;
    children?: Snippet;
    beforeScroll?: Snippet;
    afterScroll?: Snippet;
    scrollTag?: string;
    [key: string]: unknown;
  }

  let { navbar, children, beforeScroll, afterScroll, ..._rest }: Props =
    $props();
</script>

<div data-testid="page-shell-mock">
  {#if navbar}
    <div data-testid="page-shell-navbar">
      {@render navbar()}
    </div>
  {/if}
  {@render beforeScroll?.()}
  {@render children?.()}
  {@render afterScroll?.()}
</div>
