<script lang="ts">
  import KeyStatus from "./KeyStatus.svelte";
  import KeyRotation from "./KeyRotation.svelte";

  let keyRotationRef = $state<ReturnType<typeof KeyRotation> | null>(null);

  function handleRotate(): void {
    keyRotationRef?.open();
  }
</script>

<div class="keys-section">
  <KeyStatus onrotate={handleRotate} />
</div>

<KeyRotation bind:this={keyRotationRef} />

<style>
  .keys-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: 0.25rem var(--page-pad-x) 0;
  }
</style>
