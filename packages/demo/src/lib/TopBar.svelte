<script lang="ts">
  import { RotateCcw, Sun, Moon, Globe } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { SECTIONS, type SectionId } from "./scroll-sections.js";

  interface Props {
    /** null on the entry page, where no section is being shown yet. */
    activeSection: SectionId | null;
    dark: boolean;
    locale: string;
    seen: number;
    total: number;
    onSectionClick: (id: SectionId) => void;
    onToggleDark: () => void;
    onRestart: () => void;
    onLocaleChange: () => void;
  }

  let {
    activeSection,
    dark,
    locale,
    seen,
    total,
    onSectionClick,
    onToggleDark,
    onRestart,
    onLocaleChange,
  }: Props = $props();

  /** Message-function lookup by section titleKey */
  function sectionLabel(titleKey: string): string {
    // Read locale prop to establish reactive dependency (re-render on change)
    void locale;
    const lookup: Record<string, () => string> = {
      demo_section_login_title: () => m.demo_section_login_title(),
      demo_section_tickets_title: () => m.demo_section_tickets_title(),
      demo_section_ticket_detail_title: () =>
        m.demo_section_ticket_detail_title(),
      demo_section_search_title: () => m.demo_section_search_title(),
      demo_section_dashboard_title: () => m.demo_section_dashboard_title(),
      demo_section_library_title: () => m.demo_section_library_title(),
      demo_section_admin_title: () => m.demo_section_admin_title(),
      demo_section_schedule_title: () => m.demo_section_schedule_title(),
      demo_section_settings_title: () => m.demo_section_settings_title(),
    };
    // eslint-disable-next-line security/detect-object-injection -- key is a section titleKey from config, not user input
    const fn = lookup[titleKey];
    return fn !== undefined ? fn() : titleKey;
  }
</script>

<header class="top-bar">
  <div class="top-bar-inner">
    <div class="top-bar-left">
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

  .top-bar-title {
    font-size: 0.875rem;
    font-weight: 700;
    white-space: nowrap;
    color: #1d1d1f;
  }

  :global(html.dark) .top-bar-title {
    color: #f5f5f7;
  }

  .top-bar-progress {
    font-size: 0.6875rem;
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
