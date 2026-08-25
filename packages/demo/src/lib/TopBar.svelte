<script lang="ts">
  import {
    RotateCcw,
    Sun,
    Moon,
    Globe,
    Waypoints,
    House,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Check,
    Ellipsis,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { SECTIONS, type Section, type SectionId } from "./scroll-sections.js";
  import { resolveStoryMessage, deriveSectionState } from "./story-messages.js";
  import type { DemoMode } from "./demo-mode.svelte.js";
  import type { DemoTopic } from "./bridge.js";

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
    seenTopics: ReadonlySet<DemoTopic>;
    onSectionClick: (id: SectionId) => void;
    onToggleDark: () => void;
    onRestart: () => void;
    onLocaleChange: () => void;
    onToggleFlowBand: () => void;
    onToggleMode: () => void;
    /** Return to the handbook introduction page. */
    onHomeClick: () => void;
  }

  let {
    activeSection,
    dark,
    locale,
    seen,
    total,
    flowBandOpen,
    mode,
    seenTopics,
    onSectionClick,
    onToggleDark,
    onRestart,
    onLocaleChange,
    onToggleFlowBand,
    onToggleMode,
    onHomeClick,
  }: Props = $props();

  /** Section title via the canonical story-messages resolver. */
  function sectionLabel(titleKey: string): string {
    return resolveStoryMessage(titleKey, locale);
  }

  // -----------------------------------------------------------------------
  // Section index math
  // -----------------------------------------------------------------------

  const activeIndex: number = $derived(
    activeSection !== null
      ? SECTIONS.findIndex((s) => s.id === activeSection)
      : -1,
  );

  const activeEntry: Section | null = $derived(
    activeIndex >= 0 ? (SECTIONS.at(activeIndex) ?? null) : null,
  );
  const prevSection: Section | null = $derived(
    activeIndex > 0 ? (SECTIONS.at(activeIndex - 1) ?? null) : null,
  );
  const nextSection: Section | null = $derived(
    activeIndex >= 0 && activeIndex < SECTIONS.length - 1
      ? (SECTIONS.at(activeIndex + 1) ?? null)
      : activeIndex === -1
        ? (SECTIONS.at(0) ?? null)
        : null,
  );

  // Entry page (activeSection === null): prev goes nowhere, next goes
  // to SECTIONS[0]. From SECTIONS[0]: prev returns to the entry page
  // via onHomeClick.
  const prevDisabled: boolean = $derived(activeSection === null);
  const nextDisabled: boolean = $derived(nextSection === null);

  function goToPrev(): void {
    if (prevSection !== null) {
      onSectionClick(prevSection.id);
    } else if (activeIndex === 0) {
      onHomeClick();
    }
  }

  function goToNext(): void {
    if (nextSection !== null) {
      onSectionClick(nextSection.id);
    }
  }

  // -----------------------------------------------------------------------
  // Popover state (mutually exclusive)
  // -----------------------------------------------------------------------

  let openMenu: "contents" | "more" | null = $state(null);

  let contentsTriggerRef: HTMLButtonElement | undefined = $state(undefined);
  let contentsPanelRef: HTMLDivElement | undefined = $state(undefined);
  let moreTriggerRef: HTMLButtonElement | undefined = $state(undefined);
  let morePanelRef: HTMLDivElement | undefined = $state(undefined);

  function toggleContents(): void {
    openMenu = openMenu === "contents" ? null : "contents";
  }

  function toggleMore(): void {
    openMenu = openMenu === "more" ? null : "more";
  }

  function closeMenus(): void {
    openMenu = null;
  }

  // Close on outside pointerdown
  $effect(() => {
    if (openMenu === null) return;

    function onPointerDown(e: PointerEvent): void {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (
        contentsTriggerRef?.contains(target) === true ||
        contentsPanelRef?.contains(target) === true ||
        moreTriggerRef?.contains(target) === true ||
        morePanelRef?.contains(target) === true
      ) {
        return;
      }
      closeMenus();
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  });

  // Close on Escape with trigger refocus
  $effect(() => {
    if (openMenu === null) return;
    const trigger =
      openMenu === "contents" ? contentsTriggerRef : moreTriggerRef;

    function onKeydown(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        closeMenus();
        trigger?.focus();
      }
    }

    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  });

  // ArrowUp/Down roving focus within a menu panel
  function handleMenuKeydown(
    e: KeyboardEvent,
    panelRef: HTMLDivElement | undefined,
  ): void {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    if (panelRef === undefined) return;

    const items = Array.from(
      panelRef.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"], [role="menuitemradio"]',
      ),
    );
    if (items.length === 0) return;

    const current = document.activeElement;
    const idx = items.findIndex((el) => el === current);

    if (e.key === "ArrowDown") {
      const next = idx < items.length - 1 ? idx + 1 : 0;
      items.at(next)?.focus();
    } else {
      const prev = idx > 0 ? idx - 1 : items.length - 1;
      items.at(prev)?.focus();
    }
  }

  function selectSection(id: SectionId): void {
    onSectionClick(id);
    closeMenus();
  }

  function handleLocale(): void {
    onLocaleChange();
    closeMenus();
  }

  function handleTheme(): void {
    onToggleDark();
    closeMenus();
  }

  function handleRestartMenu(): void {
    onRestart();
    closeMenus();
  }
