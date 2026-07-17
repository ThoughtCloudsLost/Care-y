<!--
  ColorPicker: swatch radiogroup for choosing a color token from a fixed set.

  Shared input component (one picker per data shape, not per context).
  Consumers pass their option set and an aria label; the selected ID is
  two-way bound. Extracted from the inline picker in CreateSavedFilter.
-->
<script lang="ts" generics="TId extends string">
  let {
    options,
    // eslint-disable-next-line @typescript-eslint/no-useless-default-assignment -- $bindable() required for two-way binding
    value = $bindable(),
    label,
    disabled = false,
  }: {
    options: readonly { readonly id: TId; readonly hex: string }[];
    value: TId;
    label: string;
    disabled?: boolean;
  } = $props();
</script>

<div class="color-picker" role="radiogroup" aria-label={label}>
  {#each options as color (color.id)}
    <button
      type="button"
      class="color-swatch"
      class:color-swatch--selected={value === color.id}
      style="--swatch-color: {color.hex}"
      role="radio"
      aria-checked={value === color.id}
      aria-label={color.id}
      {disabled}
      onclick={() => {
        value = color.id;
      }}
    >
      {#if value === color.id}
        <span class="swatch-check" aria-hidden="true">&#10003;</span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .color-picker {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .color-swatch {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid transparent;
    background-color: var(--swatch-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  @media (prefers-reduced-motion: no-preference) {
    .color-swatch {
      transition: border-color 150ms linear;
    }
  }

  .color-swatch--selected {
    border-color: var(--ink);
  }

  .color-swatch:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .color-swatch:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: 2px;
  }

  .swatch-check {
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
</style>
