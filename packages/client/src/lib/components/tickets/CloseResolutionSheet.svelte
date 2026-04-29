<!--
  Sequential resolution prompt shown before closing a ticket.
  One instance per requires_on_close note type. The parent swaps content
  within the same open sheet to avoid open/close animation between steps.
-->
<script lang="ts">
  import { List, ListInput, Button } from "konsta/svelte";
  import type { LucideIcon } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";

  interface CloseResolutionSheetProps {
    opened: boolean;
    noteTypeId: string;
    noteTypeName: string;
    NoteTypeIcon: LucideIcon;
    current: number;
    total: number;
    saving: boolean;
    onsubmit: (text: string) => void;
    onskip: () => void;
  }

  let {
    opened,
    noteTypeId,
    noteTypeName,
    NoteTypeIcon,
    current,
    total,
    saving,
    onsubmit,
    onskip,
  }: CloseResolutionSheetProps = $props();

  let resolutionText = $state("");

  // Reset text when the queue advances to a different note type.
  // Keyed on noteTypeId (UUID) rather than noteTypeName to handle
  // the edge case of two types with the same decrypted name.
  let prevTypeId = "";
  $effect(() => {
    if (noteTypeId !== prevTypeId) {
      resolutionText = "";
      prevTypeId = noteTypeId;
    }
  });

  const canSubmit = $derived(resolutionText.trim().length > 0 && !saving);

  function handleSubmit(): void {
    const text = resolutionText.trim();
    if (text.length === 0) return;
    onsubmit(text);
  }
</script>

<ShellSheet
  {opened}
  ondismiss={onskip}
  ariaLabel={noteTypeName}
  title={noteTypeName}
>
  {#snippet headerRight()}
    <SoftButton onclick={handleSubmit} disabled={!canSubmit}>
      {saving ? m.common_loading() : m.ticket_close_submit_continue()}
    </SoftButton>
  {/snippet}

  <div class="close-resolution-body">
    <div class="close-resolution-header">
      <NoteTypeIcon
        size={18}
        aria-hidden="true"
        class="close-resolution-icon"
      />
      <p class="close-resolution-subtitle">
        {m.ticket_close_resolution_subtitle()}
      </p>
    </div>

    {#if total > 1}
      <span class="close-resolution-progress">
        {m.ticket_close_progress({
          current: String(current),
          total: String(total),
        })}
      </span>
    {/if}

    <List nested class="close-resolution-input-list">
      <ListInput
        outline
        type="textarea"
        placeholder={noteTypeName}
        value={resolutionText}
        onInput={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLTextAreaElement) {
            resolutionText = target.value;
            target.style.height = "auto";
            target.style.height = `${String(target.scrollHeight)}px`;
          }
        }}
        disabled={saving}
        inputClass="close-resolution-textarea"
      />
    </List>

    <div class="close-resolution-actions">
      <Button clear small inline onclick={onskip} disabled={saving}>
        {m.ticket_close_skip()}
      </Button>
    </div>
  </div>
</ShellSheet>

<style>
  .close-resolution-body {
    padding: var(--space-md) var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .close-resolution-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  :global(.close-resolution-icon) {
    color: var(--brand-accent, var(--brand-primary));
    flex-shrink: 0;
  }

  .close-resolution-subtitle {
    font-size: 0.8125rem;
    color: var(--muted);
    margin: 0;
  }

  .close-resolution-progress {
    font-size: 0.75rem;
    color: var(--muted);
    text-align: center;
  }

  :global(.close-resolution-textarea) {
    min-height: calc(3lh) !important;
    resize: none;
    overflow: hidden;
  }

  :global(.close-resolution-input-list) {
    margin: 0 !important;
  }

  .close-resolution-actions {
    display: flex;
    justify-content: center;
  }
</style>
