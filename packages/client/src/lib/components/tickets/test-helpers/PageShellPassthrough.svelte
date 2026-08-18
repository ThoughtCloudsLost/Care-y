<!--
  Test-only passthrough for PageShell that renders both the navbar snippet
  and the children snippet. PassthroughShell only renders children, so it
  drops the navbar content entirely, breaking tests that assert on navbar
  output (org name, skeleton, logo).
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    navbar?: Snippet;
    children?: Snippet;
    scrollTag?: string;
    [key: string]: unknown;
  }

  let { navbar, children, ..._rest }: Props = $props();
</script>

<div data-testid="page-shell-mock">
  {#if navbar}
    <div data-testid="page-shell-navbar">
      {@render navbar()}
    </div>
  {/if}
  {@render children?.()}
</div>
