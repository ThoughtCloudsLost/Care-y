<script lang="ts">
  import { Check } from "@lucide/svelte";
  import { prefersReducedMotion } from "svelte/motion";
  import * as m from "$lib/paraglide/messages.js";
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
    if (strip == null) return;
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

  // Client-arc label at the head of the strip. Reading `locale` makes
  // the label re-resolve on a locale switch, the same dependency msg()
  // gives the sub labels.
  const clientArc: boolean = $derived(section.group === "client");
  const groupLabel: string = $derived.by(() => {
    void locale;
    return m.demo_contents_group_client();
  });
</script>

<!--
  The page's sub list for viewports too narrow to carry SectionRail: one
  scrolling row of options rather than a wrapping block, so it holds a
  single line however many subs a section has.

  Nothing here dodges the frame. Below the wide breakpoint the frame is
  docked at the bottom of the window and this strip sits at the top, and
  the story's own text is what flows around it.

  Arc grouping at narrow widths is a label, not header chips. The strip
  holds one section's subs and never the section list, so there is
  nothing here for group chips to divide; the section list is the
  TopBar contents menu, which renders the same two labelled arcs at
  every width. What a narrow reader lacks is a cue for which arc the
  current section belongs to. Read mode is the narrow default and hides
  the frame, toolbar badge included, so a client section would
  otherwise pass for one more staff screen. The strip therefore leads
  with the arc's name inside the client arc only. The org arc goes
  unlabelled: it is the arc the handbook assumes from the entry page
  on, and a label on every org section would spend a 343px row on a
  word that never changes. The label also renders for a single-sub client
  section, where the strip would otherwise show nothing, so the cue
  holds across the whole arc.
-->
{#if section.subs.length > 1 || clientArc}
  <nav
    class="section-strip"
    bind:this={stripEl}
    aria-label={msg(section.titleKey)}
  >
    {#if clientArc}
      <span class="strip-group">{groupLabel}</span>
    {/if}
    {#if section.subs.length > 1}
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
    {/if}
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

  /* Arc label: static text in the quiet uppercase of the contents-menu
     group headings, hairline-ruled off from the options it precedes. It
     stays pinned while the options scroll under it, so the cue is never
     scrolled away from. */
  .strip-group {
    position: sticky;
    left: 0;
    z-index: 1;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 0.625rem 0 0;
    border-right: 1px solid var(--hair);
    background: var(--paper);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    white-space: nowrap;
    color: var(--muted);
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
