<!--
  Top navbar wrapping Konsta Navbar. Exposes snippet slots for left/right content.
  Back link uses Konsta's NavbarBackLink for platform-correct chevron and ARIA.
-->
<script lang="ts">
  import { Navbar, NavbarBackLink } from "konsta/svelte";
  import type { ShellNavbarProps } from "./types";

  let {
    title,
    backLink = false,
    onback,
    left: leftSlot,
    right: rightSlot,
  }: ShellNavbarProps = $props();
</script>

<Navbar {title}>
  {#snippet left()}
    {#if backLink}
      <NavbarBackLink onclick={onback} text="Back" />
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
