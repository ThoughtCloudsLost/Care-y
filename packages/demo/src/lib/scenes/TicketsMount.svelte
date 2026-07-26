<!--
  Route-mount scene for the tickets feature.

  Renders the REAL +layout.svelte with either +page.svelte (list)
  or [id]/+page.svelte (detail) as its children, determined by
  the current page.params.id from the $app/state stub.

  The router drives page state via setDemoPage(); this component
  simply renders the right route tree for whatever state is active.
-->
<script lang="ts">
  import { page } from "$app/state";
  import TicketsLayout from "$routes/(app)/tickets/+layout.svelte";
  import TicketsListPage from "$routes/(app)/tickets/+page.svelte";
  import TicketDetailPage from "$routes/(app)/tickets/[id]/+page.svelte";

  const detailId = $derived(
    typeof page.params.id === "string" && page.params.id !== ""
      ? page.params.id
      : undefined,
  );
</script>

<TicketsLayout>
  {#if detailId != null}
    {#key detailId}
      <TicketDetailPage />
    {/key}
  {:else}
    <TicketsListPage />
  {/if}
</TicketsLayout>
