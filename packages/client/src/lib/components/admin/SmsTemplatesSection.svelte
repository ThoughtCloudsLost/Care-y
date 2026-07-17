<script lang="ts">
  import { Card, List, ListInput, DialogButton } from "konsta/svelte";
  import { DIALOG_DESTRUCTIVE_CLASS } from "$lib/components/shared/konsta-classes.js";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { adminKeys } from "$lib/query/keys.js";
  import { Plus, Pencil, Trash2, Save } from "@lucide/svelte";
  import type { SmsResponseType } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { requireRouter } from "$lib/errors.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import {
    LOCALE_OPTIONS,
    friendlyLocaleLabel,
  } from "$lib/admin/locale-options.js";

  // ── Router guard ──

  const telephonyContent = requireRouter(
    trpc.telephonyContent,
    "telephonyContent",
  );

  const queryClient = useQueryClient();

  const SMS_MAX_CHARS = 1600;

  // ── Template type metadata ──

  const TEMPLATE_TYPES: readonly {
    readonly value: SmsResponseType;
    readonly label: () => string;
    readonly help: () => string;
  }[] = [
    {
      value: "new_client",
      label: () => m.admin_templates_type_new_client(),
      help: () => m.admin_templates_type_new_client_help(withTerms()),
    },
    {
      value: "error",
      label: () => m.admin_templates_type_error(),
      help: () => m.admin_templates_type_error_help(),
    },
  ];

  function friendlyTypeLabel(responseType: string): string {
    return (
      TEMPLATE_TYPES.find((t) => t.value === responseType)?.label() ??
      responseType
    );
  }

  // ── Query ──

  const templatesQuery = createQuery(() => ({
    queryKey: adminKeys.smsTemplates(),
    queryFn: async () => telephonyContent.listSmsResponses.query({}),
  }));

  type TemplateRecord = NonNullable<typeof templatesQuery.data>[number];

  const templatesByType = $derived.by(() => {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- ephemeral Map rebuilt each derivation, not persisted state
    const grouped = new Map<string, TemplateRecord[]>();
    for (const t of templatesQuery.data ?? []) {
      const existing = grouped.get(t.responseType);
      if (existing) {
        existing.push(t);
      } else {
        grouped.set(t.responseType, [t]);
      }
    }
    return grouped;
  });

  // ── Sheet state ──

  let sheetOpen = $state(false);
  let editingTemplate = $state<TemplateRecord | null>(null);
  let formType = $state<SmsResponseType>("new_client");
  let formLocale = $state("en");
  let formText = $state("");

  const charCount = $derived(formText.length);

  function resetForm(): void {
    editingTemplate = null;
    formType = "new_client";
    formLocale = "en";
    formText = "";
  }

  function openAddSheet(): void {
    resetForm();
    sheetOpen = true;
  }

  function openEditSheet(template: TemplateRecord): void {
    editingTemplate = template;
    const matchedType = TEMPLATE_TYPES.find(
      (t) => t.value === template.responseType,
    );
    if (matchedType) formType = matchedType.value;
    formLocale = template.locale;
    formText = template.text;
    sheetOpen = true;
  }

  const isEditing = $derived(editingTemplate != null);

  const isDuplicate = $derived.by(() => {
    if (isEditing) return false;
    const templates = templatesQuery.data ?? [];
    return templates.some(
      (t) => t.responseType === formType && t.locale === formLocale,
    );
  });

  const formValid = $derived(
    formText.trim().length > 0 &&
      formText.length <= SMS_MAX_CHARS &&
      !isDuplicate,
  );

  // ── Mutations ──

  const createMut = createMutation(() => ({
    mutationFn: async () =>
      telephonyContent.createSmsResponse.mutate({
        responseType: formType,
        locale: formLocale,
        text: formText.trim(),
      }),
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_templates_created());
      announceToLiveRegion("polite", m.admin_templates_created());
      sheetOpen = false;
      resetForm();
      void queryClient.invalidateQueries({
        queryKey: adminKeys.smsTemplates(),
      });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  const updateMut = createMutation(() => ({
    mutationFn: async () => {
      const current = editingTemplate;
      if (current === null) throw new TypeError("No template selected");
      return telephonyContent.updateSmsResponse.mutate({
        id: current.id,
        text: formText.trim(),
      });
    },
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_templates_saved());
      announceToLiveRegion("polite", m.admin_templates_saved());
      sheetOpen = false;
      resetForm();
      void queryClient.invalidateQueries({
        queryKey: adminKeys.smsTemplates(),
      });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  function handleSave(): void {
    if (!formValid) return;
    if (isEditing) {
      updateMut.mutate();
    } else {
      createMut.mutate();
    }
  }

  const isSaving = $derived(createMut.isPending || updateMut.isPending);

  // ── Delete confirmation ──

  let deleteTarget = $state<TemplateRecord | null>(null);
  let deleteDialogOpen = $state(false);

  const deleteMut = createMutation(() => ({
    mutationFn: async (id: string) =>
      telephonyContent.deleteSmsResponse.mutate({ id }),
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_templates_deleted());
      announceToLiveRegion("polite", m.admin_templates_deleted());
      deleteDialogOpen = false;
      deleteTarget = null;
      sheetOpen = false;
      resetForm();
      void queryClient.invalidateQueries({
        queryKey: adminKeys.smsTemplates(),
      });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  function startDelete(template: TemplateRecord): void {
    deleteTarget = template;
    deleteDialogOpen = true;
  }

  function confirmDelete(): void {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget.id);
  }
</script>

<div class="templates-section">
  {#if templatesQuery.isLoading}
    <div class="tpl-content skeleton-pulse">
      <div class="tpl-surface card-elevated">
        {#each { length: 3 } as _, i (i)}
          <div class="tpl-row-skeleton">
            <span class="tpl-badge"><InlineSkeleton width="6ch" /></span>
            <span class="tpl-text"><InlineSkeleton width="20ch" /></span>
          </div>
        {/each}
      </div>
    </div>
  {:else if templatesQuery.isError}
    <QueryError
      error={templatesQuery.error}
      onretry={() => void templatesQuery.refetch()}
    />
  {:else if (templatesQuery.data ?? []).length === 0}
    <div class="tpl-content">
      <div class="tpl-empty-state">
        <p class="tpl-empty">{m.admin_templates_empty()}</p>
        <p class="tpl-empty-hint">{m.admin_templates_empty_hint()}</p>
      </div>
      <div class="tpl-add-wrap">
        <SoftButton onclick={openAddSheet} full>
          <Plus size={16} aria-hidden="true" />
          {m.admin_templates_add_button()}
        </SoftButton>
      </div>
    </div>
  {:else}
    <div class="tpl-content">
      <Card raised contentWrap={false} class="tpl-card">
        <div class="tpl-card-inner">
          {#each TEMPLATE_TYPES as typeInfo, typeIdx (typeInfo.value)}
            {@const typeTemplates = templatesByType.get(typeInfo.value) ?? []}
            {#if typeIdx > 0}
              <div class="section-divider" role="separator"></div>
            {/if}
            <div class="tpl-group">
              <h4 class="tpl-group-label">{typeInfo.label()}</h4>
              {#if typeTemplates.length === 0}
                <p class="tpl-group-empty">{m.admin_templates_empty()}</p>
              {:else}
                {#each typeTemplates as template (template.id)}
                  <div class="tpl-row">
                    <span class="tpl-locale-badge">{template.locale}</span>
                    <span class="tpl-text">{template.text}</span>
                    <button
                      type="button"
                      class="tpl-edit-btn touch-feedback"
                      onclick={() => openEditSheet(template)}
                      aria-label="{m.admin_templates_edit_title()}: {friendlyTypeLabel(
                        template.responseType,
                      )}, {friendlyLocaleLabel(template.locale)}"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                {/each}
              {/if}
            </div>
          {/each}

          <SoftButton onclick={openAddSheet} full>
            <Plus size={16} aria-hidden="true" />
            {m.admin_templates_add_button()}
          </SoftButton>
        </div>
      </Card>
    </div>
  {/if}
</div>

<!-- Add/Edit Template Sheet -->
<ShellSheet
  opened={sheetOpen}
  ondismiss={() => {
    sheetOpen = false;
    resetForm();
  }}
  ariaLabel={isEditing
    ? m.admin_templates_edit_title()
    : m.admin_templates_add_title()}
  title={isEditing
    ? m.admin_templates_edit_title()
    : m.admin_templates_add_title()}
>
  {#snippet headerRight()}
    <SoftButton onclick={handleSave} disabled={!formValid || isSaving}>
      {#if isSaving}
        {m.common_loading()}
      {:else}
        <Save size={16} aria-hidden="true" />
        {isEditing
          ? m.admin_templates_save_edit()
          : m.admin_templates_save_create()}
      {/if}
    </SoftButton>
  {/snippet}
  <div class="sheet-content">
    <List nested>
      <ListInput
        type="select"
        dropdown
        label={m.admin_templates_type_label()}
        value={formType}
        disabled={isEditing}
        onChange={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLSelectElement) {
            const match = TEMPLATE_TYPES.find((t) => t.value === target.value);
            if (match) formType = match.value;
          }
        }}
      >
        {#each TEMPLATE_TYPES as typeOpt (typeOpt.value)}
          <option value={typeOpt.value}>{typeOpt.label()}</option>
        {/each}
      </ListInput>

      <ListInput
        type="select"
        dropdown
        label={m.admin_templates_locale_label()}
        value={formLocale}
        disabled={isEditing}
        onChange={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLSelectElement) formLocale = target.value;
        }}
      >
        {#each LOCALE_OPTIONS as loc (loc.value)}
          <option value={loc.value}>{loc.label}</option>
        {/each}
      </ListInput>

      <ListInput
        type="textarea"
        label={m.admin_templates_text_label()}
        inputId="tpl-text"
        placeholder={m.admin_templates_text_placeholder()}
        value={formText}
        inputClass="resize-y min-h-[5rem]"
        onInput={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLTextAreaElement) formText = target.value;
          else if (target instanceof HTMLInputElement) formText = target.value;
        }}
      />
    </List>

    <div class="char-count-row">
      <span class="char-count" class:over-limit={charCount > SMS_MAX_CHARS}>
        {m.admin_templates_char_count({
          count: String(charCount),
          max: String(SMS_MAX_CHARS),
        })}
      </span>
    </div>

    <p class="field-help">{m.admin_templates_segment_hint()}</p>

    {#if !isEditing}
      {@const helpText = TEMPLATE_TYPES.find(
        (t) => t.value === formType,
      )?.help()}
      {#if helpText}
        <p class="field-help">{helpText}</p>
      {/if}
    {/if}

    {#if isDuplicate}
      <p class="field-error" role="alert">
        {m.admin_templates_duplicate()}
      </p>
    {/if}

    {#if isEditing}
      <div class="sheet-actions">
        <button
          type="button"
          class="delete-btn touch-feedback"
          onclick={() => {
            if (editingTemplate) startDelete(editingTemplate);
          }}
        >
          <Trash2 size={14} />
          {m.admin_templates_delete()}
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
  title={m.admin_templates_delete_title()}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">
      {m.admin_templates_delete_confirm()}
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
      {m.admin_templates_delete()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<style>
  .templates-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: 0.25rem 0 0;
  }

  .tpl-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: 0 var(--page-pad-x) 0.25rem;
  }

  :global(.tpl-card) {
    margin: 0 !important;
  }

  .tpl-card-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--card-pad-y) var(--card-pad-x);
  }

  .section-divider {
    border-top: 1px solid var(--hair, var(--divider));
    margin: var(--space-sm) 0;
  }

  .tpl-empty-state {
    text-align: center;
    padding: var(--space-lg) 0;
  }

  .tpl-empty {
    text-align: center;
    color: var(--muted);
    font-size: var(--text-base);
    margin: 0;
  }

  .tpl-empty-hint {
    text-align: center;
    color: var(--muted);
    font-size: var(--text-sm);
    margin: var(--space-xs) 0 0;
  }

  .tpl-add-wrap {
    padding: 0;
  }

  .tpl-surface {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .tpl-group-label {
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
    padding: 0 0 var(--space-xs);
    margin: 0;
  }

  .tpl-group-empty {
    font-size: var(--text-sm);
    color: var(--muted);
    margin: 0;
    padding: var(--space-xs) 0;
  }

  .tpl-row {
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

  .tpl-row:last-child {
    border-bottom: none;
  }

  .tpl-row-skeleton {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-lg) var(--page-pad-x);
    border-bottom: 1px solid var(--hair, var(--divider));
  }

  .tpl-row-skeleton:last-child {
    border-bottom: none;
  }

  .tpl-locale-badge {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2rem;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
    color: var(--brand-text);
  }

  .tpl-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 0.8;
  }

  .tpl-edit-btn {
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

  .char-count-row {
    display: flex;
    justify-content: flex-end;
    margin: calc(-1 * var(--space-sm)) 0 0;
  }

  .char-count {
    font-size: var(--text-xs);
    color: var(--muted);
  }

  .char-count.over-limit {
    color: var(--danger, var(--color-red-500));
    font-weight: 600;
  }

  /* .field-help and .field-error come from the shared form primitives
     (shared.css) */

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
