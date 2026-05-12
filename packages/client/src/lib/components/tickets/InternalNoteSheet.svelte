<!--
  Internal note compose sheet. Separated from the reply compose bar to
  prevent accidental cross-contamination between client-facing replies
  and internal notes.

  Owns encryption, mutation, and dismiss lifecycle (same pattern as
  DisplayNameSheet). Callers just provide ticketId + opened/ondismiss.
-->
<script lang="ts">
  import { List, ListInput } from "konsta/svelte";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { ticketKeys } from "$lib/query/keys";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getCryptoBridge, getOrgDecryptCache } from "$lib/crypto/context.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { RoleId } from "@care-y/shared";
  import { createNoteTypesQuery } from "$lib/tickets/queries.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";

  interface InternalNoteSheetProps {
    opened: boolean;
    ondismiss: () => void;
    ticketId: string;
    editFollowUpId?: string;
    editInitialContent?: string;
    editInitialNoteTypeId?: string;
    ondelete?: (followUpId: string) => void;
  }

  let {
    opened,
    ondismiss,
    ticketId,
    editFollowUpId,
    editInitialContent,
    editInitialNoteTypeId,
    ondelete,
  }: InternalNoteSheetProps = $props();

  const isEditMode = $derived(editFollowUpId !== undefined);

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;
  if (!ticketRouter.noteTypes) throw new RouterNotAvailableError("noteTypes");
  const noteTypesRouter = ticketRouter.noteTypes;
  const cryptoBridge = getCryptoBridge();
  const orgCache = getOrgDecryptCache();
  const queryClient = useQueryClient();

  const noteTypesResult = createNoteTypesQuery(noteTypesRouter);

  let noteText = $state("");
  let saving = $state(false);
  let wasOpen = $state(false);
  // User's explicit selection. Null = use the org default.
  let selectedNoteTypeId = $state<string | null>(null);

  // Reset or pre-fill each time the sheet opens.
  $effect(() => {
    if (opened && !wasOpen) {
      noteText = editInitialContent ?? "";
      selectedNoteTypeId = editInitialNoteTypeId ?? null;
    }
    wasOpen = opened;
  });

  const isDirty = $derived.by(() => {
    if (!isEditMode) return noteText.trim().length > 0;
    const textChanged = noteText.trim() !== (editInitialContent ?? "").trim();
    const typeChanged =
      selectedNoteTypeId !== null &&
      selectedNoteTypeId !== (editInitialNoteTypeId ?? null);
    return textChanged || typeChanged;
  });

  // Effective type: user's pick, falling back to the org default.
  // Reactive to both user selection and query data arrival.
  const effectiveNoteTypeId = $derived(
    selectedNoteTypeId ?? noteTypesResult.data?.defaultNoteTypeId ?? undefined,
  );

  const typeDescription = $derived.by(() => {
    if (!noteTypesResult.data || effectiveNoteTypeId === undefined)
      return undefined;
    const nt = noteTypesResult.data.types.find(
      (t) => t.id === effectiveNoteTypeId,
    );
    if (!nt?.encryptedDescription) return undefined;
    return (
      orgCache.decrypt(nt.id + ":desc", nt.encryptedDescription) ?? undefined
    );
  });

  const HINT_LABELS = new Map<string, () => string>([
    ["ticket_access", m.ticket_note_hint_participants],
    ["role:admin", m.ticket_note_hint_admins],
    ["role:manager", () => m.ticket_note_hint_managers(withTerms())],
  ]);

  const ROLE_LABELS = new Map<string, () => string>([
    [RoleId.MANAGER, () => m.role_manager(withTerms())],
    [RoleId.ADMIN, m.role_admin],
  ]);

  const notificationHintText = $derived.by(() => {
    if (!noteTypesResult.data || effectiveNoteTypeId === undefined)
      return undefined;
    const nt = noteTypesResult.data.types.find(
      (t) => t.id === effectiveNoteTypeId,
    );
    if (!nt) return undefined;
    const parts = nt.notificationHints
      .map((h) => HINT_LABELS.get(h)?.())
      .filter((s): s is string => s !== undefined);
    if (parts.length === 0) return undefined;
    return m.ticket_note_notifies({ targets: parts.join(", ") });
  });

  const visibilityText = $derived.by(() => {
    if (!noteTypesResult.data || effectiveNoteTypeId === undefined)
      return m.ticket_note_description();
    const nt = noteTypesResult.data.types.find(
      (t) => t.id === effectiveNoteTypeId,
    );
    if (!nt) return m.ticket_note_description();
    const roleLabel = ROLE_LABELS.get(nt.minViewRole);
    if (!roleLabel) return m.ticket_note_description();
    return m.ticket_note_visible_to_role({ role: roleLabel() });
  });

  const creatableTypes = $derived.by(() => {
    if (!noteTypesResult.data) return [];
    const all = noteTypesResult.data.types;
    const creatable = all.filter((t) => t.canCreate);
    if (isEditMode && editInitialNoteTypeId !== undefined) {
      const hasInitial = creatable.some((t) => t.id === editInitialNoteTypeId);
      if (!hasInitial) {
        const initial = all.find((t) => t.id === editInitialNoteTypeId);
        if (initial) return [initial, ...creatable];
      }
    }
    return creatable;
  });

  const canSave = $derived(isDirty && noteText.trim().length > 0 && !saving);

  async function handleSave(): Promise<void> {
    const text = noteText.trim();
    if (text.length === 0) return;

    saving = true;
    try {
      const encryptedContent = await cryptoBridge.encrypt(ticketId, text);

      if (isEditMode && editFollowUpId !== undefined) {
        await ticketRouter.updateInternalNote.mutate({
          followUpId: editFollowUpId,
          encryptedContent,
          noteTypeId: effectiveNoteTypeId,
        });
        toastStore.show(m.note_type_updated());
      } else {
        await ticketRouter.createFollowUp.mutate({
          ticketId,
          type: "internal_note",
          source: "volunteer",
          isPrivate: true,
          encryptedContent,
          noteTypeId: effectiveNoteTypeId,
        });
        toastStore.show(m.ticket_note_saved());
      }

      ondismiss();
      haptic();
      announceToLiveRegion("polite", m.ticket_note_saved());
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.followUps(ticketId),
      });
    } catch {
      toastStore.show(m.error_generic(), 3000);
    } finally {
      saving = false;
    }
  }

  function handleDelete(): void {
    if (editFollowUpId !== undefined && ondelete) {
      ondelete(editFollowUpId);
    }
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={isEditMode ? m.ticket_edit_note() : m.ticket_add_internal_note()}
  title={isEditMode ? m.ticket_edit_note() : m.ticket_add_internal_note()}
>
  {#snippet headerRight()}
    <SoftButton onclick={() => void handleSave()} disabled={!canSave}>
      {saving
        ? m.ticket_note_saving()
        : isEditMode
          ? m.common_update()
          : m.ticket_save_note()}
    </SoftButton>
  {/snippet}

  <div class="note-sheet-body">
    <p class="note-description">{visibilityText}</p>

    {#if noteTypesResult.data && creatableTypes.length > 0}
      <List strongIos outlineIos nested class="note-type-select-list">
        <ListInput
          outline
          dropdown
          label={m.note_compose_type_label()}
          type="select"
          value={effectiveNoteTypeId}
          onChange={(e: Event) => {
            const target = e.target;
            if (target instanceof HTMLSelectElement) {
              selectedNoteTypeId = target.value;
            }
          }}
        >
          {#each creatableTypes as nt (nt.id)}
            <option value={nt.id}>
              {orgCache.decrypt(nt.id + ":name", nt.encryptedName) ?? ""}
            </option>
          {/each}
        </ListInput>
      </List>
      {#if typeDescription}
        <p class="note-type-desc">{typeDescription}</p>
      {/if}
      {#if notificationHintText}
        <p class="note-notify-hint">{notificationHintText}</p>
      {/if}
    {:else if noteTypesResult.data && creatableTypes.length === 0}
      <p class="note-no-types">{m.ticket_note_no_creatable_types()}</p>
    {/if}

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

    {#if isEditMode && ondelete}
      <div class="deactivate-action">
        <button
          type="button"
          class="deactivate-btn"
          onclick={handleDelete}
          disabled={saving}
        >
          {m.ticket_delete_note()}
        </button>
      </div>
    {/if}
  </div>
</ShellSheet>

<style>
  .note-sheet-body {
    padding: var(--space-md) var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .note-description {
    font-size: 0.75rem;
    color: var(--muted);
    margin: 0;
    line-height: 1.4;
  }

  .note-type-desc {
    font-size: 0.75rem;
    color: var(--ink);
    margin: 0;
    line-height: 1.4;
    white-space: pre-line;
  }

  .note-notify-hint {
    font-size: 0.6875rem;
    color: var(--muted);
    margin: 0;
    font-style: italic;
  }

  .note-no-types {
    font-size: 0.75rem;
    color: var(--muted);
    margin: 0;
    font-style: italic;
  }

  :global(.note-textarea) {
    min-height: calc(3lh) !important;
    resize: none;
    overflow: hidden;
  }

  :global(.note-input-list) {
    margin: 0 !important;
  }

  :global(.note-type-select-list) {
    margin: 0 !important;
  }

  .deactivate-action {
    padding: var(--space-2xl) var(--space-lg) 0;
  }

  .deactivate-btn {
    display: block;
    width: 100%;
    padding: 0.625rem;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-red-500);
    background: none;
    border: none;
    cursor: pointer;
    text-align: center;
    min-height: 44px;
  }
</style>
