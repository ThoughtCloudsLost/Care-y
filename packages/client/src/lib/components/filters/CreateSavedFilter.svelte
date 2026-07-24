<script lang="ts">
  import { List, ListInput } from "konsta/svelte";
  import { Save } from "@lucide/svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import ColorPicker from "$lib/components/inputs/ColorPicker.svelte";
  import IconPicker from "$lib/components/inputs/IconPicker.svelte";
  import {
    PICKER_COLORS,
    PICKER_ICONS,
  } from "$lib/components/inputs/picker-options.js";
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
      <ColorPicker
        options={PICKER_COLORS}
        bind:value={selectedColor}
        label={m.saved_filter_color_label()}
      />
    </div>

    <div class="section">
      <div class="section-label">{m.saved_filter_icon_label()}</div>
      <IconPicker
        options={PICKER_ICONS}
        bind:value={selectedIcon}
        label={m.saved_filter_icon_label()}
      />
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
</style>