</script>

<header class="top-bar">
  <div class="top-bar-inner">
    <div class="top-bar-left">
      <span class="top-bar-brand">{m.demo_app_brand()}</span>
      <span class="top-bar-title">{m.demo_app_title()}</span>
    </div>

    <button
      class="icon-btn home-btn"
      class:icon-btn-active={activeSection === null}
      onclick={onHomeClick}
      aria-current={activeSection === null ? "page" : undefined}
      aria-label={m.demo_home()}
      title={m.demo_home()}
      type="button"
    >
      <House size={18} />
    </button>

    <!-- Prev / Next -->
    <button
      class="icon-btn nav-btn"
      disabled={prevDisabled}
      onclick={goToPrev}
      aria-label={prevSection !== null
        ? m.demo_section_prev({ section: sectionLabel(prevSection.titleKey) })
        : undefined}
      title={prevSection !== null
        ? m.demo_section_prev({ section: sectionLabel(prevSection.titleKey) })
        : undefined}
      type="button"
    >
      <ChevronLeft size={18} />
    </button>
    <button
      class="icon-btn nav-btn"
      disabled={nextDisabled}
      onclick={goToNext}
      aria-label={nextSection !== null
        ? m.demo_section_next({ section: sectionLabel(nextSection.titleKey) })
        : undefined}
      title={nextSection !== null
        ? m.demo_section_next({ section: sectionLabel(nextSection.titleKey) })
        : undefined}
      type="button"
    >
      <ChevronRight size={18} />
    </button>

    <!-- Contents picker -->
    <div class="contents-wrapper">
      <button
        class="contents-trigger"
        bind:this={contentsTriggerRef}
        onclick={toggleContents}
        aria-haspopup="menu"
        aria-expanded={openMenu === "contents"}
        type="button"
      >
        <span class="contents-label">
          {#if activeEntry !== null}
            {sectionLabel(activeEntry.titleKey)}
          {:else}
            {m.demo_contents()}
          {/if}
        </span>
        <ChevronDown size={14} />
      </button>

      {#if openMenu === "contents"}
        <div
          class="contents-panel"
          role="menu"
          tabindex="-1"
          bind:this={contentsPanelRef}
          onkeydown={(e) => handleMenuKeydown(e, contentsPanelRef)}
        >
          <div class="contents-header">
            {m.demo_progress_explored({
              seen: String(seen),
              total: String(total),
            })}
          </div>
          {#each SECTIONS as section, i (section.id)}
            {@const state = deriveSectionState(section, seenTopics)}
            <button
              class="contents-item"
              class:contents-item-active={activeSection === section.id}
              role="menuitemradio"
              aria-checked={activeSection === section.id}
              type="button"
              onclick={() => selectSection(section.id)}
            >
              <span class="contents-index">{i + 1}</span>
              <span class="contents-item-label">
                {sectionLabel(section.titleKey)}
              </span>
              <span class="contents-count">
                {#if state.complete}
                  <Check size={12} class="contents-check" />
                {:else if state.topicCount > 0}
                  {state.seenCount}/{state.topicCount}
                {/if}
              </span>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Mode segmented control -->
    <div
      class="mode-segments"
      role="radiogroup"
      aria-label={m.demo_mode_label()}
    >
      <button
        class="mode-seg"
        class:mode-seg-active={mode === "read"}
        role="radio"
        aria-checked={mode === "read"}
        type="button"
        onclick={mode !== "read" ? onToggleMode : undefined}
      >
        {m.demo_mode_read()}
      </button>
      <button
        class="mode-seg"
        class:mode-seg-active={mode === "explore"}
        role="radio"
        aria-checked={mode === "explore"}
        type="button"
        onclick={mode !== "explore" ? onToggleMode : undefined}
      >
        {m.demo_mode_explore()}
      </button>
    </div>

    <!-- Flow band toggle -->
    <button
      class="icon-btn flow-btn"
      class:icon-btn-active={flowBandOpen}
      onclick={onToggleFlowBand}
      aria-label={m.demo_flow_toggle_label()}
      aria-pressed={flowBandOpen}
      title={m.demo_flow_toggle_label()}
      type="button"
    >
      <Waypoints size={18} />
      <span class="flow-label">{m.demo_flow_toggle_short()}</span>
    </button>

    <!-- Overflow menu -->
    <div class="more-wrapper">
      <button
        class="icon-btn"
        bind:this={moreTriggerRef}
        onclick={toggleMore}
        aria-haspopup="menu"
        aria-expanded={openMenu === "more"}
        aria-label={m.demo_more_menu()}
        title={m.demo_more_menu()}
        type="button"
      >
        <Ellipsis size={18} />
      </button>

      {#if openMenu === "more"}
        <div
          class="more-panel"
          role="menu"
          tabindex="-1"
          bind:this={morePanelRef}
          onkeydown={(e) => handleMenuKeydown(e, morePanelRef)}
        >
          <button
            class="more-item"
            role="menuitem"
            type="button"
            onclick={handleLocale}
          >
            <Globe size={16} />
            <span>{m.demo_locale_toggle()}</span>
          </button>
          <button
            class="more-item"
            role="menuitem"
            type="button"
            onclick={handleTheme}
          >
            {#if dark}
              <Sun size={16} />
            {:else}
              <Moon size={16} />
            {/if}
            <span>{m.demo_theme_toggle()}</span>
          </button>
          <button
            class="more-item"
            role="menuitem"
            type="button"
            onclick={handleRestartMenu}
          >
            <RotateCcw size={16} />
            <span>{m.demo_restart()}</span>
          </button>
        </div>
      {/if}
    </div>
  </div>
</header>

<style>
  .top-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: color-mix(in srgb, var(--paper) 92%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--hair);
    padding: 0 1rem;
  }

  .top-bar-inner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

  .top-bar-brand {
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    line-height: 1.2;
    text-transform: uppercase;
    white-space: nowrap;
    color: var(--muted);
  }

  .top-bar-title {
    font-family: var(--theme-font-display);
    font-size: 0.9375rem;
    font-weight: 600;
    font-optical-sizing: auto;
    letter-spacing: 0.005em;
    line-height: 1.25;
    white-space: nowrap;
    color: var(--ink);
  }

  /* -----------------------------------------------------------------------
     Icon buttons (shared): the quiet bordered-square instrument anatomy
     ----------------------------------------------------------------------- */

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 9px;
    border: 1px solid var(--hair);
    background: var(--raised);
    cursor: pointer;
    color: var(--ink-2);
    flex-shrink: 0;
  }

  .icon-btn:hover {
    background: color-mix(in srgb, var(--ink) 6%, transparent);
  }

  .icon-btn:disabled {
    opacity: 0.35;
    cursor: default;
    pointer-events: none;
  }

  .icon-btn:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: -2px;
  }

  .icon-btn-active {
    border-color: var(--demo-accent);
    background: var(--demo-accent-soft);
    color: var(--demo-accent);
  }

  .icon-btn-active:hover {
    background: var(--demo-accent-strong);
  }

  .home-btn {
    margin-right: 0.125rem;
  }

  /* -----------------------------------------------------------------------
     Contents picker
     ----------------------------------------------------------------------- */

  .contents-wrapper {
    position: relative;
    flex: 1;
    min-width: 0;
    max-width: 280px;
  }

  .contents-trigger {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    width: 100%;
    padding: 0.375rem 0.625rem;
    border: 1px solid var(--hair-2);
    border-radius: 8px;
    background: var(--raised);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--ink);
    cursor: pointer;
    min-height: 34px;
  }

  .contents-trigger:hover {
    background: color-mix(in srgb, var(--ink) 4%, transparent);
  }

  .contents-trigger:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: -2px;
  }

  .contents-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }

  /* Panels take the Inkwell card anatomy: raised paper, hair-2 edge,
     no shadow. Items rule off with hairlines rather than floating as
     rounded chips. */
  .contents-panel {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    min-width: 240px;
    max-height: 70vh;
    overflow-y: auto;
    background: var(--raised);
    border: 1px solid var(--hair-2);
    border-radius: 12px;
    padding: 0;
    z-index: 110;
  }

  .contents-header {
    padding: 0.625rem 0.8125rem 0.5rem;
    border-bottom: 1px solid var(--hair);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-variant-numeric: tabular-nums;
    color: var(--muted);
    white-space: nowrap;
  }

  .contents-item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    width: 100%;
    padding: 0.5625rem 0.8125rem;
    border: none;
    border-bottom: 1px solid var(--hair);
    border-radius: 0;
    background: transparent;
    font-size: var(--text-base);
    font-weight: 400;
    color: var(--ink);
    cursor: pointer;
    text-align: left;
    min-height: 36px;
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }

  .contents-item:last-child {
    border-bottom: none;
  }

  .contents-item:hover {
    background: color-mix(in srgb, var(--ink) 5%, transparent);
  }

  .contents-item:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: -2px;
  }

  .contents-item-active {
    background: var(--demo-accent-soft);
    color: var(--demo-accent);
    font-weight: 600;
  }

  .contents-item-active:hover {
    background: var(--demo-accent-strong);
    color: var(--demo-accent);
  }

  .contents-count {
    flex-shrink: 0;
    font-size: 0.71875rem;
    font-variant-numeric: tabular-nums;
    color: var(--muted);
  }

  .contents-index {
    flex-shrink: 0;
    min-width: 1.1em;
    font-variant-numeric: tabular-nums;
    font-size: 0.75rem;
    color: var(--muted);
    text-align: right;
  }

  .contents-item-active .contents-index {
    color: inherit;
  }

  .contents-item-label {
    flex: 1;
    min-width: 0;
  }

  .contents-count :global(.contents-check) {
    color: var(--meter-strong);
  }

  /* -----------------------------------------------------------------------
     Mode segmented control
     ----------------------------------------------------------------------- */

  /* Spec segmented anatomy: hair-2 frame, hair separators, quiet muted
     labels; the selected segment lifts to raised paper in bold ink
     rather than taking the accent. */
  .mode-segments {
    display: flex;
    flex-shrink: 0;
    border: 1px solid var(--hair-2);
    border-radius: 8px;
    overflow: hidden;
  }

  .mode-seg {
    padding: 0.375rem 0.625rem;
    border: none;
    background: transparent;
    font-size: var(--text-sm);
    font-weight: 400;
    color: var(--muted);
    cursor: pointer;
    white-space: nowrap;
    min-height: 32px;
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }

  .mode-seg:hover {
    background: color-mix(in srgb, var(--ink) 4%, transparent);
  }

  .mode-seg:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: -2px;
  }

  .mode-seg-active {
    background: var(--raised);
    color: var(--ink);
    font-weight: 700;
    cursor: default;
  }

  .mode-seg-active:hover {
    background: var(--raised);
  }

  /* Hairline divider between segments */
  .mode-seg + .mode-seg {
    border-left: 1px solid var(--hair);
  }

  /* -----------------------------------------------------------------------
     Flow band toggle (icon + optional label)
     ----------------------------------------------------------------------- */

  .flow-btn {
    gap: 0.375rem;
    width: auto;
    padding: 0 0.625rem;
  }

  .flow-label {
    font-size: var(--text-sm);
    font-weight: 600;
    white-space: nowrap;
  }

  /* -----------------------------------------------------------------------
     Overflow (more) menu
     ----------------------------------------------------------------------- */

  .more-wrapper {
    position: relative;
    flex-shrink: 0;
  }

  .more-panel {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 190px;
    background: var(--raised);
    border: 1px solid var(--hair-2);
    border-radius: 12px;
    padding: 0;
    overflow: hidden;
    z-index: 110;
    display: flex;
    flex-direction: column;
  }

  .more-item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.5625rem 0.8125rem;
    border: none;
    border-bottom: 1px solid var(--hair);
    border-radius: 0;
    background: transparent;
    font-size: var(--text-base);
    font-weight: 400;
    color: var(--ink-2);
    cursor: pointer;
    width: 100%;
    text-align: left;
    min-height: 36px;
    transition: background 0.15s ease;
  }

  .more-item:last-child {
    border-bottom: none;
  }

  .more-item:hover {
    background: color-mix(in srgb, var(--ink) 5%, transparent);
  }

  .more-item:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: -2px;
  }

  /* -----------------------------------------------------------------------
     Responsive: narrow (< 900px)
     ----------------------------------------------------------------------- */

  @media (max-width: 899px) {
    .top-bar-left {
      display: none;
    }

    .flow-label {
      display: none;
    }

    .flow-btn {
      width: 34px;
      padding: 0;
    }

    /* On narrow screens the panel escapes its wrapper to span almost
       the full viewport width. Calculated margins pull it left of the
       trigger; the bar's 1rem padding is the visual gutter. */
    .contents-panel {
      left: auto;
      right: auto;
      min-width: 0;
      width: calc(100vw - 2rem);
      max-width: calc(100vw - 2rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .contents-item,
    .mode-seg,
    .more-item {
      transition: none;
    }
  }
</style>
