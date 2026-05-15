<!--
  KeyDerivation: progress indicator for Argon2id + OPRF key derivation.

  Reused by both the login page and the first-login flow. Shows a
  Konsta Preloader with labeled phases so the user understands the
  multi-second process is doing security work, not stalling.
-->
<script lang="ts" module>
  export type { LoginPhaseId } from "./login-phase.js";
</script>

<script lang="ts">
  import { Preloader } from "konsta/svelte";
  import type { LoginPhaseId } from "./login-phase.js";

  interface Props {
    phase: LoginPhaseId;
    phaseLabel: string;
    error?: string | null;
  }

  let { phase, phaseLabel, error = null }: Props = $props();

  const isActive = $derived(
    phase !== "idle" && phase !== "done" && phase !== "error",
  );
</script>

{#if isActive || phase === "error"}
  <div
    class="key-derivation"
    role="progressbar"
    aria-label={phaseLabel}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuetext={phaseLabel}
  >
    <div aria-live="polite" class="key-derivation-content">
      {#if phase === "error"}
        <p class="key-derivation-error">{error}</p>
      {:else}
        <Preloader class="key-derivation-spinner" />
        <p class="key-derivation-label">{phaseLabel}</p>
      {/if}
    </div>
  </div>
{/if}

<style>
  .key-derivation {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-2xl) var(--page-pad-x);
  }

  .key-derivation-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-lg);
  }

  .key-derivation-label {
    font-size: var(--text-base);
    color: var(--muted);
    text-align: center;
  }

  .key-derivation-error {
    font-size: var(--text-base);
    color: var(--error);
    text-align: center;
  }

  .key-derivation :global(.key-derivation-spinner) {
    width: 2rem;
    height: 2rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .key-derivation :global(.key-derivation-spinner) {
      animation: none;
    }
  }
</style>
