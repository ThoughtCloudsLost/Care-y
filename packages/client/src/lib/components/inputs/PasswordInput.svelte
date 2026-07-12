<!--
  The field renders through ListInput's input snippet instead of Konsta's
  own input so the eye toggle can live INSIDE the inputWrap div (which
  Konsta keeps position: relative): top 50% there is the true center of
  the box, regardless of label height or an info/error line below. The
  class string mirrors what konsta@5.0.9 puts on its own iOS input; under
  the default theme the Inkwell skin draws the visible box either way.
-->
<script lang="ts">
  import { ListInput } from "konsta/svelte";
  import { Eye, EyeOff } from "@lucide/svelte";
  import type { FullAutoFill } from "svelte/elements";
  import * as m from "$lib/paraglide/messages.js";

  interface PasswordInputProps {
    readonly value?: string;
    readonly label: string;
    readonly placeholder?: string;
    readonly info?: string;
    readonly error?: string;
    readonly disabled?: boolean;
    readonly required?: boolean;
    readonly autocomplete?: FullAutoFill;
  }

  let {
    value = $bindable(""),
    label,
    placeholder,
    info,
    error,
    disabled = false,
    required,
    autocomplete,
  }: PasswordInputProps = $props();

  let visible = $state(false);
</script>

<ListInput {label} {info} {error}>
  {#snippet input()}
    <!-- bind:value is a compile error on inputs with a dynamic type
         attribute, hence the manual value/oninput pair. -->
    <input
      class="pw-field block text-base appearance-none w-full focus:outline-none bg-transparent h-10 placeholder-black/30 dark:placeholder-white/30"
      type={visible ? "text" : "password"}
      {value}
      oninput={(e) => {
        value = e.currentTarget.value;
      }}
      {placeholder}
      {disabled}
      {required}
      {autocomplete}
      aria-label={label}
    />
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
  {/snippet}
</ListInput>

<style>
  /* Keeps typed text clear of the toggle; !important outbids the theme
     skin's padding shorthand on .k-list-input input. */
  .pw-field {
    padding-inline-end: 2.75rem !important;
  }

  .eye-toggle {
    position: absolute;
    inset-inline-end: 2px;
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
