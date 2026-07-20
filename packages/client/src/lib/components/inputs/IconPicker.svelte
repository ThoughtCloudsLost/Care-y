<!--
  IconPicker: icon grid radiogroup for choosing an icon slug from a fixed set.

  Shared input component (one picker per data shape, not per context).
  Consumers pass their option set (saved-filter/queue generic icons, the
  note-type registry, or any {id, component} list) and an aria label; the
  selected ID is two-way bound. Extracted from the inline pickers in
  CreateSavedFilter and NoteTypesSection.
-->
<script lang="ts" generics="TId extends string">
  import type { Component } from "svelte";

  let {
    options,
    // eslint-disable-next-line @typescript-eslint/no-useless-default-assignment -- $bindable() required for two-way binding
    value = $bindable(),
    label,
    disabled = false,
  }: {
    options: readonly { readonly id: TId; readonly component: Component }[];
    value: TId;
    label: string;
    disabled?: boolean;
  } = $props();
</script>

<div class="icon-picker" role="radiogroup" aria-label={label}>
  {#each options as icon (icon.id)}
    <button
      type="button"
      class="icon-option"
      class:icon-option--selected={value === icon.id}
      role="radio"
      aria-checked={value === icon.id}
      aria-label={icon.id}
      {disabled}
      onclick={() => {
        if (disabled) return;
        value = icon.id;
      }}
    >
      <icon.component size={20} aria-hidden="true" />
    </button>
  {/each}
</div>

<style>
  .icon-picker {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.5rem;
  }

  .icon-option {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 8px;
    border: 1px solid var(--hair-2);
    background: transparent;
    color: var(--muted);
    cursor: pointer;
  }

  @media (prefers-reduced-motion: no-preference) {
    .icon-option {
      transition:
        background-color 150ms linear,
        color 150ms linear,
        border-color 150ms linear;
    }
  }

  .icon-option--selected {
    background-color: var(--ink);
    color: var(--paper);
    border-color: var(--ink);
  }

  .icon-option:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .icon-option:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: 2px;
  }
</style>
