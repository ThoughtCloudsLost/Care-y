<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
</script>

<div class="decrypt-error" role="alert">
  <p>{m.error_decryption_failed()}</p>
</div>

<style>
  /* Recessed tinted block; the thick left border is a banned accent. */
  .decrypt-error {
    padding: 0.75rem 1rem;
    background: var(--paper-deep, var(--surface-2));
    border-radius: 10px;
    color: var(--muted);
    font-style: italic;
  }
</style>
