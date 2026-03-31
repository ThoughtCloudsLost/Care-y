<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
</script>

<div class="decrypt-error" role="alert">
  <p>{m.error_decryption_failed()}</p>
</div>

<style>
  .decrypt-error {
    padding: 0.75rem 1rem;
    background: var(--surface-2);
    border-left: 3px solid var(--muted);
    color: var(--muted);
    font-style: italic;
  }
</style>
