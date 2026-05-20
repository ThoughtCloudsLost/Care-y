<!--
  EscrowExport: admin popup for escrow file export.
  Wraps the shared EscrowFlow in a ShellPopup overlay.
-->
<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import ShellPopup from "$lib/shell/ShellPopup.svelte";
  import EscrowFlow from "$lib/components/shared/EscrowFlow.svelte";

  let opened = $state(false);
  let flowRef = $state<EscrowFlow>();

  export function open(): void {
    opened = true;
  }

  function dismiss(): void {
    opened = false;
    flowRef?.reset();
  }
</script>

<ShellPopup {opened} ondismiss={dismiss} title={m.admin_escrow_title()}>
  <EscrowFlow
    bind:this={flowRef}
    oncomplete={dismiss}
    completeLabel={m.admin_escrow_done()}
  />
</ShellPopup>
