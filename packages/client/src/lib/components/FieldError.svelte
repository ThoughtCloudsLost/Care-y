<script lang="ts">
  let { message }: { message?: string } = $props();
</script>

<!-- Styling comes from the shared .field-error primitive (shared.css):
     errors live in the danger slot, never brand. -->
{#if message}
  <p class="field-error" role="alert">{message}</p>
{/if}
