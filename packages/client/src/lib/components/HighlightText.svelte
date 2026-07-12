<!--
  Plain-text search highlighter: wraps case-insensitive matches of term
  in <mark>. For decrypted content flowing through DecryptPlaceholder,
  pass searchTerm there instead; this component is for plaintext runs
  (meta segments, aliases) that never enter the decrypt path.
-->
<script lang="ts">
  import { isHighlightable, splitByTerm } from "$lib/search/highlight.js";

  interface Props {
    text: string;
    term?: string | null;
  }

  let { text, term = null }: Props = $props();
</script>

{#if isHighlightable(term)}
  {#each splitByTerm(text, term) as seg, i (i)}
    {#if seg.highlight}<mark class="search-highlight">{seg.text}</mark
      >{:else}{seg.text}{/if}
  {/each}
{:else}
  {text}
{/if}

<style>
  /* The highlighter is a meaning slot, so it must not wear brand color.
     --care-soft exists only in the default (Inkwell) theme; other themes
     keep their previous brand-tinted highlight via the fallback. */
  .search-highlight {
    background: var(
      --care-soft,
      color-mix(in srgb, var(--brand-accent) 25%, transparent)
    );
    color: inherit;
    border-radius: 2px;
    padding: 0 1px;
  }
</style>
