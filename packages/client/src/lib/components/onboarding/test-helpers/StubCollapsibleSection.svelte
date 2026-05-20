<script lang="ts">
  import type { Snippet, Component } from "svelte";

  let {
    heading,
    expanded: _expanded = true,
    ontoggle: _ontoggle,
    icon: _icon,
    iconColor: _iconColor,
    count: _count,
    loading: _loading,
    children,
  }: {
    heading: string;
    expanded?: boolean;
    ontoggle?: () => void;
    icon?: Component;
    iconColor?: string;
    count?: number;
    loading?: boolean;
    children?: Snippet;
  } = $props();
</script>

<div data-testid="collapsible-{heading}">
  <span>{heading}</span>
  {#if children}
    {@render children()}
  {/if}
</div>
