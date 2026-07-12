<!--
  The create-password group: password + confirmation + strength meter,
  with the mismatch check owned here. Every surface that asks a user to
  set a password renders this pair (one component per data type); the
  consumer keeps its own i18n strings and submit gating.
-->
<script lang="ts">
  import { List, Block } from "konsta/svelte";
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
    autocomplete?: string;
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

{#if password.length > 0}
  <Block>
    <PasswordStrengthMeter {password} {minLength} />
  </Block>
{/if}
