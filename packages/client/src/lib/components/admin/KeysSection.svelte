<script lang="ts">
  import KeyStatus from "./KeyStatus.svelte";
  import KeyRotation from "./KeyRotation.svelte";
  import EscrowExport from "./EscrowExport.svelte";

  let keyRotationRef = $state<ReturnType<typeof KeyRotation> | null>(null);
  let escrowExportRef = $state<ReturnType<typeof EscrowExport> | null>(null);

  function handleRotate(): void {
    keyRotationRef?.open();
  }

  function handleExport(): void {
    escrowExportRef?.open();
  }
</script>

<div class="keys-section">
  <KeyStatus onrotate={handleRotate} onexport={handleExport} />
</div>

<KeyRotation bind:this={keyRotationRef} />
<EscrowExport bind:this={escrowExportRef} />

<style>
  .keys-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: 0.25rem var(--page-pad-x) 0;
  }
</style>
