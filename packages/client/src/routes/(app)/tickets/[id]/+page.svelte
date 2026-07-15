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
  import TicketDetailOrchestrator from "$lib/components/tickets/TicketDetailOrchestrator.svelte";

  const ticketId = $derived(page.params.id ?? "");
  const fullView = $derived(page.url.searchParams.get("full") === "1");

  // Deep link redirect: at desktop without ?full=1, navigate to /tickets
  // then set ticketId in page state so the layout shows the split view.
  $effect(() => {
    if (layoutMode.isDesktop && ticketId && !fullView) {
      void goto(resolve("/tickets"), { replaceState: true }).then(() => {
        pushState("", { ticketId });
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
