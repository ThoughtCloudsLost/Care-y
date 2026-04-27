<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    opened?: boolean;
    ondismiss?: () => void;
    title?: string;
    content?: Snippet;
    buttons?: Snippet;
  }

  let {
    opened,
    ondismiss: _,
    title,
    content: contentSnippet,
    buttons: buttonsSnippet,
  }: Props = $props();
</script>

{#if opened}
  <div data-testid="stub-dialog" data-title={title}>
    {#if title}
      <h3>{title}</h3>
    {/if}
    {#if contentSnippet}
      {@render contentSnippet()}
    {/if}
    {#if buttonsSnippet}
      {@render buttonsSnippet()}
    {/if}
  </div>
{/if}
