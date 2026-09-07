<!--
  Caution affordance for email_inbound follow-ups. Renders an info button
  that reveals a short warning about email's low trust level.

  Satisfies WCAG 2.2 SC 1.4.13:
  - Dismissable: Escape key closes the panel
  - Hoverable: moving the pointer into the panel keeps it open
  - Persistent: stays visible until the user dismisses it

  Reachable by keyboard (Enter/Space on the button, Escape to close),
  tap, and hover. Does not encode meaning in color alone (the icon is
  a circled "i" with a text label).

  No Konsta navigation imports; this is a content component.
-->
<script lang="ts">
  import { on } from "svelte/events";
  import * as m from "$lib/paraglide/messages.js";

  // Two open sources: hover shows the panel transiently, click/Enter
  // pins it. Kept separate because pointer taps synthesize mouseenter
  // right before click; a single toggled flag would open on the hover
  // and close again on the click, so a tap would only flash the panel.
  let sticky = $state(false);
  let hovering = $state(false);
  let hoverIntent = $state(false);
  let triggerEl = $state<HTMLButtonElement | null>(null);
  let panelEl = $state<HTMLSpanElement | null>(null);
  let flipUp = $state(false);

  const open = $derived(sticky || hovering);

  // Flip the panel above the trigger when it would clip at the bottom
  // of the viewport. Measured after render, before paint.
  $effect(() => {
    if (!open || panelEl == null) {
      flipUp = false;
      return;
    }
    const rect = panelEl.getBoundingClientRect();
    if (rect.bottom > window.innerHeight) {
      flipUp = true;
    }
  });

  function toggle(): void {
    sticky = !sticky;
  }

  function dismiss(): void {
    sticky = false;
    hovering = false;
    hoverIntent = false;
    triggerEl?.focus();
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      e.stopPropagation();
      dismiss();
    }
  }

  // SC 1.4.13 dismissable: Escape must close the panel without moving
  // pointer or focus. That covers hover-opened panels while focus sits
  // elsewhere, so the listener is window-level and exists only while open.
  // Capture phase: the shell binds a bubble-phase window keydown that
  // closes the ticket detail on Escape, and it registered first. Escape
  // with the panel open must dismiss only the panel.
  $effect(() => {
    if (!open) return;
    return on(window, "keydown", handleKeydown, { capture: true });
  });

  function handleMouseEnter(): void {
    hoverIntent = true;
    hovering = true;
  }

  function handleMouseLeave(): void {
    hoverIntent = false;
    // Delay close slightly to allow moving from trigger to panel
    setTimeout(() => {
      if (!hoverIntent) {
        hovering = false;
      }
    }, 150);
  }

  function handlePanelMouseEnter(): void {
    hoverIntent = true;
  }

  function handlePanelMouseLeave(): void {
    hoverIntent = false;
    setTimeout(() => {
      if (!hoverIntent) {
        hovering = false;
      }
    }, 150);
  }
</script>

<span class="caution-root">
  <button
    bind:this={triggerEl}
    type="button"
    class="caution-trigger"
    aria-expanded={open}
    aria-label={m.ticket_email_inbound_caution_label()}
    onclick={toggle}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    data-testid="email-inbound-caution-trigger"
  >
    <svg
      class="caution-icon"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
      <line
        x1="8"
        y1="4"
        x2="8"
        y2="9"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
    </svg>
  </button>
  {#if open}
    <span
      bind:this={panelEl}
      class="caution-panel"
      class:caution-panel-above={flipUp}
      role="status"
      data-testid="email-inbound-caution-panel"
      onmouseenter={handlePanelMouseEnter}
      onmouseleave={handlePanelMouseLeave}
    >
      {m.ticket_email_inbound_caution()}
    </span>
  {/if}
</span>

<style>
  .caution-root {
    display: inline-flex;
    align-items: flex-start;
    position: relative;
    margin-top: 0.375em;
  }

  .caution-trigger {
    appearance: none;
    border: none;
    background: none;
    padding: 4px;
    cursor: pointer;
    color: var(--muted);
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .caution-trigger:hover,
  .caution-trigger:focus-visible {
    color: var(--ink-2);
    outline: 2px solid var(--brand-text, currentColor);
    outline-offset: 2px;
  }

  .caution-icon {
    flex-shrink: 0;
  }

  .caution-panel {
    display: block;
    position: absolute;
    left: 0;
    top: 100%;
    z-index: 10;
    /* Shrink-to-fit for an absolute box resolves against the 44px
       trigger; max-content lets the text use the real max-width. */
    width: max-content;
    max-width: 280px;
    padding: 8px 12px;
    margin-top: 4px;
    font-size: 0.75rem;
    line-height: 1.5;
    color: var(--ink);
    background: var(--raised, var(--paper));
    border: 1px solid var(--hair);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .caution-panel-above {
    top: auto;
    bottom: 100%;
    margin-top: 0;
    margin-bottom: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    .caution-panel {
      transition: none;
    }
  }
</style>
