<!--
  The create-password group: password + confirmation + strength meter,
  with the mismatch check owned here. Every surface that asks a user to
  set a password renders this pair (one component per data type); the
  consumer keeps its own i18n strings and submit gating. The meter is
  always present (resting empty until typing starts) so the form never
  reflows mid-entry.
-->
<script lang="ts">
  import { List } from "konsta/svelte";
  import type { FullAutoFill } from "svelte/elements";
  import PasswordInput from "./PasswordInput.svelte";
  import PasswordStrengthMeter from "./PasswordStrengthMeter.svelte";

  interface PasswordConfirmPairProps {
    password?: string;
    confirm?: string;
    passwordLabel: string;
    confirmLabel: string;
    /** Shown as the confirm field's error while the values differ. */
    mismatchError: string;
    passwordPlaceholder?: string;
    confirmPlaceholder?: string;
    /** Help under the password field (hidden while passwordError shows). */
    passwordInfo?: string;
    /** Consumer-driven error on the password field (length rules etc.). */
    passwordError?: string;
    /** Strength meter minimum; defaults to the meter's own minimum. */
    minLength?: number;
    autocomplete?: FullAutoFill;
    required?: boolean;
    disabled?: boolean;
  }

  let {
    password = $bindable(""),
    confirm = $bindable(""),
    passwordLabel,
    confirmLabel,
    mismatchError,
    passwordPlaceholder,
    confirmPlaceholder,
    passwordInfo,
    passwordError,
    minLength,
    autocomplete,
    required,
    disabled = false,
  }: PasswordConfirmPairProps = $props();

  const mismatch = $derived(confirm.length > 0 && password !== confirm);
</script>

<div class="password-pair">
  <List nested>
    <PasswordInput
      label={passwordLabel}
      placeholder={passwordPlaceholder}
      info={passwordInfo}
      error={passwordError}
      bind:value={password}
      {autocomplete}
      {required}
      {disabled}
    />
    <PasswordInput
      label={confirmLabel}
      placeholder={confirmPlaceholder}
      bind:value={confirm}
      error={mismatch ? mismatchError : undefined}
      {autocomplete}
      {required}
      {disabled}
    />
  </List>
  <div class="meter-row">
    <PasswordStrengthMeter {password} {minLength} />
  </div>
</div>

<style>
  /* One flex column owning the internal rhythm, so consumers treat the
     pair as a single block; the gap matches the field rhythm the theme
     skin sets between list items. */
  .password-pair {
    display: flex;
    flex-direction: column;
    gap: var(--space-md, 1rem);
  }

  /* Matches the x-inset Konsta gives the field boxes inside a list. */
  .meter-row {
    padding-inline: 1rem;
  }
</style>
