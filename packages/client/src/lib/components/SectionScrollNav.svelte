<script lang="ts">
  import { Segmented, SegmentedButton } from "konsta/svelte";
  import type { ScrollSection } from "./useSectionScroll.svelte.js";

  interface Props {
    sections: readonly ScrollSection[];
    active: string;
    onscroll: (id: string) => void;
    ariaLabel?: string;
  }

  let {
    sections,
    active,
    onscroll,
    ariaLabel = "Section navigation",
  }: Props = $props();
</script>

<nav class="section-scroll-nav" aria-label={ariaLabel}>
  <Segmented strong class="glass">
    {#each sections as section (section.id)}
      {@const Icon = section.icon}
      <SegmentedButton
        active={active === section.id}
        onclick={() => onscroll(section.id)}
        aria-label={section.label()}
        aria-current={active === section.id ? "true" : undefined}
      >
        <Icon size={16} aria-hidden="true" />
      </SegmentedButton>
    {/each}
  </Segmented>
</nav>

<style>
  .section-scroll-nav {
    padding: 0.5rem var(--page-pad-x);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .section-scroll-nav :global(span) {
    background-color: var(--brand-text) !important;
  }

  .section-scroll-nav::-webkit-scrollbar {
    display: none;
  }

  .section-scroll-nav :global(.k-button) {
    flex: 1;
  }
</style>
