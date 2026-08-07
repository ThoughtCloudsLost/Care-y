<script lang="ts">
  import {
    RotateCcw,
    Sun,
    Moon,
    Globe,
    Waypoints,
    BookOpen,
    AppWindow,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { SECTIONS, type SectionId } from "./scroll-sections.js";
  import { resolveStoryMessage } from "./story-messages.js";
  import type { DemoMode } from "./demo-mode.svelte.js";

  interface Props {
    /** null on the entry page, where no section is being shown yet. */
    activeSection: SectionId | null;
    dark: boolean;
    locale: string;
    seen: number;
    total: number;
    /** True while the data flow band (or its small-viewport overlay) is shown. */
    flowBandOpen: boolean;
    /** Current effective demo mode. */
    mode: DemoMode;
    onSectionClick: (id: SectionId) => void;
    onToggleDark: () => void;
    onRestart: () => void;
    onLocaleChange: () => void;
    onToggleFlowBand: () => void;
    onToggleMode: () => void;
  }

  let {
    activeSection,
    dark,
    locale,
    seen,
    total,
    flowBandOpen,
    mode,
    onSectionClick,
    onToggleDark,
    onRestart,
    onLocaleChange,
    onToggleFlowBand,
    onToggleMode,
  }: Props = $props();

  /** Section title via the canonical story-messages resolver. */
  function sectionLabel(titleKey: string): string {
    return resolveStoryMessage(titleKey, locale);
  }
</script>

<header class="top-bar">
  <div class="top-bar-inner">
    <div class="top-bar-left">
      <span class="top-bar-brand">{m.demo_app_brand()}</span>
      <span class="top-bar-title">{m.demo_app_title()}</span>
      <span class="top-bar-progress">
        {m.demo_progress_explored({
          seen: String(seen),
          total: String(total),
        })}
      </span>
    </div>

    <nav class="section-tabs" aria-label={m.demo_section_nav_label()}>
      {#each SECTIONS as section (section.id)}
        <button
          class="section-tab"
          class:section-tab-active={activeSection === section.id}
          onclick={() => onSectionClick(section.id)}
          type="button"
        >
          {sectionLabel(section.titleKey)}
        </button>
      {/each}
    </nav>

    <div class="top-bar-right">
      <button
        class="icon-btn"
        class:icon-btn-active={mode === "read"}
        onclick={onToggleMode}
        aria-label={mode === "read"
          ? m.demo_mode_toggle_to_walk()
          : m.demo_mode_toggle_to_read()}
        aria-pressed={mode === "read"}
        title={mode === "read"
          ? m.demo_mode_toggle_to_walk()
          : m.demo_mode_toggle_to_read()}
        type="button"
      >
        {#if mode === "read"}
          <BookOpen size={18} />
        {:else}
          <AppWindow size={18} />
        {/if}
      </button>
      <button
        class="icon-btn"
        class:icon-btn-active={flowBandOpen}
        onclick={onToggleFlowBand}
        aria-label={m.demo_flow_toggle_label()}
        aria-pressed={flowBandOpen}
        title={m.demo_flow_toggle_label()}
        type="button"
      >
        <Waypoints size={18} />
      </button>
      <button
        class="icon-btn"
        onclick={onLocaleChange}
        aria-label={m.demo_locale_toggle()}
        type="button"
      >
        <Globe size={18} />
      </button>
      <button
        class="icon-btn"
        onclick={onToggleDark}
        aria-label={m.demo_theme_toggle()}
        type="button"
      >
        {#if dark}
          <Sun size={18} />
        {:else}
          <Moon size={18} />
        {/if}
      </button>
      <button
        class="icon-btn"
        onclick={onRestart}
        aria-label={m.demo_restart()}
        type="button"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  </div>
</header>

<style>
  .top-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(245, 245, 247, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    padding: 0 1rem;
  }

  :global(html.dark) .top-bar {
    background: rgba(22, 22, 24, 0.92);
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }

  .top-bar-inner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    height: 56px;
    max-width: 1280px;
    margin: 0 auto;
  }

  .top-bar-left {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 0;
    min-width: 0;
  }

  /* Brand line above the page title. Set small and letterspaced so
     three stacked lines still clear the 56px bar. */
  .top-bar-brand {
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    line-height: 1.2;
    text-transform: uppercase;
    white-space: nowrap;
    color: #86868b;
  }

  :global(html.dark) .top-bar-brand {
    color: #98989d;
  }

  .top-bar-title {
    font-size: 0.875rem;
    font-weight: 700;
    line-height: 1.25;
    white-space: nowrap;
    color: #1d1d1f;
  }

  :global(html.dark) .top-bar-title {
    color: #f5f5f7;
  }

  .top-bar-progress {
    font-size: 0.6875rem;
    line-height: 1.2;
    color: #86868b;
    white-space: nowrap;
  }

  :global(html.dark) .top-bar-progress {
    color: #98989d;
  }

  .section-tabs {
    display: flex;
    gap: 0.125rem;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    flex: 1;
    min-width: 0;
    padding: 0.25rem 0;
  }

  .section-tabs::-webkit-scrollbar {
    display: none;
  }

  .section-tab {
    flex-shrink: 0;
    padding: 0.375rem 0.75rem;
    border: none;
    border-radius: 8px;
    background: transparent;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #636366;
    cursor: pointer;
    white-space: nowrap;
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }

  .section-tab:hover {
    background: rgba(0, 0, 0, 0.04);
    color: #1d1d1f;
  }

  :global(html.dark) .section-tab {
    color: #98989d;
  }

  :global(html.dark) .section-tab:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #f5f5f7;
  }

  .section-tab-active {
    background: rgba(0, 122, 255, 0.1);
    color: #007aff;
  }

  .section-tab-active:hover {
    background: rgba(0, 122, 255, 0.15);
    color: #007aff;
  }

  :global(html.dark) .section-tab-active {
    background: rgba(0, 122, 255, 0.2);
    color: #64d2ff;
  }

  :global(html.dark) .section-tab-active:hover {
    background: rgba(0, 122, 255, 0.25);
    color: #64d2ff;
  }

  .top-bar-right {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid #d1d1d6;
    background: white;
    cursor: pointer;
    color: #1d1d1f;
    flex-shrink: 0;
  }

  .icon-btn:hover {
    background: #f0f0f0;
  }

  :global(html.dark) .icon-btn {
    background: #2c2c2e;
    border-color: #3a3a3c;
    color: #f5f5f7;
  }

  :global(html.dark) .icon-btn:hover {
    background: #3a3a3c;
  }

  .icon-btn-active {
    border-color: #007aff;
    background: rgba(0, 122, 255, 0.1);
    color: #007aff;
  }

  .icon-btn-active:hover {
    background: rgba(0, 122, 255, 0.15);
  }

  :global(html.dark) .icon-btn-active {
    border-color: #64d2ff;
    background: rgba(0, 122, 255, 0.2);
    color: #64d2ff;
  }

  :global(html.dark) .icon-btn-active:hover {
    background: rgba(0, 122, 255, 0.25);
  }

  /* Small screens: hide title, compress tabs */
  @media (max-width: 899px) {
    .top-bar-left {
      display: none;
    }

    .top-bar-inner {
      gap: 0.5rem;
    }
  }
</style>
