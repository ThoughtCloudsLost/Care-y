<!--
  Post-submission contextual hint. Mirrors ExposureHint structurally:
  ShellToast, role="status", aria-live="polite", dismiss button.
  Shown once per session after successful intake submission.
-->
<script lang="ts">
  import ShellToast from "$lib/shell/ShellToast.svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface IntakeSubmitHintProps {
    opened: boolean;
    ondismiss: () => void;
  }

  let { opened, ondismiss }: IntakeSubmitHintProps = $props();
</script>

{#snippet dismissButton()}
  <button
    type="button"
    class="hint-dismiss"
    data-testid="intake-hint-dismiss"
    onclick={ondismiss}
  >
    {m.intake_hint_dismiss()}
  </button>
{/snippet}

{#if opened}
  <ShellToast opened position="center" button={dismissButton}>
    <div class="hint-content" role="status" aria-live="polite">
      {m.intake_submit_hint()}
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
