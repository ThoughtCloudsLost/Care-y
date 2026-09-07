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

  let open = $state(false);
  let hoverIntent = $state(false);
  let triggerEl = $state<HTMLButtonElement | null>(null);

  function toggle(): void {
    open = !open;
  }

  function dismiss(): void {
    open = false;
    hoverIntent = false;
    triggerEl?.focus();
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape" && open) {
      e.stopPropagation();
      dismiss();
    }
  }

  // SC 1.4.13 dismissable: Escape must close the panel without moving
  // pointer or focus. That covers hover-opened panels while focus sits
  // elsewhere, so the listener is window-level and exists only while open.
  $effect(() => {
    if (!open) return;
    return on(window, "keydown", handleKeydown);
  });

  function handleMouseEnter(): void {
    hoverIntent = true;
    open = true;
  }

  function handleMouseLeave(): void {
    hoverIntent = false;
    // Delay close slightly to allow moving from trigger to panel
    setTimeout(() => {
      if (!hoverIntent) {
        open = false;
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
        open = false;
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
      class="caution-panel"
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

  @media (prefers-reduced-motion: reduce) {
    .caution-panel {
      transition: none;
    }
  }
</style>
