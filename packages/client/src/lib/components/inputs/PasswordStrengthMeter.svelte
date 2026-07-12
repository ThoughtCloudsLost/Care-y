<script lang="ts">
  import { PASSWORD_MIN_LENGTH } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import Register from "$lib/components/Register.svelte";
  import {
    assessPassphraseStrength,
    looksLikeCommonPattern,
    type PassphraseStrength,
  } from "$lib/utils/passphrase-strength.js";

  interface PasswordStrengthMeterProps {
    readonly password: string;
    readonly minLength?: number;
    readonly showCommonWarning?: boolean;
  }

  let {
    password,
    minLength = PASSWORD_MIN_LENGTH,
    showCommonWarning = true,
  }: PasswordStrengthMeterProps = $props();

  const strength = $derived<PassphraseStrength>(
    assessPassphraseStrength(password, minLength),
  );

  const isCommon = $derived(
    showCommonWarning &&
      password.length >= minLength &&
      looksLikeCommonPattern(password),
  );

  interface StrengthDisplay {
    label: string;
    color: string;
    width: string;
  }

  function getStrengthDisplay(s: PassphraseStrength): StrengthDisplay {
    switch (s) {
      case "too-short":
        return {
          label: m.password_strength_too_short({ min: minLength }),
          color: "var(--color-red-500)",
          width: "25%",
        };
      case "acceptable":
        return {
          label: m.password_strength_acceptable(),
          color: "var(--color-amber-500)",
          width: "50%",
        };
      case "good":
        return {
          label: m.password_strength_good(),
          color: "var(--color-green-500)",
          width: "75%",
        };
      case "strong":
        return {
          label: m.password_strength_strong(),
          color: "var(--color-green-500)",
          width: "100%",
        };
    }
  }

  const display = $derived(getStrengthDisplay(strength));
</script>

{#if password.length > 0}
  <div class="strength-meter">
    <div class="strength-track">
      <div
        class="strength-fill"
        style="width: {display.width}; background: {display.color}"
      ></div>
    </div>
    <span class="strength-label" style="color: {display.color}">
      {display.label}
    </span>
  </div>

  {#if isCommon}
    <Register kind="careful" role="alert">
      {m.password_common_pattern()}
    </Register>
  {/if}
{/if}

<style>
  .strength-meter {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .strength-track {
    height: 4px;
    border-radius: 2px;
    background: color-mix(in srgb, var(--muted) 20%, transparent);
    overflow: hidden;
  }

  .strength-fill {
    height: 100%;
    border-radius: 2px;
  }

  @media (prefers-reduced-motion: no-preference) {
    .strength-fill {
      transition:
        width 0.2s ease,
        background 0.2s ease;
    }
  }

  .strength-label {
    font-size: var(--text-xs);
    font-weight: 500;
  }
</style>
