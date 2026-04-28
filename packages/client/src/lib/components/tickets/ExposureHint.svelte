<script lang="ts">
  import ShellToast from "$lib/shell/ShellToast.svelte";
  import * as m from "$lib/paraglide/messages.js";

  type HintType = "sms" | "call";

  interface ExposureHintProps {
    type: HintType;
    opened: boolean;
    ondismiss: () => void;
  }

  let { type, opened, ondismiss }: ExposureHintProps = $props();

  function getMessage(hint: HintType): string {
    if (hint === "sms") return m.exposure_hint_sms();
    return m.exposure_hint_call();
  }
</script>

{#snippet dismissButton()}
  <button
    type="button"
    class="exposure-dismiss"
    data-testid="exposure-dismiss"
    onclick={ondismiss}
  >
    {m.exposure_hint_dismiss()}
  </button>
{/snippet}

{#if opened}
  <ShellToast opened={true} position="center" button={dismissButton}>
    <div class="exposure-content" role="status" aria-live="polite">
      {getMessage(type)}
    </div>
  </ShellToast>
{/if}

<style>
  .exposure-content {
    font-size: 0.875rem;
    text-align: center;
    padding: 0.25rem 0;
  }

  .exposure-dismiss {
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
