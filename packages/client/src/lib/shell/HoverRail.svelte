<script lang="ts">
  import type { ScrollSection } from "$lib/components/useSectionScroll.svelte.js";
  import * as m from "$lib/paraglide/messages.js";

  interface Props {
    sections: readonly ScrollSection[];
    pageLabel: string;
    onnavigate: (sectionId: string) => void;
    ondismiss: () => void;
  }

  let { sections, pageLabel, onnavigate, ondismiss }: Props = $props();

  function handleKeyDown(e: KeyboardEvent): void {
    switch (e.key) {
      case "Escape": {
        e.preventDefault();
        ondismiss();
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        ondismiss();
        break;
      }
      case "ArrowDown": {
        e.preventDefault();
        const target = e.currentTarget;
        if (target instanceof HTMLElement) {
          const buttons =
            target.querySelectorAll<HTMLElement>(".hover-rail-item");
          const focused = document.activeElement;
          let idx = -1;
          buttons.forEach((btn, i) => {
            if (btn === focused) idx = i;
          });
          const next = buttons[(idx + 1) % buttons.length];
          next?.focus();
        }
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const target = e.currentTarget;
        if (target instanceof HTMLElement) {
          const buttons =
            target.querySelectorAll<HTMLElement>(".hover-rail-item");
          const focused = document.activeElement;
          let idx = -1;
          buttons.forEach((btn, i) => {
            if (btn === focused) idx = i;
          });
          const prev = buttons[(idx - 1 + buttons.length) % buttons.length];
          prev?.focus();
        }
        break;
      }
    }
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<nav
  class="hover-rail"
  aria-label={m.section_rail_hover_label({ page: pageLabel })}
  onkeydown={handleKeyDown}
>
  <div class="hover-rail-items">
    {#each sections as section, i (section.id)}
      {@const Icon = section.icon}
      <button
        type="button"
        class="hover-rail-item"
        tabindex={i === 0 ? 0 : -1}
        onclick={() => onnavigate(section.id)}
      >
        <span class="hover-rail-icon">
          <Icon size={20} aria-hidden="true" />
        </span>
        <span class="hover-rail-label">{section.label()}</span>
      </button>
    {/each}
  </div>
</nav>

<style>
  .hover-rail {
    position: absolute;
    top: 0;
    left: 0;
    width: 200px;
    height: 100dvh;
    background: var(--glass-surface);
    color: var(--glass-text);
    border-inline-end: 1px solid var(--hair, var(--glass-highlight));
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    padding-top: 0.5rem;
    z-index: 11;
    box-shadow: 4px 0 12px rgba(0, 0, 0, 0.08);
    animation: hover-rail-slide-in 200ms ease forwards;
  }

  @keyframes hover-rail-slide-in {
    from {
      opacity: 0;
      transform: translateX(-8px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .hover-rail-items {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0.25rem 0;
  }

  .hover-rail-item {
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

  .hover-rail-item:hover {
    background: var(--brand-primary-20);
  }

  .hover-rail-item:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: -2px;
  }

  .hover-rail-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .hover-rail-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .hover-rail {
      animation: none;
    }

    .hover-rail-item {
      transition: none;
    }
  }

  @media (prefers-contrast: more) {
    .hover-rail {
      background: Canvas;
      color: CanvasText;
      border-inline-end: 1px solid CanvasText;
      box-shadow: none;
    }
  }
</style>
