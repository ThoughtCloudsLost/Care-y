<!--
  A native select whose options can carry arbitrary markup: an icon, a
  colour mark, a count, a badge, secondary detail.

  Progressive enhancement over a real <select>. Browsers that support
  `appearance: base-select` render the extra content; everything else
  falls back to the plain native control with text-only options. Nothing
  is reimplemented, so keyboard navigation, screen reader semantics,
  form submission and change events keep working everywhere, and an
  older device degrades to exactly the select it renders today.

  The option's own label is always rendered as text and cannot be
  replaced by a caller. That text is three things at once: what a
  non-supporting browser shows, the option's accessible name, and the
  value the select reports (the platform reads back trimmed
  textContent). Letting a snippet own the whole option would break all
  three silently, so leading and trailing content may only add to it.

  Keep snippet content decorative and non-interactive: <selectedcontent>
  clones it into the closed button, and anything interactive stops
  working once cloned.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { List, ListInput } from "konsta/svelte";
  import type { RichSelectOption } from "./rich-select.js";

  interface Props {
    /** Field label shown above the control. */
    label: string;
    /** Currently selected value. Empty string selects the placeholder. */
    value: string;
    options: readonly RichSelectOption[];
    onchange: (value: string) => void;
    /** Rendered before the option label, and cloned into the closed button. */
    leading?: Snippet<[RichSelectOption]>;
    /** Rendered after the option label, for counts, badges or detail. */
    trailing?: Snippet<[RichSelectOption]>;
    /** Shown as a disabled first option when no value is selected yet. */
    placeholder?: string;
    disabled?: boolean;
    /** Validation message, forwarded to the underlying input. */
    error?: string;
    /** Extra class for the wrapping List, for surface-specific spacing. */
    listClass?: string;
  }

  let {
    label,
    value,
    options,
    onchange,
    leading,
    trailing,
    placeholder,
    disabled = false,
    error,
    listClass,
  }: Props = $props();

  function handleChange(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLSelectElement) onchange(target.value);
  }
</script>

<List nested class={listClass}>
  <ListInput
    dropdown
    type="select"
    {label}
    {value}
    {disabled}
    {error}
    onChange={handleChange}
  >
    <button type="button">
      <selectedcontent></selectedcontent>
    </button>
    {#if placeholder !== undefined}
      <option value="" disabled>{placeholder}</option>
    {/if}
    {#each options as option (option.value)}
      <option value={option.value}>
        {#if leading}
          <span class="rich-select-mark" aria-hidden="true"
            >{@render leading(option)}</span
          >
        {/if}
        <span class="rich-select-label">{option.label}</span>
        {#if trailing}
          <span class="rich-select-trailing" aria-hidden="true"
            >{@render trailing(option)}</span
          >
        {/if}
      </option>
    {/each}
  </ListInput>
</List>

<style>
  /*
    Only browsers that opt in to base-select lay this out. Everywhere
    else the option collapses to its text content, which is the same
    plain select as before, so there is nothing to undo.
  */
  @supports (appearance: base-select) {
    .rich-select-mark {
      display: inline-flex;
      align-items: center;
      flex: none;
      margin-inline-end: 0.5rem;
    }

    .rich-select-label {
      display: inline-flex;
      align-items: center;
      min-width: 0;
    }

    .rich-select-trailing {
      display: inline-flex;
      align-items: center;
      flex: none;
      margin-inline-start: auto;
      padding-inline-start: 0.5rem;
    }
  }
</style>
