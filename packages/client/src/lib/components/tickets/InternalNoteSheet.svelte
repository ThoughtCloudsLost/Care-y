<!--
  Internal note compose sheet. Separated from the reply compose bar to
  prevent accidental cross-contamination between client-facing replies
  and team-only notes.

  Owns encryption, mutation, and dismiss lifecycle (same pattern as
  DisplayNameSheet). Callers just provide ticketId + opened/ondismiss.
-->
<script lang="ts">
  import { Chip, List, ListInput } from "konsta/svelte";
  import { StickyNote } from "@lucide/svelte";
  import { useQueryClient } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getCryptoBridge } from "$lib/crypto/context.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/SoftButton.svelte";

  interface InternalNoteSheetProps {
    opened: boolean;
    ondismiss: () => void;
    ticketId: string;
  }

  let { opened, ondismiss, ticketId }: InternalNoteSheetProps = $props();

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;
  const cryptoBridge = getCryptoBridge();
  const queryClient = useQueryClient();

  let noteText = $state("");
  let saving = $state(false);
  let wasOpen = $state(false);

  // Reset draft each time the sheet opens (not re-opens).
  $effect(() => {
    if (opened && !wasOpen) {
      noteText = "";
    }
    wasOpen = opened;
  });

  const canSave = $derived(noteText.trim().length > 0 && !saving);

  async function handleSave(): Promise<void> {
    const text = noteText.trim();
    if (text.length === 0) return;

    saving = true;
    try {
      const encryptedContent = await cryptoBridge.encrypt(ticketId, text);
      await ticketRouter.createFollowUp.mutate({
        ticketId,
        type: "internal_note",
        source: "volunteer",
        isPrivate: true,
        encryptedContent,
      });
      ondismiss();
      toastStore.show(m.ticket_note_saved());
      void queryClient.invalidateQueries({
        queryKey: ["ticket", ticketId, "followUps"],
      });
    } catch {
      toastStore.show(m.error_generic(), 3000);
    } finally {
      saving = false;
    }
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={m.ticket_add_internal_note()}
  title={m.ticket_add_internal_note()}
>
  {#snippet headerRight()}
    <SoftButton onclick={() => void handleSave()} disabled={!canSave}>
      {saving ? m.ticket_note_saving() : m.ticket_save_note()}
    </SoftButton>
  {/snippet}

  <div class="note-sheet-body">
    <div class="note-team-chip">
      <Chip outline class="team-chip">
        <span class="team-chip-content">
          <StickyNote size={11} class="team-chip-icon" />
          {m.ticket_note_team_only()}
        </span>
      </Chip>
    </div>

    <List nested class="note-input-list">
      <ListInput
        outline
        type="textarea"
        placeholder={m.ticket_compose_note_placeholder()}
        value={noteText}
        onInput={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLTextAreaElement) {
            noteText = target.value;
            target.style.height = "auto";
            target.style.height = `${String(target.scrollHeight)}px`;
          }
        }}
        disabled={saving}
        inputClass="note-textarea"
      />
    </List>
  </div>
</ShellSheet>

<style>
  .note-sheet-body {
    padding: var(--space-md) var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .note-team-chip {
    display: flex;
  }

  .team-chip-content {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  :global(.team-chip-icon) {
    color: var(--brand-accent, var(--brand-primary));
    flex-shrink: 0;
  }

  :global(.team-chip) {
    font-size: 0.6875rem !important;
  }

  :global(.note-textarea) {
    min-height: calc(3lh) !important;
    resize: none;
    overflow: hidden;
  }

  :global(.note-input-list) {
    margin: 0 !important;
  }
</style>
