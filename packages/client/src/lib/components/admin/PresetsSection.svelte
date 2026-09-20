<script lang="ts">
  import { Card, List, ListInput, DialogButton } from "konsta/svelte";
  import { DIALOG_DESTRUCTIVE_CLASS } from "$lib/components/shared/konsta-classes.js";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { adminKeys, queueKeys } from "$lib/query/keys.js";
  import { Plus, Pencil, Trash, Save } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { requireRouter } from "$lib/errors.js";
  import { getOrgDecryptCache, getOrgKeyManager } from "$lib/crypto/context.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";

  // ── Router guards ──

  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const queryClient = useQueryClient();
  const orgCache = getOrgDecryptCache();
  const orgKeyManager = getOrgKeyManager();

  // ── Queries ──

  const presetsQuery = createQuery(() => ({
    queryKey: adminKeys.presets(),
    queryFn: async () => ticketRouter.listPresets.query({}),
  }));

  type PresetRecord = NonNullable<typeof presetsQuery.data>[number];

  const queuesQuery = createQuery(() => ({
    queryKey: queueKeys.all,
    queryFn: async () => ticketRouter.listQueues.query(),
  }));

  function decryptQueueName(queueId: string): string | null {
    const queue = (queuesQuery.data ?? []).find((q) => q.id === queueId);
    if (!queue) return null;
    return orgCache.decrypt(`queue:${queueId}`, queue.encryptedName, {
      table: "queues",
      id: queueId,
    });
  }

  function presetQueueLabel(preset: PresetRecord): string | null {
    if (preset.queueId === null) return null;
    return decryptQueueName(preset.queueId);
  }

  // ── Sheet state ──

  let sheetOpen = $state(false);
  let editingPreset = $state<PresetRecord | null>(null);
  let formTitle = $state("");
  let formBody = $state("");
  let formQueueId = $state<string | null>(null);
  let sheetSaving = $state(false);

  function resetForm(): void {
    editingPreset = null;
    formTitle = "";
    formBody = "";
    formQueueId = null;
  }

  function openAddSheet(): void {
    resetForm();
    sheetOpen = true;
  }

  function openEditSheet(preset: PresetRecord): void {
    editingPreset = preset;
    const origin = { table: "preset_replies" as const, id: preset.id };
    formTitle =
      orgCache.decrypt(
        `preset:${preset.id}:title`,
        preset.encryptedTitle,
        origin,
      ) ?? "";
    formBody =
      orgCache.decrypt(
        `preset:${preset.id}:body`,
        preset.encryptedBody,
        origin,
      ) ?? "";
    formQueueId = preset.queueId;
    sheetOpen = true;
  }

  const isEditing = $derived(editingPreset != null);

  const formValid = $derived(
    formTitle.trim().length > 0 && formBody.trim().length > 0,
  );

  // ── Save handler (org-tier encryption) ──

  async function handleSave(): Promise<void> {
    if (!formValid) return;
    sheetSaving = true;
    try {
      const encryptedTitle = await orgKeyManager.encryptText(formTitle.trim());
      const encryptedBody = await orgKeyManager.encryptText(formBody.trim());

      if (isEditing && editingPreset !== null) {
        await ticketRouter.updatePreset.mutate({
          presetId: editingPreset.id,
          encryptedTitle,
          encryptedBody,
          queueId: formQueueId,
        });
        orgCache.delete(`preset:${editingPreset.id}:title`);
        orgCache.delete(`preset:${editingPreset.id}:body`);
        haptic();
        toastStore.show(m.admin_presets_saved());
        announceToLiveRegion("polite", m.admin_presets_saved());
      } else {
        await ticketRouter.createPreset.mutate({
          encryptedTitle,
          encryptedBody,
          queueId: formQueueId,
        });
        haptic();
        toastStore.show(m.admin_presets_created());
        announceToLiveRegion("polite", m.admin_presets_created());
      }

      sheetOpen = false;
      resetForm();
      void queryClient.invalidateQueries({
        queryKey: adminKeys.presets(),
      });
    } catch {
      toastStore.show(m.error_generic());
    } finally {
      sheetSaving = false;
    }
  }

  // ── Delete confirmation ──

  let deleteTarget = $state<PresetRecord | null>(null);
  let deleteDialogOpen = $state(false);

  const deleteMut = createMutation(() => ({
    mutationFn: async (presetId: string) =>
      ticketRouter.deletePreset.mutate({ presetId }),
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_presets_deleted());
      announceToLiveRegion("polite", m.admin_presets_deleted());
      deleteDialogOpen = false;
      deleteTarget = null;
      sheetOpen = false;
      resetForm();
      void queryClient.invalidateQueries({
        queryKey: adminKeys.presets(),
      });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  function startDelete(preset: PresetRecord): void {
    deleteTarget = preset;
    deleteDialogOpen = true;
  }

  function confirmDelete(): void {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget.id);
  }
</script>

<div class="presets-section">
  {#if presetsQuery.isLoading}
    <div class="pst-content skeleton-pulse">
      <div class="pst-surface card-elevated">
        {#each { length: 3 } as _, i (i)}
          <div class="pst-row-skeleton">
            <span class="pst-text"><InlineSkeleton width="20ch" /></span>
          </div>
        {/each}
      </div>
    </div>
  {:else if presetsQuery.isError}
    <QueryError
      error={presetsQuery.error}
      onretry={() => void presetsQuery.refetch()}
    />
  {:else if (presetsQuery.data ?? []).length === 0}
    <div class="pst-content">
      <p class="section-desc">{m.admin_presets_description(withTerms())}</p>
      <div class="pst-empty-state">
        <p class="pst-empty">{m.admin_presets_empty()}</p>
        <p class="pst-empty-hint">{m.admin_presets_empty_hint()}</p>
      </div>
      <div class="pst-add-wrap">
        <SoftButton onclick={openAddSheet} full>
          <Plus size={16} aria-hidden="true" />
          {m.admin_presets_add_button()}
        </SoftButton>
      </div>
    </div>
  {:else}
    <div class="pst-content">
      <p class="section-desc">{m.admin_presets_description(withTerms())}</p>
      <Card raised contentWrap={false} class="pst-card">
        <div class="pst-card-inner">
          {#each presetsQuery.data ?? [] as preset (preset.id)}
            {@const presetOrigin = {
              table: "preset_replies" as const,
              id: preset.id,
            }}
            {@const title = orgCache.decrypt(
              `preset:${preset.id}:title`,
              preset.encryptedTitle,
              presetOrigin,
            )}
            {@const body = orgCache.decrypt(
              `preset:${preset.id}:body`,
              preset.encryptedBody,
              presetOrigin,
            )}
            {@const queueLabel = presetQueueLabel(preset)}
            <div class="pst-row">
              <div class="pst-row-content">
                <span class="pst-row-title">
                  <DecryptPlaceholder content={title} length={16} />
                </span>
                <span class="pst-row-body">
                  <DecryptPlaceholder content={body} length={40}>
                    {body?.slice(0, 80)}{(body?.length ?? 0) > 80 ? "..." : ""}
                  </DecryptPlaceholder>
                </span>
                {#if queueLabel !== null}
                  <span class="pst-queue-badge">
                    <DecryptPlaceholder content={queueLabel} length={10} />
                  </span>
                {/if}
              </div>
              <button
                type="button"
                class="pst-edit-btn touch-feedback"
                onclick={() => openEditSheet(preset)}
                aria-label="{m.admin_presets_edit_title()}: {title ?? ''}"
              >
                <Pencil size={14} />
              </button>
            </div>
          {/each}

          <SoftButton onclick={openAddSheet} full>
            <Plus size={16} aria-hidden="true" />
            {m.admin_presets_add_button()}
          </SoftButton>
        </div>
      </Card>
    </div>
  {/if}
</div>

<!-- Add/Edit Preset Sheet -->
<ShellSheet
  opened={sheetOpen}
  ondismiss={() => {
    sheetOpen = false;
    resetForm();
  }}
  ariaLabel={isEditing
    ? m.admin_presets_edit_title()
    : m.admin_presets_add_title()}
  title={isEditing ? m.admin_presets_edit_title() : m.admin_presets_add_title()}
>
  {#snippet headerRight()}
    <SoftButton
      onclick={() => void handleSave()}
      disabled={!formValid || sheetSaving}
    >
      {#if sheetSaving}
        {m.common_loading()}
      {:else}
        <Save size={16} aria-hidden="true" />
        {isEditing
          ? m.admin_presets_save_edit()
          : m.admin_presets_save_create()}
      {/if}
    </SoftButton>
  {/snippet}
  <div class="sheet-content">
    <List nested>
      <ListInput
        type="text"
        label={m.admin_presets_title_label()}
        placeholder={m.admin_presets_title_placeholder()}
        value={formTitle}
        onInput={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLInputElement) formTitle = target.value;
        }}
        disabled={sheetSaving}
      />

      <ListInput
        type="textarea"
        label={m.admin_presets_body_label()}
        inputId="pst-body"
        placeholder={m.admin_presets_body_placeholder()}
        value={formBody}
        inputClass="resize-y min-h-[5rem]"
        onInput={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLTextAreaElement) formBody = target.value;
          else if (target instanceof HTMLInputElement) formBody = target.value;
        }}
        disabled={sheetSaving}
      />

      <ListInput
        type="select"
        dropdown
        label={m.admin_presets_queue_label(withTerms())}
        value={formQueueId ?? ""}
        onChange={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLSelectElement) {
            formQueueId = target.value === "" ? null : target.value;
          }
        }}
        disabled={sheetSaving}
      >
        <option value="">{m.admin_presets_queue_global(withTerms())}</option>
        {#each queuesQuery.data ?? [] as queue (queue.id)}
          {@const qName = decryptQueueName(queue.id)}
          <option value={queue.id}>
            {qName ?? queue.id.slice(0, 8)}
          </option>
        {/each}
      </ListInput>
    </List>

    {#if isEditing}
      <div class="sheet-actions">
        <button
          type="button"
          class="delete-btn touch-feedback"
          onclick={() => {
            if (editingPreset) startDelete(editingPreset);
          }}
        >
          <Trash size={14} />
          {m.admin_presets_delete()}
        </button>
      </div>
    {/if}
  </div>
</ShellSheet>

<!-- Delete Confirmation Dialog -->
<ShellDialog
  opened={deleteDialogOpen}
  ondismiss={() => {
    deleteDialogOpen = false;
    deleteTarget = null;
  }}
  title={m.admin_presets_delete_title()}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">
      {m.admin_presets_delete_confirm(withTerms())}
    </p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton
      onclick={() => {
        deleteDialogOpen = false;
        deleteTarget = null;
      }}
    >
      {m.common_cancel()}
    </DialogButton>
    <DialogButton
      strong
      class={DIALOG_DESTRUCTIVE_CLASS}
      onclick={confirmDelete}
    >
      {m.admin_presets_delete()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<style>
  .presets-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: 0.25rem 0 0;
  }

  .pst-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: 0 var(--page-pad-x) 0.25rem;
  }

  :global(.pst-card) {
    margin: 0 !important;
  }

  .pst-card-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--card-pad-y) var(--card-pad-x);
  }

  .section-desc {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
  }

  .pst-empty-state {
    text-align: center;
    padding: var(--space-lg) 0;
  }

  .pst-empty {
    text-align: center;
    color: var(--muted);
    font-size: var(--text-base);
    margin: 0;
  }

  .pst-empty-hint {
    text-align: center;
    color: var(--muted);
    font-size: var(--text-sm);
    margin: var(--space-xs) 0 0;
  }

  .pst-add-wrap {
    padding: 0;
  }

  .pst-surface {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pst-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    width: 100%;
    font-size: var(--text-base);
    color: var(--ink);
    padding: var(--space-sm) 0;
    border-bottom: 1px solid
      color-mix(in srgb, var(--hair, var(--divider)) 50%, transparent);
  }

  .pst-row:last-child {
    border-bottom: none;
  }

  .pst-row-skeleton {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-lg) var(--page-pad-x);
    border-bottom: 1px solid var(--hair, var(--divider));
  }

  .pst-row-skeleton:last-child {
    border-bottom: none;
  }

  .pst-row-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 2px;
  }

  .pst-row-title {
    font-weight: 600;
    font-size: var(--text-sm);
  }

  .pst-row-body {
    font-size: var(--text-xs);
    color: var(--muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pst-queue-badge {
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    padding: 0.0625rem 0.375rem;
    border-radius: 0.25rem;
    font-size: var(--text-xs);
    font-weight: 600;
    background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
    color: var(--brand-text);
  }

  .pst-edit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border: none;
    background: transparent;
    color: var(--muted);
    border-radius: 50%;
    cursor: pointer;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }

  .sheet-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-lg) var(--page-pad-x);
    flex: 1;
  }

  .sheet-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding-top: var(--space-2xl);
  }

  .delete-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    width: 100%;
    padding: 0.625rem;
    border: none;
    background: transparent;
    color: var(--danger, var(--color-red-500));
    font-size: var(--text-sm);
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    border-radius: 0.5rem;
    -webkit-tap-highlight-color: transparent;
  }
</style>
