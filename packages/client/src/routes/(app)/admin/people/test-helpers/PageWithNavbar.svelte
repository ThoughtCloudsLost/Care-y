<script lang="ts">
  import type { Snippet, Component } from "svelte";

  interface NavbarOverride {
    title?: string;
    subnavbar?: Snippet;
    right?: Snippet;
    subnavbarHidden?: () => boolean;
  }

  interface Props {
    page: Component;
    navbarCtx: { current: NavbarOverride | undefined };
  }

  let { page: PageComponent, navbarCtx }: Props = $props();

  const subnavbar = $derived(navbarCtx.current?.subnavbar);
  const rightSnippet = $derived(navbarCtx.current?.right);
</script>

<div data-testid="navbar-area">
  {#if subnavbar}
    {@render subnavbar()}
  {/if}
  {#if rightSnippet}
    {@render rightSnippet()}
  {/if}
</div>
<PageComponent />
