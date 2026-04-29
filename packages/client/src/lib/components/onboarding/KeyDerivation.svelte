<!--
  KeyDerivation: progress indicator for Argon2id + OPRF key derivation.

  Reused by both the login page and the first-login flow. Shows a
  Konsta Preloader with labeled phases so the user understands the
  multi-second process is doing security work, not stalling.
-->
<script lang="ts">
  import { Preloader } from "konsta/svelte";

  export type LoginPhaseId =
    | "idle"
    | "auth"
    | "argon2id"
    | "oprf"
    | "pow"
    | "derive"
    | "done"
    | "error";

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
    padding: 2rem 1rem;
  }

  .key-derivation-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .key-derivation-label {
    font-size: 0.875rem;
    color: var(--muted, #6b7280);
    text-align: center;
  }

  .key-derivation-error {
    font-size: 0.875rem;
    color: var(--error, #dc2626);
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
