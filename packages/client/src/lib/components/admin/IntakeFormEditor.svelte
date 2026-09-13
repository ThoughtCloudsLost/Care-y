<!--
  Admin intake form editor. Renders the ordered field list, add/reorder/remove
  controls, slug, destination queue, default toggle, share link, read-only
  preview, and save/delete actions.

  Edits plaintext in component-local state only. Nothing plaintext persists.
  On save, every field's label and config are encrypted via encryptFieldContent
  before the whole-form save mutation fires.
-->
<script lang="ts">
  import {
    List,
    ListItem,
    ListInput,
    Button,
    BlockTitle,
    Block,
    Toggle,
    DialogButton,
  } from "konsta/svelte";
  import { ArrowUp, ArrowDown, Settings, X, Copy } from "@lucide/svelte";
  import {
    createMutation,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import type {
    IntakeFieldConfig,
    IntakeFieldType,
    IntakeFieldRole,
  } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { intakeFormKeys, queueKeys, volunteerKeys } from "$lib/query/keys.js";
  import { getOrgKeyManager, getOrgDecryptCache } from "$lib/crypto/context.js";
  import { encryptFieldContent } from "$lib/portal/intake-form-crypto.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { getErrorMessage } from "$lib/components/query-error-messages.js";
  import { DIALOG_DESTRUCTIVE_CLASS } from "$lib/components/shared/konsta-classes.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import IntakeFieldConfigSheet from "./IntakeFieldConfigSheet.svelte";
  import type {
    FieldConfigState,
    FieldConfigInitial,
    QueueOption,
    VolunteerOption,
  } from "./intake-field-config-types.js";
  import IntakeFieldRenderer from "$lib/components/portal/IntakeFieldRenderer.svelte";

  interface PlaintextField {
    label: string;
    isRequired: boolean;
    config: IntakeFieldConfig;
    fieldType: IntakeFieldType;
    role: IntakeFieldRole | null;
    routingQueueIds: string[] | null;
    escalationRecipientIds: string[] | null;
  }

  interface IntakeFormEditorProps {
    readonly formId: string | null;
    readonly initialName: string;
    readonly initialSlug: string | null;
    readonly initialIsDefault: boolean;
    readonly initialDestinationQueueId: string | null;
    readonly initialFields: readonly PlaintextField[];
    readonly onback: () => void;
    readonly ondeleted: () => void;
  }

  let {
    formId,
    initialName,
    initialSlug,
    initialIsDefault,
    initialDestinationQueueId,
    initialFields,
    onback,
    ondeleted,
  }: IntakeFormEditorProps = $props();

  const intakeFormsRouter = requireRouter(trpc.intakeForms, "intakeForms");
  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const queryClient = useQueryClient();
  const orgKeyManager = getOrgKeyManager();
  const orgCache = getOrgDecryptCache();

  let formName = $state(initialName);
  let formSlug = $state(initialSlug ?? "");
  let isDefault = $state(initialIsDefault);
  let destinationQueueId = $state<string | null>(initialDestinationQueueId);
  let fields = $state<PlaintextField[]>([...initialFields]);

  // Field config sheet state
  let configSheetOpened = $state(false);
  let configFieldIndex = $state(-1);
  let configFieldType = $state<IntakeFieldType>("text");
  const defaultConfigInitial: FieldConfigInitial = {
    label: "",
    isRequired: false,
    config: { type: "text" },
    role: null,
    escalationRecipientIds: null,
  };
  let configFieldInitial: FieldConfigInitial = $state(defaultConfigInitial);

  // Add-field type picker sheet state
  let addFieldSheetOpened = $state(false);

  const hasAvailability = $derived(
    fields.some((f) => f.fieldType === "availability"),
  );

  // Queue list query for the destination selector
  const queuesQuery = createQuery(() => ({
    queryKey: queueKeys.all,
    queryFn: async () => ticketRouter.listQueues.query(),
  }));

  // Volunteer list query for escalation recipient picker
  const volunteersQuery = createQuery(() => ({
    queryKey: volunteerKeys.all,
    queryFn: async () => ticketRouter.listVolunteers.query(),
    staleTime: 5 * 60 * 1000,
  }));

  // Decrypt queue names
  function getQueueName(queue: { id: string; encryptedName: string }): string {
    return (
      orgCache.decrypt(`queue:${queue.id}`, queue.encryptedName) ?? queue.id
    );
  }

  /** Decrypted queue options for the config sheet. */
  const queueOptions = $derived.by((): QueueOption[] => {
    if (queuesQuery.data == null) return [];
    return queuesQuery.data.map((q: { id: string; encryptedName: string }) => ({
      id: q.id,
      name: getQueueName(q),
    }));
  });

  /** Decrypted volunteer options for the escalation recipient picker. */
  const volunteerOptions = $derived.by((): VolunteerOption[] => {
    if (volunteersQuery.data == null) return [];
    return volunteersQuery.data.map(
      (v: { id: string; encryptedDisplayName: string }) => ({
        id: v.id,
        name: orgCache.decrypt(`vol:${v.id}`, v.encryptedDisplayName) ?? v.id,
      }),
    );
  });

  // Auto-suggest slug from form name
  function suggestSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  // Share link derivation
  const shareLink = $derived.by((): string | null => {
    if (!formSlug.trim()) return null;
    // Use window.location.origin when available, else placeholder
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/intake/${formSlug.trim()}`;
  });

  async function copyShareLink(): Promise<void> {
    if (shareLink === null) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      toastStore.show(m.intake_forms_link_copied());
    } catch {
      // Clipboard API may fail on some browsers; no-op
    }
  }

  // Save mutation
  const saveMutation = createMutation(() => ({
    mutationFn: async (input: {
      formId: string | null;
      name: string;
      slug: string | null;
      isDefault: boolean;
      destinationQueueId: string | null;
      fields: PlaintextField[];
    }) => {
      const orgPub = orgKeyManager.getPublicKey();
      if (!orgPub) {
        throw new Error("Org key not loaded");
      }

      const encryptedFields = input.fields.map((f) => {
        const encrypted = encryptFieldContent(
          { label: f.label, config: f.config },
          orgPub,
        );
        return {
          fieldType: f.fieldType,
          encryptedLabel: encrypted.encryptedLabel,
          encryptedConfig: encrypted.encryptedConfig,
          isRequired: f.isRequired,
          role: f.role ?? undefined,
          routingQueueIds: f.routingQueueIds ?? undefined,
          escalationRecipientIds: f.escalationRecipientIds ?? undefined,
        };
      });

      return intakeFormsRouter.save.mutate({
        formId: input.formId,
        name: input.name,
        slug: input.slug,
        isDefault: input.isDefault,
        destinationQueueId: input.destinationQueueId,
        fields: encryptedFields,
      });
    },
    onSuccess: () => {
      haptic();
      toastStore.show(m.intake_forms_saved());
      announceToLiveRegion("polite", m.intake_forms_saved());
      void queryClient.invalidateQueries({
        queryKey: intakeFormKeys.all,
      });
      onback();
    },
    onError: (err: unknown) => {
      toastStore.show(getErrorMessage(err));
    },
  }));

  // Delete state
  let deleteDialogOpened = $state(false);
  let deleteError = $state("");

  const deleteMutation = createMutation(() => ({
    mutationFn: async (deleteFormId: string) =>
      intakeFormsRouter.remove.mutate({ formId: deleteFormId }),
    onSuccess: () => {
      haptic();
      toastStore.show(m.intake_forms_deleted());
      announceToLiveRegion("polite", m.intake_forms_deleted());
      deleteDialogOpened = false;
      deleteError = "";
      void queryClient.invalidateQueries({
        queryKey: intakeFormKeys.all,
      });
      ondeleted();
    },
    onError: (err: unknown) => {
      deleteError = getErrorMessage(err);
    },
  }));

  function openDeleteDialog(): void {
    deleteError = "";
    deleteDialogOpened = true;
  }

  function confirmDelete(): void {
    if (formId !== null) {
      deleteMutation.mutate(formId);
    }
  }

  function cancelDelete(): void {
    deleteDialogOpened = false;
    deleteError = "";
  }

  /** No-op handler for read-only preview fields. */
  function previewNoop(): void {
    // Preview fields are disabled; changes are discarded.
  }

  function handleNameInput(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      formName = target.value;
      // Auto-suggest slug when creating a new form and slug is empty
      if (formId === null && formSlug === "") {
        formSlug = suggestSlug(target.value);
      }
    }
  }

  function handleSlugInput(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      formSlug = target.value;
    }
  }

  function handleDestinationChange(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLSelectElement) {
      destinationQueueId = target.value === "" ? null : target.value;
    }
  }

  function moveField(index: number, direction: -1 | 1): void {
    const swapTarget = index + direction;
    if (swapTarget < 0 || swapTarget >= fields.length) return;
    const src = fields.at(index);
    const dst = fields.at(swapTarget);
    if (src === undefined || dst === undefined) return;
    fields = fields.map((f, i) => {
      if (i === index) return dst;
      if (i === swapTarget) return src;
      return f;
    });
  }

  function removeField(index: number): void {
    fields = fields.filter((_, i) => i !== index);
  }

  function openConfigSheet(index: number): void {
    const field = fields.at(index);
    if (field === undefined) return;
    configFieldIndex = index;
    configFieldType = field.fieldType;
    configFieldInitial = {
      label: field.label,
      isRequired: field.isRequired,
      config: field.config,
      role: field.role,
      escalationRecipientIds: field.escalationRecipientIds,
    };
    configSheetOpened = true;
  }

  function handleConfigDone(result: FieldConfigState): void {
    configSheetOpened = false;
    if (configFieldIndex >= 0 && configFieldIndex < fields.length) {
      fields = fields.map((f, i) => {
        if (i !== configFieldIndex) return f;
        const updated: PlaintextField = {
          fieldType: f.fieldType,
          label: result.label,
          isRequired: result.isRequired,
          config: result.config,
          role: result.role,
          routingQueueIds: result.routingQueueIds,
          escalationRecipientIds: result.escalationRecipientIds,
        };
        return updated;
      });
    }
  }

  function openAddFieldSheet(): void {
    addFieldSheetOpened = true;
  }

  function addField(type: IntakeFieldType): void {
    addFieldSheetOpened = false;

    const defaultLabel = getDefaultLabel(type);
    const defaultConfig = getDefaultConfig(type);

    const newField: PlaintextField = {
      label: defaultLabel,
      isRequired: false,
      config: defaultConfig,
      fieldType: type,
      role: null,
      routingQueueIds: null,
      escalationRecipientIds: null,
    };

    fields = [...fields, newField];

    const newIndex = fields.length - 1;
    setTimeout(() => openConfigSheet(newIndex), 0);
  }

  function getDefaultLabel(type: IntakeFieldType): string {
    switch (type) {
      case "text":
        return m.intake_forms_field_type_text();
      case "textarea":
        return m.intake_forms_field_type_textarea();
      case "select":
        return m.intake_forms_field_type_select();
      case "multiselect":
        return m.intake_forms_field_type_multiselect();
      case "checkbox":
        return m.intake_forms_field_type_checkbox();
      case "availability":
        return m.intake_forms_field_type_availability();
    }
  }

  function getDefaultConfig(type: IntakeFieldType): IntakeFieldConfig {
    switch (type) {
      case "text":
        return { type: "text" };
      case "textarea":
        return { type: "textarea" };
      case "select":
        return { type: "select", options: [""] };
      case "multiselect":
        return { type: "multiselect", options: [""] };
      case "checkbox":
        return { type: "checkbox" };
      case "availability":
        return {
          type: "availability",
          allowRecurring: true,
          allowSpecific: true,
        };
    }
  }

  function getFieldTypeLabel(type: IntakeFieldType): string {
    switch (type) {
      case "text":
        return m.intake_forms_field_type_text();
      case "textarea":
        return m.intake_forms_field_type_textarea();
      case "select":
        return m.intake_forms_field_type_select();
      case "multiselect":
        return m.intake_forms_field_type_multiselect();
      case "checkbox":
        return m.intake_forms_field_type_checkbox();
      case "availability":
        return m.intake_forms_field_type_availability();
    }
  }

  function getFieldTypeDesc(type: IntakeFieldType): string {
    switch (type) {
      case "text":
        return m.intake_forms_field_type_text_desc();
      case "textarea":
        return m.intake_forms_field_type_textarea_desc();
      case "select":
        return m.intake_forms_field_type_select_desc();
      case "multiselect":
        return m.intake_forms_field_type_multiselect_desc();
      case "checkbox":
        return m.intake_forms_field_type_checkbox_desc();
      case "availability":
        return m.intake_forms_field_type_availability_desc();
    }
  }

  function handleSave(): void {
    if (!formName.trim() || fields.length === 0) return;
    const slugValue = formSlug.trim() || null;
    saveMutation.mutate({
      formId,
      name: formName.trim(),
      slug: slugValue,
      isDefault,
      destinationQueueId,
      fields,
    });
  }

  const fieldTypes: IntakeFieldType[] = [
    "text",
    "textarea",
    "select",
    "multiselect",
    "checkbox",
    "availability",
  ];

  const canSave = $derived(
    formName.trim().length > 0 && fields.length > 0 && !saveMutation.isPending,
  );
</script>

<BlockTitle>{m.intake_forms_name_label()}</BlockTitle>
<List strong inset>
  <ListInput
    type="text"
    placeholder={m.intake_forms_name_placeholder()}
    value={formName}
    onInput={handleNameInput}
  />
</List>

<!-- Slug -->
<BlockTitle>{m.intake_forms_slug_label()}</BlockTitle>
<List strong inset>
  <ListInput
    type="text"
    placeholder={m.intake_forms_slug_placeholder()}
    value={formSlug}
    onInput={handleSlugInput}
  />
</List>
<Block>
  <p class="slug-hint">{m.intake_forms_slug_hint()}</p>
</Block>

<!-- Destination queue -->
{#if queuesQuery.data}
  <BlockTitle>{m.intake_forms_destination_label()}</BlockTitle>
  <List strong inset>
    <ListInput
      type="select"
      dropdown
      value={destinationQueueId ?? ""}
      onChange={handleDestinationChange}
    >
      <option value="">{m.intake_forms_destination_none()}</option>
      {#each queuesQuery.data as queue (queue.id)}
        <option value={queue.id}>{getQueueName(queue)}</option>
      {/each}
    </ListInput>
  </List>
{/if}

<!-- Default toggle -->
<List strong inset>
  <ListItem title={m.intake_forms_default_toggle()}>
    {#snippet subtitle()}
      <span class="default-hint">{m.intake_forms_default_hint()}</span>
    {/snippet}
    {#snippet after()}
      <Toggle checked={isDefault} onChange={() => (isDefault = !isDefault)} />
    {/snippet}
  </ListItem>
</List>

<!-- Share link -->
{#if shareLink}
  <BlockTitle>{m.intake_forms_share_link()}</BlockTitle>
  <List strong inset>
    <ListItem title={shareLink}>
      {#snippet after()}
        <button
          type="button"
          class="copy-btn"
          onclick={() => void copyShareLink()}
          aria-label={m.intake_forms_link_copied()}
        >
          <Copy size={18} />
        </button>
      {/snippet}
    </ListItem>
  </List>
{/if}

<BlockTitle>
  {m.intake_forms_fields_heading({ count: String(fields.length) })}
</BlockTitle>
<List strong inset>
  {#each fields as field, index (index)}
    <ListItem
      title={`${String(index + 1)}. ${field.label}`}
      subtitle={`${getFieldTypeLabel(field.fieldType)} - ${field.isRequired ? m.intake_forms_field_required() : m.intake_forms_field_optional()}`}
    >
      {#snippet after()}
        <div class="field-actions">
          <button
            type="button"
            class="field-action-btn"
            disabled={index === 0}
            onclick={() => moveField(index, -1)}
            aria-label={m.intake_forms_move_up()}
          >
            <ArrowUp size={18} />
          </button>
          <button
            type="button"
            class="field-action-btn"
            disabled={index === fields.length - 1}
            onclick={() => moveField(index, 1)}
            aria-label={m.intake_forms_move_down()}
          >
            <ArrowDown size={18} />
          </button>
          <button
            type="button"
            class="field-action-btn"
            onclick={() => openConfigSheet(index)}
            aria-label={m.intake_forms_configure()}
          >
            <Settings size={18} />
          </button>
          <button
            type="button"
            class="field-action-btn field-action-btn-remove"
            onclick={() => removeField(index)}
            aria-label={m.intake_forms_remove_field()}
          >
            <X size={18} />
          </button>
        </div>
      {/snippet}
    </ListItem>
  {/each}
</List>

<Block>
  <Button outline onclick={openAddFieldSheet}>
    {m.intake_forms_add_field()}
  </Button>
</Block>

{#if fields.length > 0}
  <BlockTitle>{m.intake_forms_preview()}</BlockTitle>
  <Block>
    {#each fields as field, index (index)}
      <IntakeFieldRenderer
        fieldId={`preview-${String(index)}`}
        label={field.label}
        config={field.config}
        isRequired={field.isRequired}
        value={undefined}
        onchange={previewNoop}
      />
    {/each}
  </Block>
{/if}

<Block>
  <Button large disabled={!canSave} onclick={handleSave}>
    {#if saveMutation.isPending}
      {m.common_loading()}
    {:else}
      {m.intake_forms_save()}
    {/if}
  </Button>
</Block>

{#if formId !== null}
  <Block>
    <Button large outline class="delete-form-btn" onclick={openDeleteDialog}>
      {m.intake_forms_delete()}
    </Button>
  </Block>
{/if}

<!-- Delete confirmation dialog -->
<ShellDialog
  opened={deleteDialogOpened}
  ondismiss={cancelDelete}
  title={m.intake_forms_delete_title()}
>
  {#snippet content()}
    {#if deleteError}
      <p>{deleteError}</p>
    {:else}
      <p>{m.intake_forms_delete_confirm()}</p>
    {/if}
  {/snippet}
  {#snippet buttons()}
    <DialogButton onclick={cancelDelete}>
      {m.common_cancel()}
    </DialogButton>
    {#if !deleteError}
      <DialogButton
        class={DIALOG_DESTRUCTIVE_CLASS}
        strong
        disabled={deleteMutation.isPending}
        onclick={confirmDelete}
      >
        {m.intake_forms_delete()}
      </DialogButton>
    {/if}
  {/snippet}
</ShellDialog>

<!-- Add field type picker sheet -->
<ShellSheet
  opened={addFieldSheetOpened}
  ondismiss={() => (addFieldSheetOpened = false)}
  title={m.intake_forms_add_field()}
>
  <List strong inset>
    {#each fieldTypes as type (type)}
      {@const disabled = type === "availability" && hasAvailability}
      <ListItem
        title={getFieldTypeLabel(type)}
        subtitle={disabled
          ? m.intake_forms_one_availability()
          : getFieldTypeDesc(type)}
        onclick={disabled ? undefined : () => addField(type)}
        aria-disabled={disabled ? "true" : undefined}
        class={disabled ? "field-type-disabled" : ""}
      />
    {/each}
  </List>
</ShellSheet>

<!-- Field config sheet -->
<IntakeFieldConfigSheet
  opened={configSheetOpened}
  fieldType={configFieldType}
  initial={configFieldInitial}
  queues={queueOptions}
  volunteers={volunteerOptions}
  ondone={handleConfigDone}
  ondismiss={() => (configSheetOpened = false)}
/>

<style>
  .field-actions {
    display: flex;
    gap: var(--space-xs, 4px);
    align-items: center;
  }

  .field-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: none;
    color: var(--ink);
    cursor: pointer;
    border-radius: 50%;
    padding: 0;
  }

  .field-action-btn:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .field-action-btn:not(:disabled):active {
    background: color-mix(in srgb, var(--ink) 10%, transparent);
  }

  :global(.field-type-disabled) {
    opacity: 0.5;
    pointer-events: none;
  }

  .slug-hint {
    font-size: var(--text-xs);
    color: var(--muted);
    margin: 0;
  }

  .default-hint {
    font-size: var(--text-xs);
    color: var(--muted);
  }

  .copy-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: none;
    color: var(--ink);
    cursor: pointer;
    border-radius: 50%;
    padding: 0;
  }

  .copy-btn:active {
    background: color-mix(in srgb, var(--ink) 10%, transparent);
  }
</style>
