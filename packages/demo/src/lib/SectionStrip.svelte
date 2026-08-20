<script lang="ts">
  import { Check } from "@lucide/svelte";
  import { prefersReducedMotion } from "svelte/motion";
  import { resolveStoryMessage, deriveSubState } from "./story-messages.js";
  import type { Section, SectionId } from "./scroll-sections.js";
  import type { DemoTopic } from "./bridge.js";

  interface Props {
    section: Section;
    activeSub: string | null;
    locale: string;
    seenTopics: ReadonlySet<DemoTopic>;
    onSubClick: (sectionId: SectionId, subSlug: string) => void;
  }

  let { section, activeSub, locale, seenTopics, onSubClick }: Props = $props();

  let stripEl = $state<HTMLElement | undefined>(undefined);

  // Keep the selected option in view as the story scrolls through subs.
  // Written as scrollLeft on the strip rather than scrollIntoView: that
  // walks up the ancestor chain and would scroll the document, which is
  // the axis the story itself navigates on.
  $effect(() => {
    const strip = stripEl;
    // Read activeSub so a selection change re-runs this. Effects run
    // after the DOM settles, so the class is already on the new item.
    void activeSub;
    if (strip === undefined) return;
    const el = strip.querySelector<HTMLButtonElement>(".strip-item-active");
    if (el === null) return;
    const target = el.offsetLeft - (strip.clientWidth - el.offsetWidth) / 2;
    strip.scrollTo({
      left: Math.max(0, target),
      behavior: prefersReducedMotion.current ? "auto" : "smooth",
    });
  });

  function msg(key: string): string {
    return resolveStoryMessage(key, locale);
  }
</script>

<!--
  The page's sub list for viewports too narrow to carry SectionRail: one
  scrolling row of options rather than a wrapping block, so it holds a
  single line however many subs a section has.

  Nothing here dodges the frame. Below the wide breakpoint the frame is
  docked at the bottom of the window and this strip sits at the top, and
  the story's own text is what flows around it.
-->
{#if section.subs.length > 1}
  <nav
    class="section-strip"
    bind:this={stripEl}
    aria-label={msg(section.titleKey)}
  >
    {#each section.subs as sub (sub.slug)}
      {@const s = deriveSubState(sub.slug, activeSub, sub.topic, seenTopics)}
      <button
        class="strip-item"
        class:strip-item-active={s.isActive}
        class:strip-item-seen={s.isSeen && !s.isActive}
        type="button"
        onclick={() => onSubClick(section.id, sub.slug)}
      >
        <span class="strip-label">{msg(sub.headingKey)}</span>
        {#if s.isSeen}
          <Check size={12} class="strip-check" />
        {/if}
      </button>
    {/each}
  </nav>
{/if}

<style>
  .section-strip {
    display: flex;
    flex-wrap: nowrap;
    gap: 0.25rem;
    padding: 0.25rem 0 0.75rem;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
  }

  .section-strip::-webkit-scrollbar {
    display: none;
  }

  .strip-item {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.3125rem 0.625rem;
    border: none;
    border-radius: 6px;
    background: transparent;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--muted);
    cursor: pointer;
    white-space: nowrap;
    min-height: 44px;
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }

  .strip-item:hover {
    background: color-mix(in srgb, var(--ink) 4%, transparent);
    color: var(--ink);
  }

  .strip-item-active {
    background: var(--demo-accent-soft);
    color: var(--demo-accent);
  }

  .strip-item-active:hover {
    background: var(--demo-accent-strong);
    color: var(--demo-accent);
  }

  .strip-item-seen {
    color: var(--muted);
  }

  .strip-label {
    flex: 0 1 auto;
    min-width: 0;
  }

  .strip-item :global(.strip-check) {
    flex-shrink: 0;
    color: var(--meter-strong);
  }

  @media (prefers-reduced-motion: reduce) {
    .strip-item {
      transition: none;
    }
  }
</style>
