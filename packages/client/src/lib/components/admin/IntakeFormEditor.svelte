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
  import { untrack } from "svelte";
  import { ArrowUp, ArrowDown, Settings, X, Copy, Eye } from "@lucide/svelte";
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
  import {
    intakeFormKeys,
    queueKeys,
    volunteerKeys,
    adminKeys,
  } from "$lib/query/keys.js";
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
  import SplitView from "$lib/shell/SplitView.svelte";
  import { layoutMode } from "$lib/stores/layout-mode.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import IntakeFieldConfigSheet from "./IntakeFieldConfigSheet.svelte";
  import {
    getFieldTypeLabel,
    getFieldTypeDesc,
    getRoleLabel,
  } from "./intake-field-labels.js";
  import {
    readLocale,
    setLocaleText,
    hasContent,
    trimLocalized,
  } from "$lib/utils/localized-text.js";
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
    /** ISO 8601 datetime string or null when no closing date is set. */
    readonly initialClosesAt: string | null;
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
    initialClosesAt,
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

  type PreviewState = "form" | "submitted" | "closed";
  let previewState = $state<PreviewState>("form");

  const isDesktop = $derived(layoutMode.isDesktop);

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

  /**
   * Convert an ISO 8601 datetime string to the datetime-local input format
   * (YYYY-MM-DDThh:mm). datetime-local inputs work in the browser's local
   * timezone, so we produce a local representation.
   */
  function isoToDatetimeLocal(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const year = String(d.getFullYear()).padStart(4, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  let closesAtLocal = $state(
    initialClosesAt != null ? isoToDatetimeLocal(initialClosesAt) : "",
  );

  let fields = $state<PlaintextField[]>([...initialFields]);

  // F-002: Track whether the user has manually edited the slug field.
  // When false, typing in the name field auto-generates the slug.
  // untrack: intentionally captures the initial prop value once.
  let slugTouched = $state(
    untrack(() => initialSlug != null && initialSlug.length > 0),
  );

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
    const initialClosesAtLocal =
      initialClosesAt != null ? isoToDatetimeLocal(initialClosesAt) : "";
    if (closesAtLocal !== initialClosesAtLocal) return true;
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
    fieldType: "text",
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

  // Query the org's default intake queue id for the destination label (F-008)
  const orgRouter = trpc.org;
  const intakeQueueQuery = createQuery(() => ({
    queryKey: adminKeys.intakeQueue(),
    queryFn: async () => orgRouter.getIntakeQueue.query(),
  }));

  /**
   * Resolve the label for the "default intake queue" option.
   * Names the queue it resolves to (e.g. "Default intake queue (Intake)")
   * and falls back to the generic label when the queue id is null or
   * the queue is not in the loaded list.
   */
  const defaultQueueLabel = $derived.by((): string => {
    const intakeQueueId = intakeQueueQuery.data?.queueId ?? null;
    if (intakeQueueId === null || queuesQuery.data == null) {
      return m.intake_forms_destination_none();
    }
    const match = queuesQuery.data.find(
      (q: { id: string }) => q.id === intakeQueueId,
    );
    if (match == null) {
      return m.intake_forms_destination_none();
    }
    const name = getQueueName(match);
    return m.intake_forms_destination_default_named({ name });
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
      closesAt: string | null;
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
        closesAt: input.closesAt,
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
      // Auto-suggest slug while creating a new form, until the user
      // manually edits the slug field (tracked by slugTouched).
      if (formId === null && !slugTouched) {
        formSlug = suggestSlug(target.value);
      }
    }
  }

  function handleSlugInput(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      slugTouched = true;
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
      fieldType: field.fieldType,
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
          fieldType: result.fieldType,
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

  /** Resolve a field label in the base locale for display in the field list. */
  function fieldDisplayLabel(field: PlaintextField): string {
    return resolveLocalized(field.label, BASE_LOCALE) ?? "";
  }

  /** Get a human-readable label for a text subtype. */
  function getSubtypeLabel(sub: string): string {
    switch (sub) {
      case "email":
        return m.intake_forms_config_subtype_email();
      case "phone":
        return m.intake_forms_config_subtype_phone();
      case "number":
        return m.intake_forms_config_subtype_number();
      default:
        return "";
    }
  }

  /**
   * Build a detailed subtitle for a field list row (F-009).
   * Includes type (with subtype), role, condition dependency, help text
   * preview, and type-specific config (option count, min/max, max length).
   */
  function buildFieldSubtitle(field: PlaintextField): string {
    const parts: string[] = [];

    // Type line; text fields show their subtype instead of the base type
    const cfg = field.config;
    if (cfg.type === "text" && cfg.subtype != null) {
      const subtypeLabel = getSubtypeLabel(cfg.subtype);
      if (subtypeLabel.length > 0) {
        parts.push(
          m.intake_forms_field_row_subtype({
            type: getFieldTypeLabel(field.fieldType),
            subtype: subtypeLabel,
          }),
        );
      } else {
        parts.push(getFieldTypeLabel(field.fieldType));
      }
    } else {
      // Only show the type in subtitle if the title is not already the type
      // (untitled fields show the type as title, so skip it here to avoid repetition)
      const label = fieldDisplayLabel(field);
      if (label.length > 0) {
        parts.push(getFieldTypeLabel(field.fieldType));
      }
    }

    // Role
    if (field.role != null) {
      parts.push(
        m.intake_forms_field_row_role({ role: getRoleLabel(field.role) }),
      );
    }

    // Condition dependency
    const firstRule =
      field.visibleWhen != null && field.visibleWhen.rules.length > 0
        ? field.visibleWhen.rules.at(0)
        : undefined;
    if (firstRule != null) {
      const depKey = firstRule.fieldKey;
      const depField = fields.find((f) => f.fieldKey === depKey);
      const depLabel =
        depField != null
          ? (resolveLocalized(depField.label, BASE_LOCALE) ?? depField.fieldKey)
          : depKey;
      parts.push(m.intake_forms_field_row_conditional({ field: depLabel }));
    }

    // Type-specific config
    if (
      (cfg.type === "select" || cfg.type === "multiselect") &&
      cfg.options.length > 0
    ) {
      parts.push(
        m.intake_forms_field_row_options_count({
          count: String(cfg.options.length),
        }),
      );
    }
    if (
      cfg.type === "text" &&
      cfg.subtype === "number" &&
      cfg.numberRange != null
    ) {
      const nr = cfg.numberRange;
      if (nr.min !== undefined && nr.max !== undefined) {
        parts.push(
          m.intake_forms_field_row_min_max({
            min: String(nr.min),
            max: String(nr.max),
          }),
        );
      } else if (nr.min !== undefined) {
        parts.push(m.intake_forms_field_row_min_only({ min: String(nr.min) }));
      } else if (nr.max !== undefined) {
        parts.push(m.intake_forms_field_row_max_only({ max: String(nr.max) }));
      }
    }
    if (
      (cfg.type === "text" || cfg.type === "textarea") &&
      cfg.maxLength != null
    ) {
      parts.push(
        m.intake_forms_field_row_max_length({ max: String(cfg.maxLength) }),
      );
    }

    // Truncated help text preview
    const ht = resolveLocalized(field.helpText, BASE_LOCALE);
    if (ht != null && ht.length > 0) {
      const truncated = ht.length > 40 ? ht.slice(0, 40) + "..." : ht;
      parts.push(truncated);
    }

    return parts.join(" · ");
  }

  /**
   * Build the title for a field row. Uses per-page numbering (F-009).
   * Page breaks get their label, input fields get "N. Label" or
   * "N. TypeLabel" for untitled fields. The required marker is an
   * asterisk matching the renderer convention.
   */
  function buildFieldTitle(field: PlaintextField, fieldNumber: number): string {
    const label = fieldDisplayLabel(field);
    const requiredMarker = field.isRequired ? " *" : "";
    const displayName =
      label.length > 0 ? label : getFieldTypeLabel(field.fieldType);
    return `${String(fieldNumber)}. ${displayName}${requiredMarker}`;
  }

  /**
   * Compute per-page field numbering. Returns an array parallel to `fields`
   * where each entry is either { kind: 'field', number, page } or
   * { kind: 'pageBreak', page }.
   */
  const fieldNumbering = $derived.by(
    (): { kind: "field" | "pageBreak"; number: number; page: number }[] => {
      const result: {
        kind: "field" | "pageBreak";
        number: number;
        page: number;
      }[] = [];
      let page = 1;
      let fieldNum = 1;
      for (const field of fields) {
        if (field.fieldType === "pageBreak") {
          result.push({ kind: "pageBreak", number: 0, page });
          page++;
          fieldNum = 1;
        } else {
          result.push({ kind: "field", number: fieldNum, page });
          fieldNum++;
        }
      }
      return result;
    },
  );

  /** True when page breaks exist, so page numbers should be shown. */
  const hasPageBreaks = $derived(
    fields.some((f) => f.fieldType === "pageBreak"),
  );

  /** Preview-locale-resolved form meta for the preview pane. */
  const previewDescription = $derived(
    resolveLocalized(formDescription, previewLocale),
  );
  const previewSubmitMsg = $derived(
    resolveLocalized(formSubmitMessage, previewLocale),
  );
  const previewClosedMsg = $derived(
    resolveLocalized(formClosedMessage, previewLocale),
  );

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
    // Convert datetime-local to ISO 8601 for the server, or null to clear.
    const closesAtValue =
      closesAtLocal.length > 0 ? new Date(closesAtLocal).toISOString() : null;

    saveMutation.mutate({
      formId,
      name: formName.trim(),
      slug: slugValue,
      isDefault,
      destinationQueueId,
      closesAt: closesAtValue,
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

{#snippet editorContent()}
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
        <option value="">{defaultQueueLabel}</option>
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

  <!-- Closing date (locale-independent, sits above locale switcher per F-006) -->
  <BlockTitle>{m.intake_forms_closes_at_heading()}</BlockTitle>
  <List strong inset>
    <ListInput
      label={m.intake_forms_closes_at_label()}
      type="datetime-local"
      info={m.intake_forms_closes_at_hint_with_message()}
      value={closesAtLocal}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement)
          closesAtLocal = e.target.value;
      }}
    />
    {#if closesAtLocal.length > 0}
      <ListItem>
        {#snippet after()}
          <Button
            outline
            small
            onclick={() => {
              closesAtLocal = "";
            }}
          >
            {m.intake_forms_closes_at_clear()}
          </Button>
        {/snippet}
      </ListItem>
    {/if}
  </List>

  <!-- Share link (locale-independent, sits above locale switcher per F-006) -->
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

  <!-- Form-level descriptive content (locale-dependent) -->
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

  <!-- Field list (F-009: enriched rows, per-page numbering, page break separators) -->
  <BlockTitle>
    {m.intake_forms_fields_heading({ count: String(fields.length) })}
  </BlockTitle>
  <List strong inset>
    {#each fields as field, index (field.fieldKey)}
      {@const numbering = fieldNumbering.at(index)}
      {#if field.fieldType === "pageBreak"}
        <!-- Page break rendered as a separator row, not a numbered field -->
        <ListItem
          title={fieldDisplayLabel(field) ||
            m.intake_forms_field_type_page_break()}
        >
          {#snippet subtitle()}
            {#if hasPageBreaks && numbering != null}
              <span class="page-break-subtitle">
                {m.intake_forms_field_row_page_number({
                  page: String(numbering.page + 1),
                })}
              </span>
            {/if}
          {/snippet}
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
      {:else}
        {@const fieldNum = numbering?.number ?? index + 1}
        {@const title = buildFieldTitle(field, fieldNum)}
        {@const subtitle = buildFieldSubtitle(field)}
        <ListItem
          {title}
          {subtitle}
          aria-label={title +
            (field.isRequired ? `, ${m.intake_forms_field_required()}` : "")}
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
      {/if}
    {/each}
  </List>

  <Block>
    <Button outline onclick={openAddFieldSheet}>
      {m.intake_forms_add_field()}
    </Button>
  </Block>

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
{/snippet}

{#snippet previewContent()}
  {#if fields.length === 0}
    <div class="preview-empty-wrapper" data-testid="preview-empty-state">
      <EmptyState
        icon={Eye}
        title={m.intake_forms_preview_empty_title()}
        subtitle={m.intake_forms_preview_empty_subtitle()}
      />
    </div>
  {:else}
    <BlockTitle>{m.intake_forms_preview()}</BlockTitle>
    <Block>
      <div class="preview-state-switcher" data-testid="preview-state-switcher">
        <Segmented strong>
          <SegmentedButton
            active={previewState === "form"}
            onclick={() => (previewState = "form")}
          >
            {m.intake_forms_preview_state_form()}
          </SegmentedButton>
          <SegmentedButton
            active={previewState === "submitted"}
            onclick={() => (previewState = "submitted")}
          >
            {m.intake_forms_preview_state_submitted()}
          </SegmentedButton>
          <SegmentedButton
            active={previewState === "closed"}
            onclick={() => (previewState = "closed")}
          >
            {m.intake_forms_preview_state_closed()}
          </SegmentedButton>
        </Segmented>
      </div>
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

      {#if previewState === "form"}
        <!-- Description above fields, mirroring public page placement -->
        {#if previewDescription}
          <p class="preview-description">{previewDescription}</p>
        {/if}
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
      {:else if previewState === "submitted"}
        <!-- Success state, mirrors IntakeFormBody submitted layout -->
        <h2 class="intake-preview-success-heading">
          {m.intake_success_heading()}
        </h2>
        <p class="intake-preview-success-body">
          {previewSubmitMsg ?? m.intake_success_body()}
        </p>
        <p class="intake-preview-reference-label">
          {m.intake_reference_label()}
        </p>
        <code class="intake-preview-reference-code"
          >{m.intake_forms_preview_reference_placeholder()}</code
        >
        <p class="intake-preview-reference-save">{m.intake_reference_save()}</p>
      {:else}
        <!-- Closed state, mirrors IntakeFormBody closed layout -->
        <p class="intake-preview-closed" role="status">
          {previewClosedMsg ?? m.intake_form_closed_default()}
        </p>
      {/if}
    </Block>
  {/if}
{/snippet}

{#if isDesktop}
  <SplitView>
    {#snippet left()}
      <div class="editor-pane-inner">
        {@render editorContent()}
      </div>
    {/snippet}
    {#snippet right()}
      <div class="preview-pane-inner">
        {@render previewContent()}
      </div>
    {/snippet}
  </SplitView>
{:else}
  <!-- Mobile stacked layout: editor then preview stacked -->
  {@render editorContent()}
  {@render previewContent()}
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

  .editor-pane-inner {
    padding: var(--space-sm);
    overflow-y: auto;
    height: 100%;
  }

  .preview-pane-inner {
    padding: var(--space-sm);
    overflow-y: auto;
    height: 100%;
  }

  .preview-empty-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    height: 100%;
  }

  .preview-state-switcher {
    margin-bottom: var(--space-sm);
  }

  .preview-locale-switcher {
    margin-bottom: var(--space-md);
  }

  .preview-description {
    color: var(--muted);
    font-size: var(--text-sm);
    line-height: 1.5;
    white-space: pre-line;
    margin-bottom: var(--space-md);
  }

  .intake-preview-success-heading {
    font-size: var(--text-md);
    font-weight: 600;
    color: var(--ink);
    margin: 0 0 var(--space-sm);
  }

  .intake-preview-success-body {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
  }

  .intake-preview-reference-label {
    font-size: var(--text-sm);
    color: var(--ink);
    margin: var(--space-md) 0 var(--space-xs);
  }

  .intake-preview-reference-code {
    display: block;
    font-size: var(--text-base);
    font-weight: 600;
    padding: var(--space-sm) var(--space-md);
    background: var(--raised);
    border-radius: 8px;
    text-align: center;
    margin: 0 0 var(--space-sm);
  }

  .intake-preview-reference-save {
    font-size: var(--text-sm);
    color: var(--muted);
  }

  .intake-preview-closed {
    color: var(--muted);
    font-size: var(--text-sm);
    line-height: 1.5;
    text-align: center;
    padding: var(--space-xl) 0;
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

  .page-break-subtitle {
    font-size: var(--text-xs);
    color: var(--muted);
    font-style: italic;
  }
</style>
