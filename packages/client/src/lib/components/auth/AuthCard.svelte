<!--
  Centered sign-in card.

  The frame every credential form sits in: a single column capped at a
  comfortable measure, centered in whatever space its parent gives it.

  Auto block margins do the centering rather than justify-content, because
  justify-content: center clips the top of content taller than the
  container. Auto margins center it when it fits and keep the top
  reachable when it does not, so the scroll container above can still
  reach the first field on a short viewport.
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  interface AuthCardProps {
    children: Snippet;
  }

  let { children }: AuthCardProps = $props();
</script>

<div class="auth-card" data-testid="auth-card">
  <div class="auth-card-inner">
    {@render children()}
  </div>
</div>

<style>
  .auth-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* Fills the scroll column so the card centers against the viewport
       rather than hugging the navbar. */
    flex: 1;
    min-height: 0;
    padding: var(--space-md);
  }

  .auth-card-inner {
    width: 100%;
    max-width: 24rem;
    margin-block: auto;
  }
</style>
