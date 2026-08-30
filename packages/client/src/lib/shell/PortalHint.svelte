<!--
  Shared contextual hint toast for client portal surfaces (intake submit,
  web chat, share view). ShellToast, role="status", aria-live="polite".
  Auto-dismisses after 6 seconds. Each surface passes its own message
  and testid; trigger and session scoping stay with the caller.
-->
<script lang="ts">
  import ShellToast from "$lib/shell/ShellToast.svelte";

  const AUTO_DISMISS_MS = 6_000;

  interface PortalHintProps {
    opened: boolean;
    ondismiss: () => void;
    message: string;
  }

  let { opened, ondismiss, message }: PortalHintProps = $props();

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  $effect(() => {
    if (!opened) return;

    const timer = setTimeout(() => {
      ondismiss();
    }, AUTO_DISMISS_MS);

    return () => {
      clearTimeout(timer);
    };
  });
</script>

{#if opened}
  <div class="portal-hint-anchor" class:no-transition={reducedMotion}>
    <ShellToast opened position="center">
      <div class="hint-content" role="status" aria-live="polite">
        {message}
      </div>
    </ShellToast>
  </div>
{/if}

<style>
  /* Konsta pins toasts to the viewport bottom, which is where these
     surfaces pin their composer. Lift it clear. */
  .portal-hint-anchor :global(.k-toast) {
    bottom: calc(var(--k-safe-area-bottom, 0px) + 6.5rem);
  }

  .no-transition :global(.k-toast) {
    transition: none !important;
    animation: none !important;
  }

  .hint-content {
    font-size: 0.875rem;
    text-align: center;
    padding: 0.25rem 0;
  }
</style>
