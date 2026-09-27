<!--
  Icon-only filter control with a count badge: the saved-filter bookmark in
  FilterPillBar and each dashboard section's filter button. The badge shows
  while the count is above zero; the accessible name is the label alone.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Link, Icon } from "konsta/svelte";

  interface Props {
    label: string;
    count: number;
    onclick: () => void;
    /** Disclosure state, for a button that shows and hides a region. */
    expanded?: boolean;
    /** Id of the region the button shows and hides. */
    controls?: string;
    class?: string;
    children: Snippet;
  }

  let {
    label,
    count,
    onclick,
    expanded,
    controls,
    class: className = "",
    children,
  }: Props = $props();
</script>

<Link
  iconOnly
  role="button"
  class="badged-icon-button {className}"
  aria-label={label}
  aria-expanded={expanded}
  aria-controls={controls}
  onclick={() => onclick()}
>
  <Icon badge={count > 0 ? String(count) : undefined}>
    {@render children()}
  </Icon>
</Link>

<style>
  :global(.badged-icon-button) {
    flex-shrink: 0;
  }
</style>
