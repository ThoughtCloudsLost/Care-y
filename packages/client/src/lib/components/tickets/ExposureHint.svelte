<script lang="ts">
  import ShellToast from "$lib/shell/ShellToast.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { Button } from "konsta/svelte";

  type HintType = "sms" | "call";

  const AUTO_DISMISS_MS = 6_000;

  interface ExposureHintProps {
    type: HintType;
    opened: boolean;
    ondismiss: () => void;
  }

  let { type, opened, ondismiss }: ExposureHintProps = $props();

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function getMessage(hint: HintType): string {
    if (hint === "sms") return m.exposure_hint_sms();
    return m.exposure_hint_call();
  }

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
  <div class:no-transition={reducedMotion}>
    <ShellToast opened position="center">
      {#snippet button()}
        <Button
          clear
          small
          inline
          onclick={ondismiss}
          class="hint-ok-btn"
          data-testid="exposure-hint-ok"
        >
          {m.exposure_hint_dismiss()}
        </Button>
      {/snippet}
      <div class="exposure-content" role="status" aria-live="polite">
        {getMessage(type)}
      </div>
    </ShellToast>
  </div>
{/if}

<style>
  .no-transition :global(.k-toast) {
    transition: none !important;
    animation: none !important;
  }

  .exposure-content {
    font-size: 0.875rem;
    text-align: center;
    padding: 0.25rem 0;
  }

  :global(.hint-ok-btn) {
    min-width: 44px;
    min-height: 44px;
  }
</style>
