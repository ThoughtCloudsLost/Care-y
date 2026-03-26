<!--
  Top navbar wrapping Konsta Navbar. Exposes snippet slots for left/right content.
  Back link renders a button that calls onback. Caller-provided left/right snippets
  are rendered alongside the back link.
-->
<script lang="ts">
  import { Navbar, Link } from "konsta/svelte";
  import type { ShellNavbarProps } from "./types";

  let {
    title,
    backLink = false,
    onback,
    left: leftSlot,
    right: rightSlot,
  }: ShellNavbarProps = $props();
</script>

<nav aria-label="Page navigation">
  <Navbar {title}>
    {#snippet left()}
      {#if backLink}
        <Link navbar onclick={onback}>
          <span aria-hidden="true" class="back-arrow">&lsaquo;</span>
          <span class="sr-only">Back</span>
        </Link>
      {/if}
      {#if leftSlot}
        {@render leftSlot()}
      {/if}
    {/snippet}
    {#snippet right()}
      {#if rightSlot}
        {@render rightSlot()}
      {/if}
    {/snippet}
  </Navbar>
</nav>

<style>
  .back-arrow {
    font-size: 28px;
    line-height: 1;
    font-weight: 300;
    color: var(--brand-primary);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
