<script lang="ts">
  import type { ScrollSection } from "$lib/components/useSectionScroll.svelte.js";
  import * as m from "$lib/paraglide/messages.js";

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
    ariaLabel = m.section_rail_label(),
  }: Props = $props();

  function handleKeyDown(e: KeyboardEvent): void {
    const currentIdx = sections.findIndex((s) => s.id === active);
    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const next = (currentIdx + 1) % sections.length;
        const section = sections.at(next);
        if (section != null) onscroll(section.id);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prev = (currentIdx - 1 + sections.length) % sections.length;
        const section = sections.at(prev);
        if (section != null) onscroll(section.id);
        break;
      }
      case "Home": {
        e.preventDefault();
        const first = sections[0];
        if (first != null) onscroll(first.id);
        break;
      }
      case "End": {
        e.preventDefault();
        const last = sections[sections.length - 1];
        if (last != null) onscroll(last.id);
        break;
      }
    }
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<nav class="section-rail" aria-label={ariaLabel} onkeydown={handleKeyDown}>
  <div class="section-rail-items">
    {#each sections as section (section.id)}
      {@const isActive = active === section.id}
      {@const Icon = section.icon}
      <button
        type="button"
        class="section-rail-item"
        class:active={isActive}
        aria-current={isActive ? "true" : undefined}
        aria-label={section.label()}
        tabindex={isActive ? 0 : -1}
        data-section-id={section.id}
        onclick={() => onscroll(section.id)}
      >
        <span class="section-rail-icon">
          <Icon size={20} aria-hidden="true" />
        </span>
        <span class="section-rail-label">{section.label()}</span>
      </button>
    {/each}
  </div>
</nav>

<style>
  .section-rail {
    display: flex;
    flex-direction: column;
    width: 200px;
    min-height: 0;
    height: 100%;
    background: var(--glass-surface);
    color: var(--glass-text);
    border-inline-end: 1px solid var(--hair, var(--glass-highlight));
    overflow-y: auto;
    overflow-x: hidden;
    flex-shrink: 0;
    scrollbar-width: thin;
    padding-top: 0.5rem;
  }

  .section-rail-items {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0.25rem 0;
  }

  .section-rail-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: calc(100% - 0.75rem);
    padding: 0.5rem 0.625rem;
    border: none;
    background: transparent;
    color: var(--glass-text);
    cursor: pointer;
    border-radius: 8px;
    margin-inline: 0.375rem;
    transition: background-color 150ms ease;
    font-size: var(--text-sm);
    text-align: start;
    line-height: 1.3;
  }

  .section-rail-item:hover {
    background: var(--brand-primary-20);
  }

  .section-rail-item:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: -2px;
  }

  .section-rail-item.active {
    background: var(--brand-primary-20);
    color: var(--glass-text);
  }

  .section-rail-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .section-rail-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .section-rail {
      transition: none;
    }

    .section-rail-item {
      transition: none;
    }
  }

  @media (prefers-contrast: more) {
    .section-rail {
      background: Canvas;
      color: CanvasText;
      border-inline-end: 1px solid CanvasText;
    }

    .section-rail-item.active {
      background: Highlight;
      color: HighlightText;
    }
  }
</style>
