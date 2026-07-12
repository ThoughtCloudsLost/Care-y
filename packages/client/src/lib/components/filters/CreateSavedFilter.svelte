<script lang="ts">
  import { List, ListInput } from "konsta/svelte";
  import { Save } from "@lucide/svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import {
    SAVED_FILTER_COLORS,
    SAVED_FILTER_ICONS,
  } from "./saved-filter-constants.js";
  import type { SavedFilterColor } from "@care-y/shared";

  interface Props {
    opened: boolean;
    filterSummary: string;
    ondismiss: () => void;
    onsave: (meta: {
      encryptedName: string;
      color: SavedFilterColor;
      icon: string;
    }) => void;
  }

  let { opened, filterSummary, ondismiss, onsave }: Props = $props();

  const orgKeyManager = getOrgKeyManager();

  let name = $state("");
  let selectedColor = $state<SavedFilterColor>("blue");
  let selectedIcon = $state("tag");

  const canSave = $derived(name.trim().length > 0);

  async function handleSave(): Promise<void> {
    if (!canSave) return;

    const encryptedName = await orgKeyManager.encryptText(name.trim());

    onsave({
      encryptedName,
      color: selectedColor,
      icon: selectedIcon,
    });

    name = "";
    selectedColor = "blue";
    selectedIcon = "tag";
    ondismiss();
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  title={m.saved_filter_modal_title()}
  ariaLabel={m.saved_filter_modal_title()}
>
  {#snippet headerRight()}
    <SoftButton onclick={handleSave} disabled={!canSave}>
      <Save size={16} aria-hidden="true" />
      {m.saved_filter_save()}
    </SoftButton>
  {/snippet}
  <div class="sheet-content">
    <List nested>
      <ListInput
        label={m.saved_filter_name_label()}
        type="text"
        placeholder={m.saved_filter_name_placeholder()}
        bind:value={name}
      />
    </List>

    <div class="section">
      <div class="section-label">{m.saved_filter_preview_label()}</div>
      <p class="filter-preview">{filterSummary}</p>
    </div>

    <div class="section">
      <div class="section-label">{m.saved_filter_color_label()}</div>
      <div
        class="color-picker"
        role="radiogroup"
        aria-label={m.saved_filter_color_label()}
      >
        {#each SAVED_FILTER_COLORS as color (color.id)}
          <button
            type="button"
            class="color-swatch"
            class:color-swatch--selected={selectedColor === color.id}
            style="--swatch-color: {color.hex}"
            role="radio"
            aria-checked={selectedColor === color.id}
            aria-label={color.id}
            onclick={() => {
              selectedColor = color.id;
            }}
          >
            {#if selectedColor === color.id}
              <span class="swatch-check" aria-hidden="true">&#10003;</span>
            {/if}
          </button>
        {/each}
      </div>
    </div>

    <div class="section">
      <div class="section-label">{m.saved_filter_icon_label()}</div>
      <div
        class="icon-picker"
        role="radiogroup"
        aria-label={m.saved_filter_icon_label()}
      >
        {#each SAVED_FILTER_ICONS as icon (icon.id)}
          <button
            type="button"
            class="icon-option"
            class:icon-option--selected={selectedIcon === icon.id}
            role="radio"
            aria-checked={selectedIcon === icon.id}
            aria-label={icon.id}
            onclick={() => {
              selectedIcon = icon.id;
            }}
          >
            <icon.component size={20} aria-hidden="true" />
          </button>
        {/each}
      </div>
    </div>
  </div>
</ShellSheet>

<style>
  .sheet-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: 0 var(--space-lg) var(--space-lg);
  }

  .section-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 0.5rem;
  }

  .filter-preview {
    font-size: 0.875rem;
    color: var(--ink);
    margin: 0;
  }

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
    transition: border-color 150ms linear;
  }

  .color-swatch--selected {
    border-color: var(--ink);
  }

  .swatch-check {
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

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
    border: 1px solid var(--hair-2, var(--surface-1, rgba(0, 0, 0, 0.1)));
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    transition:
      background-color 150ms linear,
      color 150ms linear,
      border-color 150ms linear;
  }

  .icon-option--selected {
    background-color: var(--ink);
    color: var(--paper);
    border-color: var(--ink);
  }
</style>
