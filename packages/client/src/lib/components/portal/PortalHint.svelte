<!--
  Shared contextual hint toast for client portal surfaces (intake submit,
  web chat, share view). ShellToast, role="status", aria-live="polite",
  dismiss button. Each surface passes its own message, dismiss label, and
  testid; trigger and session scoping stay with the caller.
-->
<script lang="ts">
  import ShellToast from "$lib/shell/ShellToast.svelte";

  interface PortalHintProps {
    opened: boolean;
    ondismiss: () => void;
    message: string;
    dismissLabel: string;
    dismissTestid: string;
  }

  let {
    opened,
    ondismiss,
    message,
    dismissLabel,
    dismissTestid,
  }: PortalHintProps = $props();
</script>

{#snippet dismissButton()}
  <button
    type="button"
    class="hint-dismiss"
    data-testid={dismissTestid}
    onclick={ondismiss}
  >
    {dismissLabel}
  </button>
{/snippet}

{#if opened}
  <ShellToast opened position="center" button={dismissButton}>
    <div class="hint-content" role="status" aria-live="polite">
      {message}
    </div>
  </ShellToast>
{/if}

<style>
  .hint-content {
    font-size: 0.875rem;
    text-align: center;
    padding: 0.25rem 0;
  }

  .hint-dismiss {
    background: none;
    border: none;
    color: var(--brand-text);
    font-weight: 600;
    font-size: 0.875rem;
    font-family: inherit;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    -webkit-tap-highlight-color: transparent;
  }
</style>
