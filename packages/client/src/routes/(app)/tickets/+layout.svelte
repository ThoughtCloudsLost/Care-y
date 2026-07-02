<!--
  Tickets layout: mobile passthrough, desktop split view.

  At mobile width: renders children normally (full-page navigation).
  At desktop width: renders two-pane split (left: list, right: detail
  or placeholder). Uses shallow routing via pushState with
  page.state.ticketId to control the right pane.

  The SplitDetailPane wrapper handles inert context shadowing so the
  orchestrator's $effect blocks write to containers nobody reads.
  AppShell's real navbar/tabbar stay untouched.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { pushState, replaceState } from "$app/navigation";
  import { ClipboardList } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { layoutMode } from "$lib/stores/layout-mode.svelte.js";
  import {
    getScrollContainer,
    setScrollContainer,
  } from "$lib/shell/context.js";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import SplitDetailPane from "./SplitDetailPane.svelte";
  import { setTicketsLayoutCtx } from "./tickets-layout-ctx.js";

  let { children }: { children: Snippet } = $props();

  const selectedTicketId = $derived(
    typeof page.state.ticketId === "string" ? page.state.ticketId : undefined,
  );

  // Only show split view on the list route, not when a detail route
  // is rendered full-page (e.g., /tickets/[id]?full=1).
  const isOnDetailRoute = $derived(page.params.id != null);
  const isSplitView = $derived(layoutMode.isDesktop && !isOnDetailRoute);

  // ── Left pane scroll container shadow ──
  // Must be set at init time (createContext wraps setContext).
  // The getter dynamically returns the left pane when in split view,
  // or falls back to AppShell's <main> scroll container.
  let leftPaneEl = $state<HTMLElement | undefined>();
  const parentGetScroll = getScrollContainer();

  setScrollContainer(() =>
    isSplitView && leftPaneEl ? leftPaneEl : parentGetScroll(),
  );

  // ── Navigation callback ──
  function openTicket(ticketId: string): void {
    if (layoutMode.isDesktop) {
      pushState("", { ticketId });
    } else {
      void goto(resolve(`/tickets/${ticketId}`));
    }
  }

  function closeDetail(): void {
    replaceState("", {});
  }

  function expandDetail(): void {
    if (selectedTicketId != null && selectedTicketId !== "") {
      void goto(resolve(`/tickets/${selectedTicketId}?full=1`));
    }
  }

  setTicketsLayoutCtx({
    openTicket,
    selectedTicketId: () => selectedTicketId,
  });

  // Desktop→mobile: if a detail is open in split view and the viewport
  // shrinks below 1024px, navigate to the full-page detail route so
  // the user doesn't lose the ticket they were viewing.
  $effect(() => {
    if (!layoutMode.isDesktop && selectedTicketId != null) {
      replaceState("", {});
      void goto(resolve(`/tickets/${selectedTicketId}`));
    }
  });
</script>

{#if isSplitView}
  <div class="split-view-container">
    <div class="split-list-pane" bind:this={leftPaneEl}>
      {@render children()}
    </div>

    <div
      class="split-divider"
      role="separator"
      aria-orientation="vertical"
    ></div>

    <div class="split-detail-pane">
      {#if selectedTicketId}
        {#key selectedTicketId}
          <SplitDetailPane
            ticketId={selectedTicketId}
            onclose={closeDetail}
            onexpand={expandDetail}
          />
        {/key}
      {:else}
        <div class="split-placeholder">
          <EmptyState
            icon={ClipboardList}
            message={m.tickets_select_prompt()}
          />
        </div>
      {/if}
    </div>
  </div>
{:else}
  {@render children()}
{/if}

<style>
  /* Override the content-max-width constraint from shared.css.
     .main-content > * sets max-width: 720px, but the split view
     needs the full width between sidebar and viewport edge. */
  :global(.main-content) > .split-view-container {
    max-width: none;
    margin-inline: 0;
    padding-inline: 0;
  }

  /* Pull split view up into the subnavbar area so scrolling content
     passes behind the glass-blur subnavbar (same as mobile behavior).
     Each pane gets padding-top so initial content starts below it. */
  :global(.main-content.has-subnavbar) > .split-view-container {
    margin-top: calc(-1 * var(--subnavbar-h, 0px));
  }

  .split-view-container {
    display: flex;
    height: calc(100% + var(--subnavbar-h, 0px));
    min-height: 0;
    overflow: hidden;
    width: 100%;
  }

  .split-list-pane {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding-top: var(--subnavbar-h, 0px);
  }

  .split-divider {
    width: 1px;
    flex-shrink: 0;
    background: var(--divider);
  }

  .split-detail-pane {
    width: var(--split-detail-width, 480px);
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    padding-top: var(--subnavbar-h, 0px);
  }

  .split-placeholder {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
