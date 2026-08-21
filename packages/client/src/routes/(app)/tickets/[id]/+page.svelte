<!--
  Ticket detail route: thin wrapper around TicketDetailOrchestrator.

  Resolves ticketId from route params and provides the back-navigation
  callback. All orchestration logic lives in the shared component,
  enabling reuse in both full-page (mobile) and split-view (desktop).

  Deep link at desktop: if the URL is /tickets/[id] and the viewport
  is desktop width (without ?full=1), navigate to /tickets then set
  page.state.ticketId so the layout's split view renders both panes.
  The ?full=1 param skips the redirect for intentional full-page viewing.
-->
<script lang="ts">
  import { page } from "$app/state";
  import { goto, pushState } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { shellBack } from "$lib/shell/navigation.js";
  import { layoutMode } from "$lib/stores/layout-mode.svelte.js";
  import {
    beginSplitHandoff,
    endSplitHandoff,
    isSplitHandoffCurrent,
  } from "$lib/stores/split-handoff.svelte.js";
  import TicketDetailOrchestrator from "$lib/components/tickets/TicketDetailOrchestrator.svelte";

  const ticketId = $derived(page.params.id ?? "");
  const fullView = $derived(page.url.searchParams.get("full") === "1");

  // Deep link redirect: at desktop without ?full=1, navigate to /tickets
  // then set ticketId in page state so the layout shows the split view.
  // The id is snapshotted before the goto: once navigation completes,
  // page.params.id is gone and the derived reads "", so pushing the
  // derived from inside .then() would open an empty pane.
  //
  // The handoff spans the two steps. Neither the route param nor the
  // page state holds the id while the goto is in flight, so without it
  // the split view shows its empty placeholder for those frames.
  //
  // A navigation that lands during the goto (a tab tap, the demo story
  // asking for the bare list) ends the handoff, and the token check is
  // how this half of the redirect finds out. Pushing the state anyway
  // would re-open the ticket the visitor just navigated away from.
  $effect(() => {
    const id = ticketId;
    if (layoutMode.isDesktop && id && !fullView) {
      const token = beginSplitHandoff("tickets", id);
      void goto(resolve("/tickets"), { replaceState: true }).then(() => {
        if (!isSplitHandoffCurrent("tickets", token)) return;
        pushState("", { ticketId: id });
        endSplitHandoff("tickets");
      });
    }
  });

  function goBack(): void {
    shellBack("/tickets");
  }
</script>

{#if !layoutMode.isDesktop || fullView}
  <TicketDetailOrchestrator
    {ticketId}
    onback={goBack}
    desktopFull={fullView && layoutMode.isDesktop}
  />
{/if}
