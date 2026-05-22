<script lang="ts">
  import { Block, BlockTitle } from "konsta/svelte";
  import { Info } from "@lucide/svelte";
  import { TERMINOLOGY_DEFAULTS_EN } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms, getTerminology } from "$lib/terminology/index.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { getWizardNavCtx } from "./wizard-nav-context.js";

  interface Props {
    onconfirm: () => void;
    goBack?: () => void;
  }

  const { onconfirm, goBack }: Props = $props();

  const wizardNav = getWizardNavCtx();

  const resolveTerms = getTerminology();
  const hasCustomTerms = $derived.by(() => {
    const t = resolveTerms();
    return (
      t.volunteer !== TERMINOLOGY_DEFAULTS_EN.volunteer ||
      t.client !== TERMINOLOGY_DEFAULTS_EN.client
    );
  });

  const TOTAL_PAGES = 4;
  let subPage = $state(0);
  let diagramOpen = $state(false);
  let briefingEl: HTMLDivElement | undefined;

  let zoomScale = $state(1);
  let panX = $state(0);
  let panY = $state(0);
  let pinchStartDist = 0;
  let pinchStartScale = 1;
  let panStartX = 0;
  let panStartY = 0;
  let panStartPanX = 0;
  let panStartPanY = 0;

  function pinchDistance(a: Touch, b: Touch): number {
    const dx = a.clientX - b.clientX;
    const dy = a.clientY - b.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function handleZoomStart(e: TouchEvent): void {
    const t0 = e.touches[0];
    const t1 = e.touches[1];
    if (e.touches.length === 2 && t0 && t1) {
      pinchStartDist = pinchDistance(t0, t1);
      pinchStartScale = zoomScale;
    } else if (e.touches.length === 1 && t0 && zoomScale > 1) {
      panStartX = t0.clientX;
      panStartY = t0.clientY;
      panStartPanX = panX;
      panStartPanY = panY;
    }
  }

  function handleZoomMove(e: TouchEvent): void {
    e.preventDefault();
    const t0 = e.touches[0];
    const t1 = e.touches[1];
    if (e.touches.length === 2 && t0 && t1) {
      const dist = pinchDistance(t0, t1);
      zoomScale = Math.max(
        1,
        Math.min(5, pinchStartScale * (dist / pinchStartDist)),
      );
    } else if (e.touches.length === 1 && t0 && zoomScale > 1) {
      panX = panStartPanX + (t0.clientX - panStartX);
      panY = panStartPanY + (t0.clientY - panStartY);
    }
  }

  function handleZoomEnd(): void {
    if (zoomScale <= 1.05) {
      zoomScale = 1;
      panX = 0;
      panY = 0;
    }
  }

  function resetZoom(): void {
    zoomScale = 1;
    panX = 0;
    panY = 0;
  }

  function closeDiagram(): void {
    diagramOpen = false;
    resetZoom();
  }

  function handleOverlayTap(e: MouseEvent): void {
    if (e.target === e.currentTarget && zoomScale <= 1) {
      closeDiagram();
    }
  }

  function scrollContentToTop(): void {
    let el = briefingEl?.parentElement ?? null;
    while (el) {
      const { overflowY } = getComputedStyle(el);
      if (overflowY === "auto" || overflowY === "scroll") {
        el.scrollTop = 0;
        return;
      }
      el = el.parentElement;
    }
  }

  function nextPage(): void {
    if (subPage < TOTAL_PAGES - 1) {
      subPage++;
      scrollContentToTop();
    }
  }

  function prevPage(): void {
    if (subPage > 0) {
      subPage--;
      scrollContentToTop();
    }
  }

  function handleConfirm(): void {
    haptic();
    onconfirm();
  }

  $effect(() => {
    const isLast = subPage === TOTAL_PAGES - 1;
    wizardNav.current = {
      right: {
        label: isLast ? m.onboarding_briefing_confirm() : m.common_next(),
        disabled: false,
        loading: false,
        onaction: isLast ? handleConfirm : nextPage,
      },
      left:
        subPage > 0
          ? {
              label: m.common_back(),
              disabled: false,
              loading: false,
              onaction: prevPage,
            }
          : goBack
            ? {
                label: m.common_back(),
                disabled: false,
                loading: false,
                onaction: goBack,
              }
            : undefined,
    };
  });

  const protectionRows = [
    {
      data: m.onboarding_briefing_practice_client_data(),
      access: m.onboarding_briefing_practice_client_access(),
      compromise: m.onboarding_briefing_practice_client_compromise(),
    },
    {
      data: m.onboarding_briefing_practice_org_data(),
      access: m.onboarding_briefing_practice_org_access(),
      compromise: m.onboarding_briefing_practice_org_compromise(),
    },
    {
      data: m.onboarding_briefing_practice_branding_data(),
      access: m.onboarding_briefing_practice_branding_access(),
      compromise: m.onboarding_briefing_practice_branding_compromise(),
    },
    {
      data: m.onboarding_briefing_practice_vol_data(),
      access: m.onboarding_briefing_practice_vol_access(),
      compromise: m.onboarding_briefing_practice_vol_compromise(),
    },
    {
      data: m.onboarding_briefing_practice_username_data(),
      access: m.onboarding_briefing_practice_username_access(),
      compromise: m.onboarding_briefing_practice_username_compromise(),
    },
    {
      data: m.onboarding_briefing_practice_email_data(),
      access: m.onboarding_briefing_practice_email_access(),
      compromise: m.onboarding_briefing_practice_email_compromise(),
    },
    {
      data: m.onboarding_briefing_practice_telephony_data(),
      access: m.onboarding_briefing_practice_telephony_access(),
      compromise: m.onboarding_briefing_practice_telephony_compromise(),
    },
  ];

  const scenarios = [
    {
      title: m.onboarding_briefing_scenario_seizure_title(),
      body: m.onboarding_briefing_scenario_seizure_body(),
    },
    {
      title: m.onboarding_briefing_scenario_oprf_title(),
      body: m.onboarding_briefing_scenario_oprf_body(),
    },
    {
      title: m.onboarding_briefing_scenario_device_title(),
      body: m.onboarding_briefing_scenario_device_body(),
    },
    {
      title: m.onboarding_briefing_scenario_insider_title(),
      body: m.onboarding_briefing_scenario_insider_body(),
    },
    {
      title: m.onboarding_briefing_scenario_telephony_title(),
      body: m.onboarding_briefing_scenario_telephony_body(),
    },
    {
      title: m.onboarding_briefing_scenario_network_title(),
      body: m.onboarding_briefing_scenario_network_body(),
    },
  ];

  const choices = [
    {
      title: m.onboarding_briefing_choice_telephony_title(),
      protects: m.onboarding_briefing_choice_telephony_protects(),
      whyCare: m.onboarding_briefing_choice_telephony_why(),
      tradeoff: m.onboarding_briefing_choice_telephony_tradeoff(),
    },
    {
      title: m.onboarding_briefing_choice_2fa_title(),
      protects: m.onboarding_briefing_choice_2fa_protects(),
      whyCare: m.onboarding_briefing_choice_2fa_why(),
      tradeoff: m.onboarding_briefing_choice_2fa_tradeoff(),
    },
    {
      title: m.onboarding_briefing_choice_tor_title(),
      protects: m.onboarding_briefing_choice_tor_protects(),
      whyCare: m.onboarding_briefing_choice_tor_why(),
      tradeoff: m.onboarding_briefing_choice_tor_tradeoff(),
    },
    {
      title: m.onboarding_briefing_choice_vpn_title(),
      protects: m.onboarding_briefing_choice_vpn_protects(),
      whyCare: m.onboarding_briefing_choice_vpn_why(),
      tradeoff: m.onboarding_briefing_choice_vpn_tradeoff(),
    },
  ];
</script>

<div class="briefing-content" bind:this={briefingEl}>
  <BlockTitle medium>{m.onboarding_briefing_heading()}</BlockTitle>

  {#if hasCustomTerms}
    <Block class="terminology-note">
      <p class="terminology-note-text">
        <Info size={14} class="terminology-note-icon" />
        {m.onboarding_briefing_terminology_note(withTerms())}
      </p>
    </Block>
  {/if}

  <div class="page-dots" aria-hidden="true">
    {#each Array(TOTAL_PAGES) as _, i (i)}
      <span class="page-dot" class:page-dot--active={i === subPage}></span>
    {/each}
  </div>

  {#if subPage === 0}
    <Block>
      <p class="briefing-prose">{m.onboarding_briefing_intro()}</p>
    </Block>

    <Block>
      <p class="diagram-caption">{m.onboarding_briefing_diagram_caption()}</p>
      <button
        type="button"
        class="diagram-tap touch-feedback"
        onclick={() => (diagramOpen = true)}
        aria-label={m.onboarding_briefing_diagram_tap()}
      >
        <img
          src="/images/crypto-overview.png"
          alt={m.onboarding_briefing_diagram_alt()}
          class="crypto-diagram"
        />
        <span class="diagram-hint">{m.onboarding_briefing_diagram_tap()}</span>
      </button>
    </Block>

    {#if diagramOpen}
      <div
        class="diagram-overlay"
        role="dialog"
        aria-label={m.onboarding_briefing_diagram_alt()}
        tabindex="-1"
        onclick={handleOverlayTap}
        onkeydown={(e: KeyboardEvent) => {
          if (e.key === "Escape") {
            diagramOpen = false;
          }
        }}
        ontouchstart={handleZoomStart}
        ontouchmove={handleZoomMove}
        ontouchend={handleZoomEnd}
      >
        <button
          type="button"
          class="diagram-close"
          onclick={closeDiagram}
          aria-label={m.shell_close()}
        >
          &times;
        </button>
        <img
          src="/images/crypto-overview.png"
          alt={m.onboarding_briefing_diagram_alt()}
          class="diagram-full"
          style="transform: scale({zoomScale}) translate({panX /
            zoomScale}px, {panY / zoomScale}px);"
        />
        {#if zoomScale <= 1}
          <p class="diagram-zoom-hint">
            {m.onboarding_briefing_diagram_zoom()}
          </p>
        {/if}
      </div>
    {/if}
  {:else if subPage === 1}
    <BlockTitle medium>
      {m.onboarding_briefing_practice_heading()}
    </BlockTitle>

    {#each protectionRows as row, i (row.data)}
      <div class="scenario-wrapper">
        <details open={i === 0}>
          <summary class="scenario-summary touch-feedback">{row.data}</summary>
          <div class="scenario-body">
            <p class="choice-label">
              {m.onboarding_briefing_practice_col_access()}
            </p>
            <p>{row.access}</p>
            <p class="choice-label compromise-label">
              {m.onboarding_briefing_practice_col_compromise()}
            </p>
            <p>{row.compromise}</p>
          </div>
        </details>
      </div>
    {/each}
  {:else if subPage === 2}
    <BlockTitle medium>
      {m.onboarding_briefing_scenarios_heading()}
    </BlockTitle>

    {#each scenarios as scenario, i (scenario.title)}
      <div class="scenario-wrapper">
        <details open={i === 0}>
          <summary class="scenario-summary touch-feedback"
            >{scenario.title}</summary
          >
          <div class="scenario-body">
            <p>{scenario.body}</p>
          </div>
        </details>
      </div>
    {/each}
  {:else if subPage === 3}
    <BlockTitle medium>
      {m.onboarding_briefing_choices_heading()}
    </BlockTitle>
    <Block>
      <p class="briefing-prose">{m.onboarding_briefing_choices_intro()}</p>
    </Block>

    {#each choices as choice, i (choice.title)}
      <div class="scenario-wrapper">
        <details open={i === 0}>
          <summary class="scenario-summary touch-feedback"
            >{choice.title}</summary
          >
          <div class="scenario-body">
            <p class="choice-label">
              {m.onboarding_briefing_choice_label_protects()}
            </p>
            <p>{choice.protects}</p>
            <p class="choice-label">
              {m.onboarding_briefing_choice_label_why()}
            </p>
            <p>{choice.whyCare}</p>
            <p class="choice-label">
              {m.onboarding_briefing_choice_label_tradeoff()}
            </p>
            <p>{choice.tradeoff}</p>
          </div>
        </details>
      </div>
    {/each}
  {/if}
</div>

<style>
  .briefing-content {
    padding-bottom: var(--space-2xl);
  }

  :global(.terminology-note) {
    background: color-mix(
      in srgb,
      var(--brand-primary, #3b82f6) 8%,
      transparent
    );
    border-radius: var(--card-radius);
    border: 1px solid
      color-mix(in srgb, var(--brand-primary, #3b82f6) 20%, transparent);
  }

  .terminology-note-text {
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm);
    font-size: var(--text-sm);
    color: var(--muted);
    margin: 0;
    line-height: 1.5;
  }

  .terminology-note-text :global(.terminology-note-icon) {
    flex-shrink: 0;
    margin-top: 0.125rem;
    color: var(--brand-primary, #3b82f6);
  }

  .briefing-prose {
    font-size: var(--text-md);
    line-height: 1.6;
    color: var(--ink);
    margin: 0;
  }

  .diagram-caption {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--muted);
    text-align: center;
    margin: 0 0 var(--space-md);
  }

  .diagram-tap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    width: 100%;
  }

  .crypto-diagram {
    width: 100%;
    max-width: 480px;
    display: block;
    border-radius: var(--card-radius);
    background: var(--surface-1);
    padding: var(--space-lg);
  }

  .diagram-hint {
    font-size: var(--text-sm);
    color: var(--muted);
  }

  .diagram-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: none;
    overflow: hidden;
  }

  .diagram-close {
    position: absolute;
    top: calc(var(--space-lg) + env(safe-area-inset-top, 0px));
    right: var(--space-xl);
    z-index: 1;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 1.5rem;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .diagram-full {
    max-width: 90vw;
    max-height: 80vh;
    object-fit: contain;
    transform-origin: center center;
    will-change: transform;
  }

  .diagram-zoom-hint {
    position: absolute;
    bottom: calc(var(--space-2xl) + env(safe-area-inset-bottom, 0px));
    left: 0;
    right: 0;
    text-align: center;
    font-size: var(--text-sm);
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  .scenario-wrapper {
    margin: 0 var(--page-pad-x) var(--space-lg);
  }

  .scenario-summary {
    font-size: var(--text-md);
    font-weight: 600;
    color: var(--ink);
    padding: var(--card-pad-y) var(--card-pad-x);
    background: var(--surface-2);
    border-radius: var(--card-radius);
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    gap: var(--space-lg);
  }

  .scenario-summary::before {
    content: "\25B6";
    font-size: var(--text-xs);
    transition: transform 150ms linear;
    display: inline-block;
    color: var(--muted);
  }

  @media (prefers-reduced-motion: reduce) {
    .scenario-summary::before {
      transition: none;
    }
  }

  details[open] > .scenario-summary::before {
    transform: rotate(90deg);
  }

  .scenario-summary::-webkit-details-marker {
    display: none;
  }

  .scenario-body {
    padding: var(--card-pad-y) var(--card-pad-x);
    font-size: var(--text-base);
    line-height: 1.6;
    color: var(--ink);
  }

  .scenario-body p {
    margin: 0;
  }

  .choice-label {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin: var(--space-lg) 0 var(--space-xs);
  }

  .choice-label:first-child {
    margin-top: 0;
  }

  .compromise-label {
    color: var(--k-color-red, #ef4444);
  }

  .page-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 12px 0;
  }

  .page-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--muted) 30%, transparent);
    transition: background 150ms ease;
  }

  .page-dot--active {
    background: var(--brand-primary);
  }

  @media (prefers-reduced-motion: reduce) {
    .page-dot {
      transition: none;
    }
  }
</style>
