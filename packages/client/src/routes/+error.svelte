<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import * as m from "$lib/paraglide/messages.js";

  const is404 = $derived(page.status === 404);
  const message = $derived(
    is404
      ? m.error_page_not_found()
      : (page.error?.message ?? m.error_generic()),
  );
</script>

<div role="alert" class="error-page">
  <h1 class="error-status">{page.status}</h1>
  <p class="error-message">{message}</p>
  <a href={resolve("/")} class="error-home touch-feedback"
    >{m.error_go_home()}</a
  >
</div>

<style>
  .error-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    text-align: center;
    min-height: 40dvh;
  }

  /* Empty-room voice: the display face in full ink. The status code is
     a fact, not an identity mark, so brand stays out of it. */
  .error-status {
    font-size: 3rem;
    font-weight: 600;
    font-family: var(--theme-font-display, inherit);
    font-optical-sizing: auto;
    color: var(--ink);
    margin: 0 0 0.5rem;
  }

  .error-message {
    font-size: 1rem;
    color: var(--muted);
    margin: 0 0 1.5rem;
  }

  .error-home {
    display: inline-flex;
    align-items: center;
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    background: var(--brand-fill, var(--brand-primary));
    color: var(--brand-on);
    font-weight: 500;
    text-decoration: none;
  }
</style>
