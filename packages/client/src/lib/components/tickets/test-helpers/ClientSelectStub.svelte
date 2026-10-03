<!--
  Test-only stub for ClientSelect. Reports an existing client selection
  through onchange once on mount, so tests can drive the new ticket form
  past client validation without the search and phone lookup UI. Used by
  NewTicketForm tests to exercise the submit pipeline.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import type { ClientSelection } from "$lib/components/inputs/client-select-types.js";

  interface Props {
    onchange: (value: ClientSelection) => void;
    [key: string]: unknown;
  }

  let { onchange, ..._rest }: Props = $props();

  onMount(() => {
    onchange({
      mode: "existing",
      clientId: "client-1",
      displayAlias: "Blue Heron",
    });
  });
</script>

<div data-testid="client-select-stub"></div>
