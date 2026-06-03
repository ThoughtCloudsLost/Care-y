<script lang="ts">
  import { ListInput } from "konsta/svelte";
  import { Eye, EyeOff } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface PasswordInputProps {
    readonly value?: string;
    readonly label: string;
    readonly placeholder?: string;
    readonly info?: string;
    readonly error?: string;
    readonly disabled?: boolean;
    readonly outline?: boolean;
    readonly required?: boolean;
    readonly autocomplete?: string;
  }

  let {
    value = $bindable(""),
    label,
    placeholder,
    info,
    error,
    disabled = false,
    outline,
    required,
    autocomplete,
  }: PasswordInputProps = $props();

  let visible = $state(false);
</script>

<ListInput
  class="password-input-li"
  inputClass="password-input-padded"
  type={visible ? "text" : "password"}
  {label}
  bind:value
  {placeholder}
  {info}
  {error}
  {disabled}
  {outline}
  {required}
  {autocomplete}
>
  <button
    type="button"
    class="eye-toggle"
    onclick={() => (visible = !visible)}
    aria-label={visible ? m.password_hide() : m.password_show()}
    {disabled}
  >
    {#if visible}
      <EyeOff size={18} aria-hidden="true" />
    {:else}
      <Eye size={18} aria-hidden="true" />
    {/if}
  </button>
</ListInput>

<style>
  :global(.password-input-li) {
    position: relative !important;
  }

  :global(.password-input-padded) {
    padding-right: 2.75rem !important;
  }

  .eye-toggle {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    background: none;
    border: none;
    color: var(--muted);
    cursor: pointer;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }

  .eye-toggle:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
