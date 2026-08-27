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
    Preloader,
  } from "konsta/svelte";
  import { untrack } from "svelte";
  import {
    ArrowUp,
    ArrowDown,
    Settings,
    X,
    Copy,
    Eye,
    ImagePlus,
    Trash2,
  } from "@lucide/svelte";
  import {
    createMutation,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import {
    resolveLocalized,
    BASE_LOCALE,
    FORM_LOCALES,
    KB_ATTACHMENT_MAX_BYTES,
    FORM_ASSET_CONTENT_TYPES,
    type IntakeFieldConfig,
    type IntakeFieldType,
    type IntakeFieldRole,
    type IntakeFormMeta,
    type LocalizedText,
    type LocalizedRichText,
    type FormLocale,
  } from "@care-y/shared";
  import { encryptClientBranding, encode } from "@care-y/crypto";
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
  import FormContentEditor from "./FormContentEditor.svelte";
  import {
    getFieldTypeLabel,
    getFieldTypeDesc,
    getRoleLabel,
  } from "./intake-field-labels.js";
  import {
    readLocale,
    hasRichValue,
    hasAnyRichContent,
    trimLocalizedRichText,
    richValueJsonSize,
  } from "$lib/utils/localized-text.js";
  import {
    renderFormRichText,
    rewriteFormAssetUrls,
  } from "$lib/utils/render-form-content.js";
  import { getOrgSlug } from "$lib/utils/org-slug.js";
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
  let formDescription = $state<LocalizedRichText>(
    initialFormMeta.description ?? {},
  );
  let formSubmitMessage = $state<LocalizedRichText>(
    initialFormMeta.submitMessage ?? {},
  );
  let formClosedMessage = $state<LocalizedRichText>(
    initialFormMeta.closedMessage ?? {},
  );

  // ---- Banner state ----
  let bannerBlobKey = $state<string | null>(
    initialFormMeta.bannerBlobKey ?? null,
  );
  let bannerAlt = $state(initialFormMeta.bannerAlt ?? "");
  let bannerUploading = $state(false);

  const orgSlug = getOrgSlug();

  /** Per-locale 30K cap. */
  const RICH_TEXT_LOCALE_CAP = 30_000;

  type ContentCapField = "description" | "submitMessage" | "closedMessage";

  interface ContentCapErrors {
    description?: string;
    submitMessage?: string;
    closedMessage?: string;
  }

  /** Validation errors for the three rich text fields. */
  let contentCapErrors = $state<ContentCapErrors>({});

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
    // Compare form-level meta (rich text maps via JSON serialization)
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
    // Banner
    if (bannerBlobKey !== (initialFormMeta.bannerBlobKey ?? null)) return true;
    if (bannerAlt !== (initialFormMeta.bannerAlt ?? "")) return true;
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

    // Form-level rich text meta (rich-aware emptiness check)
    // eslint-disable-next-line security/detect-object-injection -- loc is from FormLocale enum
    const descVal = formDescription[loc];
    // eslint-disable-next-line security/detect-object-injection -- loc is from FormLocale enum
    const submitVal = formSubmitMessage[loc];
    // eslint-disable-next-line security/detect-object-injection -- loc is from FormLocale enum
    const closedVal = formClosedMessage[loc];

    if (descVal !== undefined && hasRichValue(descVal)) filled++;
    if (submitVal !== undefined && hasRichValue(submitVal)) filled++;
    if (closedVal !== undefined && hasRichValue(closedVal)) filled++;

    // Only count meta fields that have content in at least one locale
    if (hasAnyRichContent(formDescription)) total++;
    if (hasAnyRichContent(formSubmitMessage)) total++;
    if (hasAnyRichContent(formClosedMessage)) total++;

    // Field labels, help text, and rich text bodies
    for (const field of fields) {
      // Rich text blocks have body content instead of a label
      if (field.fieldType === "richText") {
        const cfg = field.config;
        if (cfg.type === "richText" && hasAnyRichContent(cfg.body)) {
          total++;
          // eslint-disable-next-line security/detect-object-injection -- loc is from FormLocale enum
          const bodyVal = cfg.body[loc];
          if (bodyVal !== undefined && hasRichValue(bodyVal)) filled++;
        }
        continue;
      }

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
      case "richText":
        return { type: "richText", body: {} };
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
    (): {
      kind: "field" | "pageBreak" | "richText";
      number: number;
      page: number;
    }[] => {
      const result: {
        kind: "field" | "pageBreak" | "richText";
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
        } else if (field.fieldType === "richText") {
          result.push({ kind: "richText", number: 0, page });
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

  /**
   * Resolve the preview-locale value from a LocalizedRichText map.
   * Falls back to the base locale. Returns the raw value (string or doc JSON)
   * for renderFormRichText, or undefined if no content.
   */
  function resolveRichPreview(
    richText: LocalizedRichText,
    loc: FormLocale,
  ): string | { type: "doc"; content: unknown[] } | undefined {
    // eslint-disable-next-line security/detect-object-injection -- loc is from FormLocale enum
    const direct = richText[loc];
    if (direct !== undefined && hasRichValue(direct)) return direct;
    if (loc !== BASE_LOCALE) {
      const fallback = richText.en;
      if (fallback !== undefined && hasRichValue(fallback)) return fallback;
    }
    return undefined;
  }

  /** Render to sanitized HTML with form-asset image URLs resolved. */
  function renderPreviewHtml(
    value: string | { type: "doc"; content: unknown[] } | undefined,
  ): string {
    const html = renderFormRichText(value);
    if (html.length === 0 || orgSlug == null) return html;
    return rewriteFormAssetUrls(html, orgSlug);
  }

  /** Preview-locale-resolved form meta rendered to sanitized HTML. */
  const previewDescriptionHtml: string = $derived(
    renderPreviewHtml(resolveRichPreview(formDescription, previewLocale)),
  );
  const previewSubmitMsgHtml: string = $derived(
    renderPreviewHtml(resolveRichPreview(formSubmitMessage, previewLocale)),
  );
  const previewClosedMsgHtml: string = $derived(
    renderPreviewHtml(resolveRichPreview(formClosedMessage, previewLocale)),
  );

  /** Banner preview URL (same-origin, via the form-asset serving endpoint). */
  const bannerPreviewUrl = $derived.by((): string | null => {
    if (bannerBlobKey == null || orgSlug == null) return null;
    return `/api/forms/${orgSlug}/${bannerBlobKey}`;
  });

  /**
   * Extract a short plain-text preview from a richText field body for the
   * field list row. Tries the base locale first. Returns up to 60 chars
   * with an ellipsis if truncated.
   */
  function richTextBodyPreview(field: PlaintextField): string {
    if (field.config.type !== "richText") return "";
    const body = field.config.body;

    // Try base locale first, then any locale
    const value = body.en ?? body.es;
    if (value === undefined) return m.intake_forms_rich_text_preview_empty();

    let plain: string;
    if (typeof value === "string") {
      plain = value;
    } else if (
      typeof value === "object" &&
      "content" in value &&
      Array.isArray(value.content)
    ) {
      // Walk the doc tree to extract text nodes
      plain = extractDocText(value.content);
    } else {
      return m.intake_forms_rich_text_preview_empty();
    }

    const trimmed = plain.trim();
    if (trimmed.length === 0) return m.intake_forms_rich_text_preview_empty();
    if (trimmed.length > 60) return trimmed.slice(0, 60) + "...";
    return trimmed;
  }

  /** Type guard for unknown arrays, keeps eslint unsafe-argument quiet. */
  function isUnknownArray(candidate: unknown): candidate is readonly unknown[] {
    return Array.isArray(candidate);
  }

  /** Recursively extract text from ProseMirror doc content nodes. */
  function extractDocText(content: readonly unknown[]): string {
    const parts: string[] = [];
    for (const node of content) {
      if (typeof node !== "object" || node === null) continue;
      if ("text" in node && typeof node.text === "string") {
        parts.push(node.text);
      }
      if ("content" in node && isUnknownArray(node.content)) {
        parts.push(extractDocText(node.content));
      }
    }
    return parts.join(" ");
  }

  // ---- Field-level rich text body cap validation ----

  /**
   * Track per-field body cap errors by fieldKey. Cleared on successful
   * validation, set when a field's body exceeds the locale cap.
   */
  let fieldBodyCapErrors = $state<Record<string, string | undefined>>({});

  /**
   * Validate per-locale 30K cap on a richText field's body.
   * Returns true if all locales pass.
   */
  function validateFieldBodyCap(field: PlaintextField): boolean {
    if (field.config.type !== "richText") return true;
    const capMsg = m.intake_forms_content_cap_error({
      max: String(RICH_TEXT_LOCALE_CAP),
    });
    for (const loc of FORM_LOCALES) {
      // eslint-disable-next-line security/detect-object-injection -- loc is from the FORM_LOCALES const tuple
      const v = field.config.body[loc];
      if (v !== undefined && richValueJsonSize(v) > RICH_TEXT_LOCALE_CAP) {
        fieldBodyCapErrors = {
          ...fieldBodyCapErrors,
          [field.fieldKey]: capMsg,
        };
        return false;
      }
    }
    // Clear any previous error for this field
    if (Object.hasOwn(fieldBodyCapErrors, field.fieldKey)) {
      const { [field.fieldKey]: _removed, ...rest } = fieldBodyCapErrors;
      fieldBodyCapErrors = rest;
    }
    return true;
  }

  const hasFieldBodyCapErrors = $derived(
    Object.entries(fieldBodyCapErrors).some(([, e]) => e !== undefined),
  );

  /** Resolve a page break label in the preview locale, with a fallback. */
  function pageBreakLabel(field: PlaintextField): string {
    const resolved = resolveLocalized(field.label, previewLocale);
    if (resolved != null && resolved.length > 0) return resolved;
    return m.intake_forms_page_break_divider();
  }

  /**
   * Validate per-locale 30K cap on a named rich text field.
   * Returns true if all locales pass. Sets contentCapErrors on failure.
   */
  function validateRichTextCap(
    field: ContentCapField,
    value: LocalizedRichText,
  ): boolean {
    const capMsg = m.intake_forms_content_cap_error({
      max: String(RICH_TEXT_LOCALE_CAP),
    });
    for (const loc of FORM_LOCALES) {
      // eslint-disable-next-line security/detect-object-injection -- loc is from the FORM_LOCALES const tuple
      const v = value[loc];
      if (v !== undefined && richValueJsonSize(v) > RICH_TEXT_LOCALE_CAP) {
        contentCapErrors = setCapError(contentCapErrors, field, capMsg);
        return false;
      }
    }
    contentCapErrors = setCapError(contentCapErrors, field, undefined);
    return true;
  }

  /** Set or clear a single cap-error field without bracket writes or delete. */
  function setCapError(
    prev: ContentCapErrors,
    field: ContentCapField,
    msg: string | undefined,
  ): ContentCapErrors {
    switch (field) {
      case "description":
        return { ...prev, description: msg };
      case "submitMessage":
        return { ...prev, submitMessage: msg };
      case "closedMessage":
        return { ...prev, closedMessage: msg };
    }
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

    // Validate rich text caps (form-level meta and per-field bodies)
    const descOk = validateRichTextCap("description", formDescription);
    const submitOk = validateRichTextCap("submitMessage", formSubmitMessage);
    const closedOk = validateRichTextCap("closedMessage", formClosedMessage);
    let fieldBodiesOk = true;
    for (const field of fields) {
      if (!validateFieldBodyCap(field)) fieldBodiesOk = false;
    }
    if (!descOk || !submitOk || !closedOk || !fieldBodiesOk) return;

    const slugValue = sv || null;
    const desc = trimLocalizedRichText(formDescription);
    const submit = trimLocalizedRichText(formSubmitMessage);
    const closed = trimLocalizedRichText(formClosedMessage);
    const meta: IntakeFormMeta = {
      ...(hasAnyRichContent(desc) ? { description: desc } : {}),
      ...(hasAnyRichContent(submit) ? { submitMessage: submit } : {}),
      ...(hasAnyRichContent(closed) ? { closedMessage: closed } : {}),
      ...(bannerBlobKey != null ? { bannerBlobKey } : {}),
      ...(bannerAlt.trim().length > 0 ? { bannerAlt: bannerAlt.trim() } : {}),
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

  /** Data field types shown in the "Fields" group of the add-field sheet. */
  const dataFieldTypes: IntakeFieldType[] = [
    "text",
    "textarea",
    "select",
    "multiselect",
    "checkbox",
    "date",
    "availability",
  ];

  /** Structural field types shown in the "Structure" group of the add-field sheet. */
  const structuralFieldTypes: IntakeFieldType[] = ["pageBreak", "richText"];

  // ---- Banner upload ----

  let bannerInputEl: HTMLInputElement | undefined;

  /** Type guard for form asset content types. */
  function isFormAssetType(
    type: string,
  ): type is (typeof FORM_ASSET_CONTENT_TYPES)[number] {
    return (FORM_ASSET_CONTENT_TYPES as readonly string[]).includes(type);
  }

  function triggerBannerUpload(): void {
    const pub = orgKeyManager.getPublicKey();
    if (pub == null) {
      toastStore.show(m.form_content_editor_image_no_key(), 3000);
      return;
    }
    bannerInputEl?.click();
  }

  function handleBannerSelected(e: Event): void {
    if (!(e.target instanceof HTMLInputElement)) return;
    const input = e.target;
    const file = input.files?.[0];
    input.value = "";
    if (file == null) return;

    if (file.size > KB_ATTACHMENT_MAX_BYTES) {
      toastStore.show(m.intake_forms_banner_file_too_large(), 3000);
      return;
    }
    if (!isFormAssetType(file.type)) {
      toastStore.show(m.intake_forms_banner_file_type(), 3000);
      return;
    }

    void uploadBanner(file);
  }

  async function uploadBanner(file: File): Promise<void> {
    const pub = orgKeyManager.getPublicKey();
    if (bannerUploading || pub == null) return;
    bannerUploading = true;

    try {
      const arrayBuf = await file.arrayBuffer();
      const plainBytes = new Uint8Array(arrayBuf);
      const encrypted = encryptClientBranding(plainBytes, pub);
      const blob = encode(encrypted);

      const result = await intakeFormsRouter.uploadFormAsset.mutate({
        blob,
        sizeBytes: encrypted.length,
        contentType: isFormAssetType(file.type) ? file.type : "image/png",
      });

      bannerBlobKey = result.blobId;
      haptic();
    } catch (err: unknown) {
      console.error("[IntakeFormEditor] Banner upload failed", err);
      toastStore.show(m.intake_forms_banner_upload_failed(), 3000);
    } finally {
      bannerUploading = false;
    }
  }

  function removeBanner(): void {
    bannerBlobKey = null;
    bannerAlt = "";
  }

  const BANNER_ACCEPT = FORM_ASSET_CONTENT_TYPES.join(",");

  const hasContentCapErrors = $derived(
    contentCapErrors.description !== undefined ||
      contentCapErrors.submitMessage !== undefined ||
      contentCapErrors.closedMessage !== undefined,
  );

  const canSave = $derived(
    formName.trim().length > 0 &&
      fields.length > 0 &&
      !saveMutation.isPending &&
      slugError.length === 0 &&
      !hasContentCapErrors &&
      !hasFieldBodyCapErrors,
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

  <!-- Banner image (locale-independent, sits above content editors) -->
  <BlockTitle>{m.intake_forms_banner_heading()}</BlockTitle>
  <Block>
    <!-- Hidden file input for banner upload -->
    <input
      bind:this={bannerInputEl}
      type="file"
      accept={BANNER_ACCEPT}
      class="sr-only"
      tabindex={-1}
      aria-label={m.intake_forms_banner_add()}
      onchange={(e) => handleBannerSelected(e)}
    />

    {#if bannerPreviewUrl != null}
      <div class="banner-preview">
        <img
          src={bannerPreviewUrl}
          alt={bannerAlt || ""}
          class="banner-preview-img"
        />
        <div class="banner-actions">
          <ListInput
            label={m.intake_forms_banner_alt_label()}
            type="text"
            placeholder={m.intake_forms_banner_alt_placeholder()}
            value={bannerAlt}
            onInput={(e: Event) => {
              if (e.target instanceof HTMLInputElement)
                bannerAlt = e.target.value;
            }}
          />
          <Button outline small onclick={removeBanner}>
            <Trash2 size={16} />
            {m.intake_forms_banner_remove()}
          </Button>
        </div>
      </div>
    {:else if bannerUploading}
      <div class="banner-uploading" role="status">
        <Preloader />
        <span>{m.intake_forms_banner_uploading()}</span>
      </div>
    {:else}
      <Button outline onclick={triggerBannerUpload}>
        <ImagePlus size={18} />
        {m.intake_forms_banner_add()}
      </Button>
    {/if}
  </Block>

  <!-- Form-level descriptive content (locale-dependent, rich text editors) -->
  <BlockTitle>{m.intake_forms_content_heading()}</BlockTitle>
  <Block>
    <FormContentEditor
      value={formDescription}
      locale={editingLocale}
      onchange={(updated: LocalizedRichText) => {
        formDescription = updated;
      }}
      label={m.intake_forms_description_label()}
      hint={m.intake_forms_description_hint()}
      orgPublicKey={orgKeyManager.getPublicKey()}
    />
    {#if contentCapErrors.description}
      <p class="content-cap-error" role="alert">
        {contentCapErrors.description}
      </p>
    {/if}
  </Block>
  <Block>
    <FormContentEditor
      value={formSubmitMessage}
      locale={editingLocale}
      onchange={(updated: LocalizedRichText) => {
        formSubmitMessage = updated;
      }}
      label={m.intake_forms_submit_message_label()}
      hint={m.intake_forms_submit_message_hint()}
      orgPublicKey={orgKeyManager.getPublicKey()}
    />
    {#if contentCapErrors.submitMessage}
      <p class="content-cap-error" role="alert">
        {contentCapErrors.submitMessage}
      </p>
    {/if}
  </Block>
  <Block>
    <FormContentEditor
      value={formClosedMessage}
      locale={editingLocale}
      onchange={(updated: LocalizedRichText) => {
        formClosedMessage = updated;
      }}
      label={m.intake_forms_closed_message_label()}
      hint={m.intake_forms_closed_message_hint()}
      orgPublicKey={orgKeyManager.getPublicKey()}
    />
    {#if contentCapErrors.closedMessage}
      <p class="content-cap-error" role="alert">
        {contentCapErrors.closedMessage}
      </p>
    {/if}
  </Block>

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
      {:else if field.fieldType === "richText"}
        <!-- Rich text block rendered as a structural row with content preview -->
        {@const bodyCapError = Object.hasOwn(fieldBodyCapErrors, field.fieldKey)
          ? fieldBodyCapErrors[field.fieldKey]
          : undefined}
        <ListItem
          title={m.intake_forms_field_type_rich_text()}
          subtitle={richTextBodyPreview(field)}
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
        {#if bodyCapError}
          <p class="content-cap-error" role="alert">{bodyCapError}</p>
        {/if}
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

      <!-- Banner renders above content in all preview states -->
      {#if bannerPreviewUrl != null}
        <img
          src={bannerPreviewUrl}
          alt={bannerAlt || ""}
          class="preview-banner-img"
        />
      {/if}

      {#if previewState === "form"}
        <!-- Description above fields, mirroring public page placement -->
        {#if previewDescriptionHtml.length > 0}
          <div class="preview-description preview-rich-content">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized by renderFormRichText (DOMPurify with PURIFY_CONFIG allowlist) -->
            {@html previewDescriptionHtml}
          </div>
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
          {:else if field.fieldType === "richText"}
            {@const richHtml = renderPreviewHtml(
              resolveRichPreview(
                field.config.type === "richText" ? field.config.body : {},
                previewLocale,
              ),
            )}
            {#if richHtml.length > 0}
              <div class="preview-rich-text-block preview-rich-content">
                <!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized by renderFormRichText (DOMPurify with PURIFY_CONFIG allowlist) -->
                {@html richHtml}
              </div>
            {/if}
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
        {#if previewSubmitMsgHtml.length > 0}
          <div class="intake-preview-success-body preview-rich-content">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized by renderFormRichText (DOMPurify with PURIFY_CONFIG allowlist) -->
            {@html previewSubmitMsgHtml}
          </div>
        {:else}
          <p class="intake-preview-success-body">
            {m.intake_success_body()}
          </p>
        {/if}
        <p class="intake-preview-reference-label">
          {m.intake_reference_label()}
        </p>
        <code class="intake-preview-reference-code"
          >{m.intake_forms_preview_reference_placeholder()}</code
        >
        <p class="intake-preview-reference-save">{m.intake_reference_save()}</p>
      {:else}
        <!-- Closed state, mirrors IntakeFormBody closed layout -->
        {#if previewClosedMsgHtml.length > 0}
          <div class="intake-preview-closed preview-rich-content" role="status">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized by renderFormRichText (DOMPurify with PURIFY_CONFIG allowlist) -->
            {@html previewClosedMsgHtml}
          </div>
        {:else}
          <p class="intake-preview-closed" role="status">
            {m.intake_form_closed_default()}
          </p>
        {/if}
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
  <BlockTitle>{m.intake_forms_add_field_fields_heading()}</BlockTitle>
  <List strong inset>
    {#each dataFieldTypes as type (type)}
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
  <BlockTitle>{m.intake_forms_add_field_structure_heading()}</BlockTitle>
  <List strong inset>
    {#each structuralFieldTypes as type (type)}
      <ListItem
        title={getFieldTypeLabel(type)}
        subtitle={getFieldTypeDesc(type)}
        onclick={() => addField(type)}
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

  /* Rich text block preview */
  .preview-rich-text-block {
    margin-bottom: var(--space-md);
  }

  /* Banner */
  .banner-preview {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .banner-preview-img {
    max-width: 100%;
    max-height: 200px;
    object-fit: cover;
    border-radius: var(--card-radius);
  }

  .banner-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .banner-uploading {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--text-sm);
    color: var(--muted);
    padding: var(--space-sm) 0;
  }

  /* Rich content preview */
  .preview-rich-content {
    font-size: var(--text-sm);
    line-height: 1.5;
    color: var(--muted);
  }

  .preview-rich-content :global(p) {
    margin-bottom: 0.5em;
  }

  .preview-rich-content :global(a) {
    color: var(--brand-text);
    text-decoration: underline;
  }

  .preview-rich-content :global(ul) {
    list-style-type: disc;
    padding-left: 1.5em;
    margin-bottom: 0.5em;
  }

  .preview-rich-content :global(ol) {
    list-style-type: decimal;
    padding-left: 1.5em;
    margin-bottom: 0.5em;
  }

  .preview-rich-content :global(img) {
    max-width: 100%;
    height: auto;
    border-radius: var(--card-radius);
  }

  .preview-banner-img {
    max-width: 100%;
    border-radius: var(--card-radius);
    margin-bottom: var(--space-md);
  }

  /* Content cap validation error */
  .content-cap-error {
    font-size: var(--text-xs);
    color: var(--k-ios-red, #ff3b30);
    padding: var(--space-xs) var(--space-md);
    margin: 0;
  }

  /* Screen-reader only (hidden file inputs) */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
