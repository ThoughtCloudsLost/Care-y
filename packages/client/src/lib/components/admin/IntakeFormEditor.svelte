<!--
  Admin intake form editor. Renders the ordered field list, add/reorder/remove
  controls, slug, destination queue, default toggle, share link, read-only
  preview, and save/delete actions. Supports multilingual authoring for all
  localized content (labels, help text, options, form-level meta) via locale
  tabs, and tracks unsaved changes for navigation guarding.

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
    Segmented,
    SegmentedButton,
  } from "konsta/svelte";
  import { ArrowUp, ArrowDown, Settings, X, Copy } from "@lucide/svelte";
  import {
    createMutation,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import {
    resolveLocalized,
    BASE_LOCALE,
    FORM_LOCALES,
    type IntakeFieldConfig,
    type IntakeFieldType,
    type IntakeFieldRole,
    type IntakeFormMeta,
    type LocalizedText,
    type FormLocale,
  } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { intakeFormKeys, queueKeys, volunteerKeys } from "$lib/query/keys.js";
  import { getOrgKeyManager, getOrgDecryptCache } from "$lib/crypto/context.js";
  import {
    encryptFieldContent,
    encryptFormMeta,
  } from "$lib/portal/intake-form-crypto.js";
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

  import type { VisibleWhen, IntakeOption } from "@care-y/shared";
  import type { EarlierFieldOption } from "./intake-field-config-types.js";

  export interface PlaintextField {
    fieldKey: string;
    label: LocalizedText;
    helpText: LocalizedText;
    isRequired: boolean;
    config: IntakeFieldConfig;
    fieldType: IntakeFieldType;
    role: IntakeFieldRole | null;
    routingQueueIds: string[] | null;
    escalationRecipientIds: string[] | null;
    visibleWhen?: VisibleWhen;
  }

  interface IntakeFormEditorProps {
    readonly formId: string | null;
    readonly initialName: string;
    readonly initialSlug: string | null;
    readonly initialIsDefault: boolean;
    readonly initialDestinationQueueId: string | null;
    readonly initialFormMeta: IntakeFormMeta;
    readonly initialFields: readonly PlaintextField[];
    readonly onback: () => void;
    readonly ondeleted: () => void;
    readonly ondirtychange?: (dirty: boolean) => void;
  }

  let {
    formId,
    initialName,
    initialSlug,
    initialIsDefault,
    initialDestinationQueueId,
    initialFormMeta,
    initialFields,
    onback,
    ondeleted,
    ondirtychange,
  }: IntakeFormEditorProps = $props();

  const intakeFormsRouter = requireRouter(trpc.intakeForms, "intakeForms");
  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const queryClient = useQueryClient();
  const orgKeyManager = getOrgKeyManager();
  const orgCache = getOrgDecryptCache();

  // ---- Locale authoring state ----
  let editingLocale = $state<FormLocale>(BASE_LOCALE);
  let previewLocale = $state<FormLocale>(BASE_LOCALE);

  /** Native locale name for display in the segmented control. */
  function localeName(loc: FormLocale): string {
    switch (loc) {
      case "en":
        return "EN";
      case "es":
        return "ES";
    }
  }

  // ---- Form-level state ----
  let formName = $state(initialName);
  let formSlug = $state(initialSlug ?? "");
  let slugError = $state("");
  let isDefault = $state(initialIsDefault);
  let destinationQueueId = $state<string | null>(initialDestinationQueueId);
  let formDescription = $state<LocalizedText>({
    ...initialFormMeta.description,
  });
  let formSubmitMessage = $state<LocalizedText>({
    ...initialFormMeta.submitMessage,
  });
  let formClosedMessage = $state<LocalizedText>({
    ...initialFormMeta.closedMessage,
  });
  let fields = $state<PlaintextField[]>([...initialFields]);

  // ---- Slug validation (mirrors intakeFormSlugSchema from shared) ----

  /** Validate slug format inline. Returns an error string or empty. */
  function validateSlug(slug: string): string {
    if (slug.length === 0) return "";
    if (slug.length < 2) return m.intake_forms_slug_error_length();
    if (slug.length > 80) return m.intake_forms_slug_error_length();
    if (!/^[a-z0-9]/.test(slug) || !/[a-z0-9]$/.test(slug)) {
      return m.intake_forms_slug_error_format();
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return m.intake_forms_slug_error_format();
    }
    if (slug.includes("--")) return m.intake_forms_slug_error_format();
    return "";
  }

  // ---- Dirty tracking ----

  const isDirty = $derived.by((): boolean => {
    if (formName !== initialName) return true;
    if (formSlug !== (initialSlug ?? "")) return true;
    if (isDefault !== initialIsDefault) return true;
    if (destinationQueueId !== initialDestinationQueueId) return true;
    if (fields.length !== initialFields.length) return true;
    // Shallow field comparison: check fieldKeys, labels, required, and types
    for (let i = 0; i < fields.length; i++) {
      const cur = fields.at(i);
      const ini = initialFields.at(i);
      if (cur === undefined || ini === undefined) return true;
      if (cur.fieldKey !== ini.fieldKey) return true;
      if (JSON.stringify(cur.label) !== JSON.stringify(ini.label)) return true;
      if (JSON.stringify(cur.helpText) !== JSON.stringify(ini.helpText))
        return true;
      if (cur.isRequired !== ini.isRequired) return true;
      if (JSON.stringify(cur.config) !== JSON.stringify(ini.config))
        return true;
    }
    // Compare form-level meta
    if (
      JSON.stringify(formDescription) !==
      JSON.stringify(initialFormMeta.description ?? {})
    )
      return true;
    if (
      JSON.stringify(formSubmitMessage) !==
      JSON.stringify(initialFormMeta.submitMessage ?? {})
    )
      return true;
    if (
      JSON.stringify(formClosedMessage) !==
      JSON.stringify(initialFormMeta.closedMessage ?? {})
    )
      return true;
    return false;
  });

  // Notify parent of dirty changes
  $effect(() => {
    ondirtychange?.(isDirty);
  });

  // ---- Per-locale completeness indicator ----

  /** Count how many locales have all field labels, option labels, and meta filled. */
  function localeCompleteness(loc: FormLocale): {
    filled: number;
    total: number;
  } {
    let total = 0;
    let filled = 0;

    // Form-level meta strings (use readLocale to avoid computed key access)
    const descVal = readLocale(formDescription, loc);
    const submitVal = readLocale(formSubmitMessage, loc);
    const closedVal = readLocale(formClosedMessage, loc);

    if (descVal.length > 0) filled++;
    if (submitVal.length > 0) filled++;
    if (closedVal.length > 0) filled++;

    // Only count meta strings that have content in at least one locale
    if (resolveLocalized(formDescription, BASE_LOCALE) != null) total++;
    if (resolveLocalized(formSubmitMessage, BASE_LOCALE) != null) total++;
    if (resolveLocalized(formClosedMessage, BASE_LOCALE) != null) total++;

    // Field labels and help text
    for (const field of fields) {
      total++; // label is always required
      const labelVal = readLocale(field.label, loc);
      if (labelVal.length > 0) filled++;

      // Help text: only count if it exists in any locale
      if (resolveLocalized(field.helpText, BASE_LOCALE) != null) {
        total++;
        const ht = readLocale(field.helpText, loc);
        if (ht.length > 0) filled++;
      }

      // Option labels
      const cfg = field.config;
      if (cfg.type === "select" || cfg.type === "multiselect") {
        for (const opt of cfg.options) {
          total++;
          const label = resolveLocalized(opt.label, loc);
          if (label != null && label.length > 0) filled++;
        }
      }
    }

    return { filled, total };
  }

  // ---- Field config sheet state ----
  let configSheetOpened = $state(false);
  let configFieldIndex = $state(-1);
  let configFieldIsNew = $state(false);
  let configFieldType = $state<IntakeFieldType>("text");
  const defaultConfigInitial: FieldConfigInitial = {
    label: {},
    helpText: {},
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

  // ---- Localized text helpers ----

  /** Read a locale key from a LocalizedText object. */
  function readLocale(text: LocalizedText, loc: FormLocale): string {
    if (loc === "en") return text.en ?? "";
    return text.es ?? "";
  }

  /** Return a new LocalizedText with one locale key set. */
  function setLocaleText(
    text: LocalizedText,
    loc: FormLocale,
    value: string,
  ): LocalizedText {
    if (loc === "en") return { ...text, en: value };
    return { ...text, es: value };
  }

  /** True if a LocalizedText has content in any locale. */
  function hasContent(text: LocalizedText): boolean {
    const en = text.en;
    const es = text.es;
    return (
      (en != null && en.trim().length > 0) ||
      (es != null && es.trim().length > 0)
    );
  }

  /** Strip empty-string locale entries from a LocalizedText for storage. */
  function trimLocalized(text: LocalizedText): LocalizedText {
    const result: LocalizedText = {};
    const en = text.en;
    const es = text.es;
    if (en != null && en.trim().length > 0) result.en = en.trim();
    if (es != null && es.trim().length > 0) result.es = es.trim();
    return result;
  }

  // Save mutation
  const saveMutation = createMutation(() => ({
    mutationFn: async (input: {
      formId: string | null;
      name: string;
      slug: string | null;
      isDefault: boolean;
      destinationQueueId: string | null;
      formMeta: IntakeFormMeta;
      fields: PlaintextField[];
    }) => {
      const orgPub = orgKeyManager.getPublicKey();
      if (!orgPub) {
        throw new Error("Org key not loaded");
      }

      const encryptedFields = input.fields.map((f) => {
        const encrypted = encryptFieldContent(
          {
            label: f.label,
            config: f.config,
            visibleWhen: f.visibleWhen,
          },
          orgPub,
        );
        return {
          fieldKey: f.fieldKey,
          fieldType: f.fieldType,
          encryptedLabel: encrypted.encryptedLabel,
          encryptedConfig: encrypted.encryptedConfig,
          isRequired: f.isRequired,
          role: f.role ?? undefined,
          routingQueueIds: f.routingQueueIds ?? undefined,
          escalationRecipientIds: f.escalationRecipientIds ?? undefined,
        };
      });

      const encryptedFormMeta = encryptFormMeta(input.formMeta, orgPub);

      return intakeFormsRouter.save.mutate({
        formId: input.formId,
        name: input.name,
        slug: input.slug,
        isDefault: input.isDefault,
        destinationQueueId: input.destinationQueueId,
        ...(encryptedFormMeta != null ? { encryptedFormMeta } : {}),
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
      slugError = validateSlug(target.value);
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

  /**
   * Build the list of earlier fields eligible for conditional visibility rules.
   * Only select, multiselect, and checkbox fields appearing before the given
   * index qualify.
   */
  function buildEarlierFields(beforeIndex: number): EarlierFieldOption[] {
    const result: EarlierFieldOption[] = [];
    for (let i = 0; i < beforeIndex && i < fields.length; i++) {
      const f = fields.at(i);
      if (f === undefined) continue;
      if (
        f.fieldType !== "select" &&
        f.fieldType !== "multiselect" &&
        f.fieldType !== "checkbox"
      )
        continue;
      const label = resolveLocalized(f.label, BASE_LOCALE) ?? f.fieldKey;
      const cfg = f.config;
      let fieldOptions: { key: string; label: string }[] | undefined;
      if (cfg.type === "select" || cfg.type === "multiselect") {
        fieldOptions = cfg.options.map((o: IntakeOption) => ({
          key: o.key,
          label: resolveLocalized(o.label, BASE_LOCALE) ?? o.key,
        }));
      }
      result.push({
        fieldKey: f.fieldKey,
        label,
        fieldType: f.fieldType,
        options: fieldOptions,
      });
    }
    return result;
  }

  let configEarlierFields = $state<EarlierFieldOption[]>([]);

  function openConfigSheet(index: number, isNew = false): void {
    const field = fields.at(index);
    if (field === undefined) return;
    configFieldIsNew = isNew;
    configFieldIndex = index;
    configFieldType = field.fieldType;
    configEarlierFields = buildEarlierFields(index);
    configFieldInitial = {
      label: { ...field.label },
      helpText: { ...field.helpText },
      isRequired: field.isRequired,
      config: field.config,
      role: field.role,
      escalationRecipientIds: field.escalationRecipientIds,
      visibleWhen: field.visibleWhen,
    };
    configSheetOpened = true;
  }

  function handleConfigCancel(): void {
    configSheetOpened = false;
    // A field canceled out of its initial configuration was never really
    // created; drop it instead of leaving an unconfigured stub in the list.
    if (configFieldIsNew && configFieldIndex >= 0) {
      fields = fields.filter((_, i) => i !== configFieldIndex);
    }
    configFieldIsNew = false;
  }

  function handleConfigDone(result: FieldConfigState): void {
    configSheetOpened = false;
    configFieldIsNew = false;
    if (configFieldIndex >= 0 && configFieldIndex < fields.length) {
      fields = fields.map((f, i) => {
        if (i !== configFieldIndex) return f;
        const updated: PlaintextField = {
          fieldKey: f.fieldKey,
          fieldType: f.fieldType,
          label: result.label,
          helpText: result.helpText,
          isRequired: result.isRequired,
          config: result.config,
          role: result.role,
          routingQueueIds: result.routingQueueIds,
          escalationRecipientIds: result.escalationRecipientIds,
          visibleWhen: result.visibleWhen,
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

    const defaultConfig = getDefaultConfig(type);

    // Mint a stable UUID for this field (preserved across saves).
    const newField: PlaintextField = {
      fieldKey: crypto.randomUUID(),
      label: {},
      helpText: {},
      isRequired: false,
      config: defaultConfig,
      fieldType: type,
      role: null,
      routingQueueIds: null,
      escalationRecipientIds: null,
    };

    fields = [...fields, newField];

    const newIndex = fields.length - 1;
    setTimeout(() => openConfigSheet(newIndex, true), 0);
  }

  function getDefaultConfig(type: IntakeFieldType): IntakeFieldConfig {
    switch (type) {
      case "text":
        return { type: "text" };
      case "textarea":
        return { type: "textarea" };
      case "select":
        return {
          type: "select",
          options: [{ key: crypto.randomUUID(), label: { en: "" } }],
        };
      case "multiselect":
        return {
          type: "multiselect",
          options: [{ key: crypto.randomUUID(), label: { en: "" } }],
        };
      case "checkbox":
        return { type: "checkbox" };
      case "availability":
        return {
          type: "availability",
          allowRecurring: true,
          allowSpecific: true,
        };
      case "date":
        return { type: "date" };
      case "pageBreak":
        return { type: "pageBreak" };
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
      case "date":
        return m.intake_forms_field_type_date();
      case "pageBreak":
        return m.intake_forms_field_type_page_break();
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
      case "date":
        return m.intake_forms_field_type_date_desc();
      case "pageBreak":
        return m.intake_forms_field_type_page_break_desc();
    }
  }

  /** Resolve a field label in the base locale for display in the field list. */
  function fieldDisplayLabel(field: PlaintextField): string {
    return resolveLocalized(field.label, BASE_LOCALE) ?? "";
  }

  /** Resolve a page break label in the preview locale, with a fallback. */
  function pageBreakLabel(field: PlaintextField): string {
    const resolved = resolveLocalized(field.label, previewLocale);
    if (resolved != null && resolved.length > 0) return resolved;
    return m.intake_forms_page_break_divider();
  }

  function handleSave(): void {
    if (!formName.trim() || fields.length === 0) return;
    // Check slug validity before saving
    const sv = formSlug.trim();
    if (sv.length > 0) {
      const err = validateSlug(sv);
      if (err.length > 0) {
        slugError = err;
        return;
      }
    }
    const slugValue = sv || null;
    const desc = trimLocalized(formDescription);
    const submit = trimLocalized(formSubmitMessage);
    const closed = trimLocalized(formClosedMessage);
    const meta: IntakeFormMeta = {
      ...(hasContent(desc) ? { description: desc } : {}),
      ...(hasContent(submit) ? { submitMessage: submit } : {}),
      ...(hasContent(closed) ? { closedMessage: closed } : {}),
    };
    saveMutation.mutate({
      formId,
      name: formName.trim(),
      slug: slugValue,
      isDefault,
      destinationQueueId,
      formMeta: meta,
      fields,
    });
  }

  const fieldTypes: IntakeFieldType[] = [
    "text",
    "textarea",
    "select",
    "multiselect",
    "checkbox",
    "date",
    "availability",
    "pageBreak",
  ];

  const canSave = $derived(
    formName.trim().length > 0 &&
      fields.length > 0 &&
      !saveMutation.isPending &&
      slugError.length === 0,
  );
</script>

<List strong inset>
  <ListInput
    label={m.intake_forms_name_label()}
    type="text"
    placeholder={m.intake_forms_name_placeholder()}
    value={formName}
    onInput={handleNameInput}
  />
  <ListInput
    label={m.intake_forms_slug_label()}
    type="text"
    placeholder={m.intake_forms_slug_placeholder()}
    info={slugError || m.intake_forms_slug_hint()}
    error={slugError}
    value={formSlug}
    onInput={handleSlugInput}
  />
  {#if queuesQuery.data}
    <ListInput
      label={m.intake_forms_destination_label()}
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
  {/if}
</List>

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

<!-- Locale selector for authoring -->
<BlockTitle>{m.intake_forms_locale_heading()}</BlockTitle>
<Block>
  <Segmented strong>
    {#each FORM_LOCALES as loc (loc)}
      {@const comp = localeCompleteness(loc)}
      <SegmentedButton
        active={editingLocale === loc}
        onclick={() => (editingLocale = loc)}
      >
        {localeName(loc)}
        {#if comp.total > 0}
          <span class="locale-badge">{comp.filled}/{comp.total}</span>
        {/if}
      </SegmentedButton>
    {/each}
  </Segmented>
  {#if editingLocale !== BASE_LOCALE}
    <p class="locale-hint">{m.intake_forms_locale_optional_hint()}</p>
  {/if}
</Block>

<!-- Form-level descriptive content -->
<BlockTitle>{m.intake_forms_content_heading()}</BlockTitle>
<List strong inset>
  <ListInput
    label={m.intake_forms_description_label()}
    type="textarea"
    placeholder={m.intake_forms_description_placeholder()}
    info={m.intake_forms_description_hint()}
    value={readLocale(formDescription, editingLocale)}
    onInput={(e: Event) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        formDescription = setLocaleText(
          formDescription,
          editingLocale,
          e.target.value,
        );
    }}
  />
  <ListInput
    label={m.intake_forms_submit_message_label()}
    type="textarea"
    placeholder={m.intake_forms_submit_message_placeholder()}
    info={m.intake_forms_submit_message_hint()}
    value={readLocale(formSubmitMessage, editingLocale)}
    onInput={(e: Event) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        formSubmitMessage = setLocaleText(
          formSubmitMessage,
          editingLocale,
          e.target.value,
        );
    }}
  />
  <ListInput
    label={m.intake_forms_closed_message_label()}
    type="textarea"
    placeholder={m.intake_forms_closed_message_placeholder()}
    info={m.intake_forms_closed_message_hint()}
    value={readLocale(formClosedMessage, editingLocale)}
    onInput={(e: Event) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        formClosedMessage = setLocaleText(
          formClosedMessage,
          editingLocale,
          e.target.value,
        );
    }}
  />
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
  {#each fields as field, index (field.fieldKey)}
    <ListItem
      title={`${String(index + 1)}. ${fieldDisplayLabel(field) || getFieldTypeLabel(field.fieldType)}`}
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
    <div class="preview-locale-switcher">
      <Segmented strong>
        {#each FORM_LOCALES as loc (loc)}
          <SegmentedButton
            active={previewLocale === loc}
            onclick={() => (previewLocale = loc)}
          >
            {localeName(loc)}
          </SegmentedButton>
        {/each}
      </Segmented>
    </div>
    {#each fields as field, index (field.fieldKey)}
      {#if field.fieldType === "pageBreak"}
        <div class="preview-page-break" role="separator">
          <hr class="preview-page-break-line" />
          <span class="preview-page-break-label">
            {pageBreakLabel(field)}
          </span>
          <hr class="preview-page-break-line" />
        </div>
      {:else}
        <IntakeFieldRenderer
          fieldId={`preview-${String(index)}`}
          label={resolveLocalized(field.label, previewLocale) ?? ""}
          helpText={resolveLocalized(field.helpText, previewLocale)}
          config={field.config}
          isRequired={field.isRequired}
          locale={previewLocale}
          value={undefined}
          onchange={previewNoop}
        />
      {/if}
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
  {editingLocale}
  earlierFields={configEarlierFields}
  ondone={handleConfigDone}
  ondismiss={handleConfigCancel}
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

  .locale-badge {
    font-size: var(--text-xs);
    margin-left: 4px;
    opacity: 0.7;
  }

  .locale-hint {
    font-size: var(--text-xs);
    color: var(--muted);
    margin-top: var(--space-xs);
    text-align: center;
  }

  .preview-locale-switcher {
    margin-bottom: var(--space-md);
  }

  .preview-page-break {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md) 0;
  }

  .preview-page-break-line {
    flex: 1;
    border: none;
    border-top: 1px dashed var(--hair);
  }

  .preview-page-break-label {
    flex-shrink: 0;
    font-size: var(--text-xs);
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
