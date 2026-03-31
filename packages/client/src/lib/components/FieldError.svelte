<script lang="ts">
  let { message }: { message?: string } = $props();
</script>

{#if message}
  <p class="field-error" role="alert">{message}</p>
{/if}

<style>
  .field-error {
    color: var(--brand-primary);
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
</style>
