<script lang="ts">
  import { X } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type { SectionId } from "./scroll-sections.js";
  import { getSection } from "./scroll-sections.js";
  import { resolveStoryMessage } from "./story-messages.js";
  import {
    chipTargetValue,
    isFollowSuspended,
    chipJump,
    resumeFollow,
    dismissChip,
  } from "./reading-chip.svelte.js";

  interface Props {
    locale: string;
    /** Render in fullscreen drawer mode (skip positioning styles). */
    drawer?: boolean;
    /** Whether the chip is hidden by an excursion overlay. */
    hidden?: boolean;
    /** Called when the chip jump fires (windowed: engine scrolls). */
    onJump: (sectionId: SectionId, subSlug: string) => void;
  }

  let { locale, drawer = false, hidden = false, onJump }: Props = $props();

  const target = $derived(chipTargetValue());
  const suspended = $derived(isFollowSuspended());

  /** Resolve the sub-heading display text from the chip target. */
  const headingText: string | null = $derived.by(() => {
    if (target === null) return null;
    const section = getSection(target.sectionId);
    if (section === undefined) return null;
    const sub = section.subs.find((s) => s.slug === target.subSlug);
    if (sub === undefined) return null;
    return resolveStoryMessage(sub.headingKey, locale);
  });

  function handleMainClick(): void {
    if (suspended) {
      resumeFollow();
      return;
    }
    const t = chipJump();
    if (t !== null) {
      onJump(t.sectionId, t.subSlug);
    }
  }

  function handleDismiss(): void {
    dismissChip();
  }
</script>

{#if target !== null && headingText !== null && !hidden}
  <div
    class="reading-chip"
    class:reading-chip--drawer={drawer}
    role="status"
    aria-live="polite"
  >
    <button class="reading-chip__main" type="button" onclick={handleMainClick}>
      {#if suspended}
        {m.demo_chip_resume_follow()}
      {:else}
        {m.demo_chip_jump_to({ heading: headingText })}
      {/if}
    </button>
    <button
      class="reading-chip__dismiss"
      type="button"
      onclick={handleDismiss}
      aria-label={m.demo_chip_dismiss()}
    >
      <X size={14} />
    </button>
  </div>
{/if}

<style>
  .reading-chip {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    background: color-mix(in srgb, var(--demo-accent) 12%, var(--raised));
    border: 1px solid color-mix(in srgb, var(--demo-accent) 30%, var(--hair));
    border-radius: 999px;
    padding: 0;
    font-size: var(--text-xs, 0.75rem);
    line-height: 1.4;
    white-space: nowrap;
    max-width: 100%;
    animation: reading-chip-enter 0.15s ease-out;
  }

  /* Windowed: absolutely positioned near the bottom of the prose
     column. z-index 50 band (same as the excursion overlay). Sits
     above the dirty-guard note (which is in normal flow, not fixed). */
  .reading-chip:not(.reading-chip--drawer) {
    position: fixed;
    bottom: 5rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    box-shadow: 0 2px 8px color-mix(in srgb, var(--ink) 12%, transparent);
  }

  /* Drawer mode: no fixed positioning; the footer snippet handles
     placement. Centre within the footer dock. */
  .reading-chip--drawer {
    margin: 0.5rem auto;
  }

  .reading-chip__main {
    all: unset;
    cursor: pointer;
    padding: 0.375rem 0.75rem;
    color: var(--demo-accent);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .reading-chip__main:hover {
    text-decoration: underline;
  }

  .reading-chip__main:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: -2px;
    border-radius: 999px 0 0 999px;
  }

  .reading-chip__dismiss {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    color: var(--ink-2);
    flex-shrink: 0;
  }

  .reading-chip__dismiss:hover {
    background: color-mix(in srgb, var(--ink) 8%, transparent);
  }

  .reading-chip__dismiss:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: -2px;
  }

  @keyframes reading-chip-enter {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .reading-chip--drawer {
    animation-name: reading-chip-enter-drawer;
  }

  @keyframes reading-chip-enter-drawer {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .reading-chip,
    .reading-chip--drawer {
      animation: none;
    }
  }
</style>
