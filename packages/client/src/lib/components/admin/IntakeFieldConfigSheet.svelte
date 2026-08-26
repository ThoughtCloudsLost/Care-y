<!--
  Field configuration sheet for the admin form builder.
  Renders inside a ShellSheet with role="dialog" and aria-modal="true".
  Configures label, required state, type-specific options, semantic role
  (ADR-068), and role-specific mapping editors (queue routing, urgency,
  escalation with recipient picker).

  Supports multilingual authoring: label, help text, placeholder, and option
  labels are LocalizedText objects. The parent editor passes the current
  editingLocale; locale tabs on each localized input let the author switch
  within the sheet as well.
-->
<script lang="ts">
  import {
    List,
    ListItem,
    ListInput,
    Toggle,
    Button,
    BlockTitle,
    Checkbox,
    Link,
    Segmented,
    SegmentedButton,
  } from "konsta/svelte";
  import {
    ROLE_WIDGET_COMPATIBILITY,
    intakeFieldRoleSchema,
    ticketPrioritySchema,
    textSubtypeSchema,
    visibilityOperatorSchema,
    resolveLocalized,
    BASE_LOCALE,
    FORM_LOCALES,
    type IntakeFieldConfig,
    type IntakeFieldType,
    type IntakeFieldRole,
    type IntakeOption,
    type TextSubtype,
    type TicketPriority,
    type QueueId,
    type LocalizedText,
    type FormLocale,
    queueIdSchema,
  } from "@care-y/shared";
  import { SvelteSet } from "svelte/reactivity";
  import * as m from "$lib/paraglide/messages.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import FieldError from "$lib/components/FieldError.svelte";

  // ---- Types ----

  import type {
    FieldConfigState,
    FieldConfigInitial,
    QueueOption,
    VolunteerOption,
    EarlierFieldOption,
  } from "./intake-field-config-types.js";
  import type { VisibleWhen, VisibilityRule } from "@care-y/shared";

  interface IntakeFieldConfigSheetProps {
    readonly opened: boolean;
    readonly fieldType: IntakeFieldType;
    readonly initial: FieldConfigInitial;
    readonly queues: readonly QueueOption[];
    readonly volunteers: readonly VolunteerOption[];
    readonly editingLocale: FormLocale;
    readonly earlierFields: readonly EarlierFieldOption[];
    readonly ondone: (result: FieldConfigState) => void;
    readonly ondismiss: () => void;
  }

  let {
    opened,
    fieldType,
    initial,
    queues,
    volunteers,
    editingLocale: parentLocale,
    earlierFields,
    ondone,
    ondismiss,
  }: IntakeFieldConfigSheetProps = $props();

  // Local locale state (initialized from parent, can be switched in the sheet)
  let sheetLocale = $state<FormLocale>(BASE_LOCALE);

  let label = $state<LocalizedText>({});
  let labelError = $state("");
  let optionsError = $state("");
  let isRequired = $state(false);
  let helpText = $state<LocalizedText>({});

  // Type-specific config state
  let placeholder = $state<LocalizedText>({});
  let maxLength = $state<number | undefined>(undefined);
  let options = $state<IntakeOption[]>([]);
  let allowRecurring = $state(true);
  let allowSpecific = $state(true);
  let requiredTrue = $state(false);
  let subtype = $state<TextSubtype | "">("");
  let numberMin = $state<number | undefined>(undefined);
  let numberMax = $state<number | undefined>(undefined);

  // Role state (ADR-068)
  let selectedRole = $state<IntakeFieldRole | null>(null);

  // Role mapping state
  let queueRoutingMapping = $state<Record<string, QueueId>>({});
  let urgencyMapping = $state<Record<string, TicketPriority>>({});
  let escalationMapping = $state<Record<string, string>>({});
  let escalationRecipientIds = $state<string[]>([]);

  let atLeastOneError = $state("");

  // Conditional visibility state
  let conditionEnabled = $state(false);
  let conditionMode = $state<"all" | "any">("all");
  let conditionRules = $state<
    {
      fieldKey: string;
      operator: "equals" | "includes" | "checked";
      optionKey: string;
      boolValue: boolean;
    }[]
  >([]);

  // Page break state
  let pageBreakTitle = $state<LocalizedText>({});

  /** Native locale name for display. */
  function localeName(loc: FormLocale): string {
    switch (loc) {
      case "en":
        return "EN";
      case "es":
        return "ES";
    }
  }

  /** Read a locale key from a LocalizedText. */
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

  // Compute compatible roles for the current field type
  const compatibleRoles = $derived.by((): IntakeFieldRole[] => {
    const roles: IntakeFieldRole[] = [];
    for (const role of intakeFieldRoleSchema.options) {
      // eslint-disable-next-line security/detect-object-injection -- role is from the intakeFieldRoleSchema enum values
      const allowed = ROLE_WIDGET_COMPATIBILITY[role];
      if (allowed.includes(fieldType)) {
        roles.push(role);
      }
    }
    return roles;
  });

  // Reset state when sheet opens
  let wasOpened = $state(false);
  $effect(() => {
    if (opened && !wasOpened) {
      label = { ...initial.label };
      helpText = { ...initial.helpText };
      isRequired = initial.isRequired;
      selectedRole = initial.role;
      sheetLocale = parentLocale;
      escalationRecipientIds =
        initial.escalationRecipientIds != null
          ? [...initial.escalationRecipientIds]
          : [];

      // Restore conditional visibility
      if (initial.visibleWhen != null) {
        conditionEnabled = true;
        conditionMode = initial.visibleWhen.mode;
        conditionRules = initial.visibleWhen.rules.map((r) => ({
          fieldKey: r.fieldKey,
          operator: r.operator,
          optionKey: r.optionKey ?? "",
          boolValue: r.boolValue ?? true,
        }));
      } else {
        conditionEnabled = false;
        conditionMode = "all";
        conditionRules = [];
      }

      const cfg = initial.config;

      // Reset subtype/number range (only populated for text)
      subtype = "";
      numberMin = undefined;
      numberMax = undefined;
      placeholder = {};
      pageBreakTitle = {};

      switch (cfg.type) {
        case "text":
          placeholder = cfg.placeholder != null ? { ...cfg.placeholder } : {};
          maxLength = cfg.maxLength;
          subtype = cfg.subtype ?? "";
          if (cfg.numberRange != null) {
            numberMin = cfg.numberRange.min;
            numberMax = cfg.numberRange.max;
          }
          break;
        case "textarea":
          placeholder = cfg.placeholder != null ? { ...cfg.placeholder } : {};
          maxLength = cfg.maxLength;
          break;
        case "select":
          options = cfg.options.map((o) => ({
            key: o.key,
            label: { ...o.label },
          }));
          queueRoutingMapping =
            cfg.queueRoutingMapping != null
              ? { ...cfg.queueRoutingMapping }
              : {};
          urgencyMapping =
            cfg.urgencyMapping != null ? { ...cfg.urgencyMapping } : {};
          escalationMapping =
            cfg.escalationMapping != null ? { ...cfg.escalationMapping } : {};
          break;
        case "multiselect":
          options = cfg.options.map((o) => ({
            key: o.key,
            label: { ...o.label },
          }));
          queueRoutingMapping =
            cfg.queueRoutingMapping != null
              ? { ...cfg.queueRoutingMapping }
              : {};
          break;
        case "checkbox":
          requiredTrue = cfg.requiredTrue === true;
          break;
        case "availability":
          allowRecurring = cfg.allowRecurring;
          allowSpecific = cfg.allowSpecific;
          break;
        case "date":
          // Date has no additional config to restore
          break;
        case "pageBreak":
          pageBreakTitle = cfg.title != null ? { ...cfg.title } : {};
          break;
      }
      atLeastOneError = "";
    }
    wasOpened = opened;
  });

  function handleLabelInput(e: Event): void {
    const target = e.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement
    ) {
      labelError = "";
      label = setLocaleText(label, sheetLocale, target.value);
    }
  }

  function handleHelpTextInput(e: Event): void {
    const target = e.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement
    ) {
      helpText = setLocaleText(helpText, sheetLocale, target.value);
    }
  }

  function handlePlaceholderInput(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      placeholder = setLocaleText(placeholder, sheetLocale, target.value);
    }
  }

  function handleSubtypeChange(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLSelectElement) {
      const val = target.value;
      const parsed = textSubtypeSchema.safeParse(val);
      subtype = parsed.success ? parsed.data : "";
    }
  }

  function handleNumberMinInput(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      const val = target.value;
      numberMin = val === "" ? undefined : Number(val);
    }
  }

  function handleNumberMaxInput(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      const val = target.value;
      numberMax = val === "" ? undefined : Number(val);
    }
  }

  function handleMaxLengthInput(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      const val = target.value;
      maxLength = val === "" ? undefined : Number(val);
    }
  }

  function handleOptionInput(index: number, e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      optionsError = "";
      options = options.map((o, i) =>
        i === index
          ? {
              key: o.key,
              label: setLocaleText(o.label, sheetLocale, target.value),
            }
          : o,
      );
    }
  }

  function addOption(): void {
    options = [...options, { key: crypto.randomUUID(), label: { en: "" } }];
  }

  function removeOption(index: number): void {
    if (options.length <= 1) return;
    options = options.filter((_, i) => i !== index);
  }

  function toggleRecurring(): void {
    if (allowRecurring && !allowSpecific) {
      atLeastOneError = m.intake_forms_config_at_least_one();
      return;
    }
    allowRecurring = !allowRecurring;
    atLeastOneError = "";
  }

  function toggleSpecific(): void {
    if (allowSpecific && !allowRecurring) {
      atLeastOneError = m.intake_forms_config_at_least_one();
      return;
    }
    allowSpecific = !allowSpecific;
    atLeastOneError = "";
  }

  // ---- Role handlers ----

  function handleRoleChange(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLSelectElement) {
      const val = target.value;
      const parsed = intakeFieldRoleSchema.safeParse(val);
      selectedRole = parsed.success ? parsed.data : null;
      // Clear irrelevant mapping state on role change
      if (val !== "queue-routing") {
        queueRoutingMapping = {};
      }
      if (val !== "urgency") {
        urgencyMapping = {};
      }
      if (val !== "escalation") {
        escalationMapping = {};
        escalationRecipientIds = [];
      }
    }
  }

  function handleQueueMappingChange(optionKey: string, e: Event): void {
    const target = e.target;
    if (target instanceof HTMLSelectElement) {
      const val = target.value;
      if (val === "") {
        const { [optionKey]: _removed, ...rest } = queueRoutingMapping;
        queueRoutingMapping = rest;
      } else {
        queueRoutingMapping = {
          ...queueRoutingMapping,
          [optionKey]: queueIdSchema.parse(val),
        };
      }
    }
  }

  function handleUrgencyMappingChange(optionKey: string, e: Event): void {
    const target = e.target;
    if (target instanceof HTMLSelectElement) {
      const val = target.value;
      if (val === "") {
        const { [optionKey]: _removed, ...rest } = urgencyMapping;
        urgencyMapping = rest;
      } else {
        const parsed = ticketPrioritySchema.safeParse(val);
        if (parsed.success) {
          urgencyMapping = {
            ...urgencyMapping,
            [optionKey]: parsed.data,
          };
        }
      }
    }
  }

  function handleEscalationMappingChange(optionKey: string, e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      const val = target.value;
      if (val === "") {
        const { [optionKey]: _removed, ...rest } = escalationMapping;
        escalationMapping = rest;
      } else {
        escalationMapping = { ...escalationMapping, [optionKey]: val };
      }
    }
  }

  function toggleEscalationRecipient(volunteerId: string): void {
    if (escalationRecipientIds.includes(volunteerId)) {
      escalationRecipientIds = escalationRecipientIds.filter(
        (id) => id !== volunteerId,
      );
    } else {
      escalationRecipientIds = [...escalationRecipientIds, volunteerId];
    }
  }

  // ---- Mapping lookup helpers (avoid bracket access in template) ----

  function getQueueMapping(key: string): string {
    return Object.hasOwn(queueRoutingMapping, key)
      ? (queueRoutingMapping[key] ?? "") // eslint-disable-line security/detect-object-injection -- key verified by hasOwn
      : "";
  }

  function getUrgencyMapping(key: string): string {
    return Object.hasOwn(urgencyMapping, key)
      ? (urgencyMapping[key] ?? "") // eslint-disable-line security/detect-object-injection -- key verified by hasOwn
      : "";
  }

  function getEscalationMapping(key: string): string {
    return Object.hasOwn(escalationMapping, key)
      ? (escalationMapping[key] ?? "") // eslint-disable-line security/detect-object-injection -- key verified by hasOwn
      : "";
  }

  // ---- Role label helper ----

  function getRoleLabel(role: IntakeFieldRole): string {
    switch (role) {
      case "queue-routing":
        return m.intake_forms_config_role_queue_routing();
      case "urgency":
        return m.intake_forms_config_role_urgency();
      case "escalation":
        return m.intake_forms_config_role_escalation();
      case "phone-contact":
        return m.intake_forms_config_role_phone_contact();
      case "email-contact":
        return m.intake_forms_config_role_email_contact();
      case "real-name":
        return m.intake_forms_config_role_real_name();
      case "pronouns":
        return m.intake_forms_config_role_pronouns();
      case "contact-safety":
        return m.intake_forms_config_role_contact_safety();
      case "consent":
        return m.intake_forms_config_role_consent();
      case "language-preference":
        return m.intake_forms_config_role_language_preference();
    }
  }

  // ---- Build config ----

  /** Resolve the base-locale display text for an option. */
  function optionDisplayText(opt: IntakeOption): string {
    return resolveLocalized(opt.label, BASE_LOCALE) ?? "";
  }

  /** Read an option label in the current sheet locale. */
  function optionLocaleText(opt: IntakeOption): string {
    return readLocale(opt.label, sheetLocale);
  }

  /** Strip empty-string locale entries from a LocalizedText. */
  function trimLocalized(text: LocalizedText): LocalizedText {
    const result: LocalizedText = {};
    const en = text.en;
    const es = text.es;
    if (en != null && en.trim().length > 0) result.en = en.trim();
    if (es != null && es.trim().length > 0) result.es = es.trim();
    return result;
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

  function buildConfig(): IntakeFieldConfig {
    const ht = hasContent(helpText) ? trimLocalized(helpText) : undefined;
    if (fieldType === "text") {
      const pl = hasContent(placeholder)
        ? trimLocalized(placeholder)
        : undefined;
      return {
        type: "text",
        ...(pl != null ? { placeholder: pl } : {}),
        ...(maxLength !== undefined ? { maxLength } : {}),
        ...(ht != null ? { helpText: ht } : {}),
        ...(subtype !== "" ? { subtype } : {}),
        ...(subtype === "number" &&
        (numberMin !== undefined || numberMax !== undefined)
          ? {
              numberRange: {
                ...(numberMin !== undefined ? { min: numberMin } : {}),
                ...(numberMax !== undefined ? { max: numberMax } : {}),
              },
            }
          : {}),
      };
    }
    if (fieldType === "textarea") {
      const pl = hasContent(placeholder)
        ? trimLocalized(placeholder)
        : undefined;
      return {
        type: "textarea",
        ...(pl != null ? { placeholder: pl } : {}),
        ...(maxLength !== undefined ? { maxLength } : {}),
        ...(ht != null ? { helpText: ht } : {}),
      };
    }
    if (fieldType === "select") {
      const filteredOptions = options.filter(
        (o) => optionDisplayText(o).length > 0,
      );
      const cfg: IntakeFieldConfig = {
        type: "select",
        options: filteredOptions,
        ...(ht != null ? { helpText: ht } : {}),
      };
      if (
        selectedRole === "queue-routing" &&
        Object.keys(queueRoutingMapping).length > 0
      ) {
        return { ...cfg, queueRoutingMapping };
      }
      if (
        selectedRole === "urgency" &&
        Object.keys(urgencyMapping).length > 0
      ) {
        return { ...cfg, urgencyMapping };
      }
      if (
        selectedRole === "escalation" &&
        Object.keys(escalationMapping).length > 0
      ) {
        return { ...cfg, escalationMapping };
      }
      return cfg;
    }
    if (fieldType === "multiselect") {
      const filteredOptions = options.filter(
        (o) => optionDisplayText(o).length > 0,
      );
      const cfg: IntakeFieldConfig = {
        type: "multiselect",
        options: filteredOptions,
        ...(ht != null ? { helpText: ht } : {}),
      };
      if (
        selectedRole === "queue-routing" &&
        Object.keys(queueRoutingMapping).length > 0
      ) {
        return { ...cfg, queueRoutingMapping };
      }
      return cfg;
    }
    if (fieldType === "checkbox") {
      return {
        type: "checkbox",
        ...(requiredTrue ? { requiredTrue: true } : {}),
        ...(ht != null ? { helpText: ht } : {}),
      };
    }
    if (fieldType === "date") {
      return {
        type: "date",
        ...(ht != null ? { helpText: ht } : {}),
      };
    }
    if (fieldType === "pageBreak") {
      const pt = hasContent(pageBreakTitle)
        ? trimLocalized(pageBreakTitle)
        : undefined;
      return {
        type: "pageBreak",
        ...(pt != null ? { title: pt } : {}),
      };
    }
    return {
      type: "availability",
      allowRecurring,
      allowSpecific,
      ...(ht != null ? { helpText: ht } : {}),
    };
  }

  /** Derive routingQueueIds from the queue routing mapping values. */
  function deriveRoutingQueueIds(): string[] | null {
    if (selectedRole !== "queue-routing") return null;
    const ids = new SvelteSet<string>();
    for (const queueId of Object.values(queueRoutingMapping)) {
      if (queueId !== "") ids.add(queueId);
    }
    return ids.size > 0 ? [...ids] : null;
  }

  /** Build visibleWhen from the condition editor state. */
  function buildVisibleWhen(): VisibleWhen | undefined {
    if (!conditionEnabled || conditionRules.length === 0) return undefined;
    const rules: VisibilityRule[] = conditionRules
      .filter((r) => r.fieldKey !== "")
      .map((r) => {
        const base: VisibilityRule = {
          fieldKey: r.fieldKey,
          operator: r.operator,
        };
        if (r.operator === "equals" || r.operator === "includes") {
          return { ...base, optionKey: r.optionKey };
        }
        return { ...base, boolValue: r.boolValue };
      });
    if (rules.length === 0) return undefined;
    return { mode: conditionMode, rules };
  }

  /** Add a new empty condition rule. */
  function addConditionRule(): void {
    conditionRules = [
      ...conditionRules,
      { fieldKey: "", operator: "equals", optionKey: "", boolValue: true },
    ];
  }

  /** Remove a condition rule by index. */
  function removeConditionRule(index: number): void {
    conditionRules = conditionRules.filter((_, i) => i !== index);
  }

  /** Update a condition rule field selection. */
  function handleConditionFieldChange(index: number, e: Event): void {
    const target = e.target;
    if (target instanceof HTMLSelectElement) {
      const fk = target.value;
      const ef = earlierFields.find((f) => f.fieldKey === fk);
      // Auto-select operator based on field type
      const op =
        ef?.fieldType === "checkbox"
          ? "checked"
          : ef?.fieldType === "multiselect"
            ? "includes"
            : "equals";
      conditionRules = conditionRules.map((r, i) =>
        i === index
          ? { ...r, fieldKey: fk, operator: op, optionKey: "", boolValue: true }
          : r,
      );
    }
  }

  /** Update a condition rule operator. */
  function handleConditionOperatorChange(index: number, e: Event): void {
    const target = e.target;
    if (!(target instanceof HTMLSelectElement)) return;
    const parsed = visibilityOperatorSchema.safeParse(target.value);
    if (!parsed.success) return;
    conditionRules = conditionRules.map((r, i) =>
      i === index ? { ...r, operator: parsed.data } : r,
    );
  }

  /** Update a condition rule option key value. */
  function handleConditionValueChange(index: number, e: Event): void {
    const target = e.target;
    if (target instanceof HTMLSelectElement) {
      conditionRules = conditionRules.map((r, i) =>
        i === index ? { ...r, optionKey: target.value } : r,
      );
    }
  }

  /** Get options for a referenced earlier field. */
  function getFieldOptions(
    fieldKey: string,
  ): readonly { key: string; label: string }[] {
    const ef = earlierFields.find((f) => f.fieldKey === fieldKey);
    return ef?.options ?? [];
  }

  /** Get the field type of a referenced earlier field. */
  function getFieldType(fieldKey: string): IntakeFieldType | undefined {
    return earlierFields.find((f) => f.fieldKey === fieldKey)?.fieldType;
  }

  function handleDone(): void {
    // Page break does not require label validation
    if (fieldType === "pageBreak") {
      const result: FieldConfigState = {
        label: trimLocalized(pageBreakTitle),
        helpText: {},
        isRequired: false,
        config: buildConfig(),
        role: null,
        routingQueueIds: null,
        escalationRecipientIds: null,
        visibleWhen: buildVisibleWhen(),
      };
      ondone(result);
      return;
    }

    // Base locale label is required
    const baseLabelVal = readLocale(label, BASE_LOCALE);
    if (baseLabelVal.trim().length === 0) {
      labelError = m.intake_forms_config_label_required();
      return;
    }
    if (
      (fieldType === "select" || fieldType === "multiselect") &&
      !options.some((o) => optionDisplayText(o).trim().length > 0)
    ) {
      optionsError = m.intake_forms_config_options_required();
      return;
    }
    const result: FieldConfigState = {
      label: trimLocalized(label),
      helpText: trimLocalized(helpText),
      isRequired,
      config: buildConfig(),
      role: selectedRole,
      routingQueueIds: deriveRoutingQueueIds(),
      escalationRecipientIds:
        selectedRole === "escalation" && escalationRecipientIds.length > 0
          ? escalationRecipientIds
          : null,
      visibleWhen: buildVisibleWhen(),
    };
    ondone(result);
  }

  // Priority options for the urgency mapping editor
  const PRIORITY_OPTIONS: readonly {
    value: TicketPriority;
    label: () => string;
  }[] = [
    { value: "low", label: m.intake_forms_config_priority_low },
    { value: "normal", label: m.intake_forms_config_priority_normal },
    { value: "high", label: m.intake_forms_config_priority_high },
    { value: "urgent", label: m.intake_forms_config_priority_urgent },
  ] as const;
</script>

<ShellSheet
  {opened}
  {ondismiss}
  role="dialog"
  title={m.intake_forms_config_title()}
>
  {#snippet headerRight()}
    <Link role="button" onclick={ondismiss}>{m.common_cancel()}</Link>
    <Link role="button" onclick={handleDone}>
      {m.intake_forms_config_done()}
    </Link>
  {/snippet}

  <!-- Locale switcher within the config sheet -->
  <div class="sheet-locale-switcher">
    <Segmented strong>
      {#each FORM_LOCALES as loc (loc)}
        <SegmentedButton
          active={sheetLocale === loc}
          onclick={() => (sheetLocale = loc)}
        >
          {localeName(loc)}
        </SegmentedButton>
      {/each}
    </Segmented>
  </div>

  {#if fieldType === "pageBreak"}
    <!-- Page break config: just a localized title -->
    <List strong inset>
      <ListInput
        label={m.intake_forms_page_break_title_label()}
        type="text"
        placeholder={m.intake_forms_page_break_title_placeholder()}
        value={readLocale(pageBreakTitle, sheetLocale)}
        onInput={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLInputElement) {
            pageBreakTitle = setLocaleText(
              pageBreakTitle,
              sheetLocale,
              target.value,
            );
          }
        }}
      />
    </List>
  {:else}
    <List strong inset>
      <ListInput
        label={m.intake_forms_config_label()}
        type="text"
        placeholder={m.intake_forms_config_label_placeholder()}
        error={labelError}
        value={readLocale(label, sheetLocale)}
        onInput={handleLabelInput}
      />
      <ListInput
        label={m.intake_forms_config_help_text()}
        type="text"
        placeholder={m.intake_forms_config_help_text_placeholder()}
        info={m.intake_forms_config_help_text_hint()}
        value={readLocale(helpText, sheetLocale)}
        onInput={handleHelpTextInput}
      />
    </List>

    <List strong inset>
      <ListItem title={m.intake_forms_config_required()}>
        {#snippet after()}
          <Toggle
            checked={isRequired}
            onChange={() => (isRequired = !isRequired)}
          />
        {/snippet}
      </ListItem>
    </List>
  {/if}

  <!-- Role picker (ADR-068) -->
  {#if compatibleRoles.length > 0}
    <List strong inset>
      <ListInput
        label={m.intake_forms_config_role_label()}
        info={m.intake_forms_config_role_hint()}
        type="select"
        dropdown
        value={selectedRole ?? ""}
        onChange={handleRoleChange}
      >
        <option value="">{m.intake_forms_config_role_none()}</option>
        {#each compatibleRoles as role (role)}
          <option value={role}>{getRoleLabel(role)}</option>
        {/each}
      </ListInput>
    </List>
  {/if}

  {#if fieldType === "text" || fieldType === "textarea"}
    <List strong inset>
      <ListInput
        label={m.intake_forms_config_placeholder()}
        type="text"
        value={readLocale(placeholder, sheetLocale)}
        onInput={handlePlaceholderInput}
      />
      <ListInput
        label={m.intake_forms_config_max_length()}
        type="number"
        value={maxLength !== undefined ? String(maxLength) : ""}
        onInput={handleMaxLengthInput}
      />
      {#if fieldType === "text"}
        <ListInput
          label={m.intake_forms_config_subtype()}
          type="select"
          dropdown
          value={subtype}
          onChange={handleSubtypeChange}
        >
          <option value="">{m.intake_forms_config_subtype_none()}</option>
          <option value="email">{m.intake_forms_config_subtype_email()}</option>
          <option value="phone">{m.intake_forms_config_subtype_phone()}</option>
          <option value="number"
            >{m.intake_forms_config_subtype_number()}</option
          >
        </ListInput>
        {#if subtype === "number"}
          <ListInput
            label={m.intake_forms_config_number_min()}
            type="number"
            value={numberMin !== undefined ? String(numberMin) : ""}
            onInput={handleNumberMinInput}
          />
          <ListInput
            label={m.intake_forms_config_number_max()}
            type="number"
            value={numberMax !== undefined ? String(numberMax) : ""}
            onInput={handleNumberMaxInput}
          />
        {/if}
      {/if}
    </List>
  {/if}

  {#if fieldType === "select" || fieldType === "multiselect"}
    <List strong inset>
      {#each options as option, index (option.key)}
        <ListInput
          label={m.intake_forms_config_option_label({ n: String(index + 1) })}
          type="text"
          value={optionLocaleText(option)}
          onInput={(e: Event) => handleOptionInput(index, e)}
        >
          <Button
            small
            clear
            disabled={options.length <= 1}
            onclick={() => removeOption(index)}
            aria-label={m.intake_forms_config_remove_option()}
          >
            {m.intake_forms_config_remove_option()}
          </Button>
        </ListInput>
      {/each}
    </List>
    <FieldError message={optionsError} />
    <div class="config-action">
      <Button small outline onclick={addOption}>
        {m.intake_forms_config_add_option()}
      </Button>
    </div>
  {/if}

  {#if fieldType === "checkbox"}
    <List strong inset>
      <ListItem title={m.intake_forms_config_required_true()}>
        {#snippet after()}
          <Toggle
            checked={requiredTrue}
            onChange={() => (requiredTrue = !requiredTrue)}
          />
        {/snippet}
      </ListItem>
    </List>
  {/if}

  {#if fieldType === "availability"}
    <List strong inset>
      <ListItem title={m.intake_forms_config_allow_recurring()}>
        {#snippet after()}
          <Toggle checked={allowRecurring} onChange={toggleRecurring} />
        {/snippet}
      </ListItem>
      <ListItem title={m.intake_forms_config_allow_specific()}>
        {#snippet after()}
          <Toggle checked={allowSpecific} onChange={toggleSpecific} />
        {/snippet}
      </ListItem>
    </List>
    <FieldError message={atLeastOneError} />
  {/if}

  <!-- Queue routing mapping editor -->
  {#if selectedRole === "queue-routing" && (fieldType === "select" || fieldType === "multiselect")}
    <BlockTitle>{m.intake_forms_config_queue_mapping_title()}</BlockTitle>
    <List strong inset>
      {#each options.filter((o) => optionDisplayText(o).length > 0) as opt (opt.key)}
        <ListInput
          label={optionDisplayText(opt)}
          type="select"
          dropdown
          value={getQueueMapping(opt.key)}
          onChange={(e: Event) => handleQueueMappingChange(opt.key, e)}
        >
          <option value="">{m.intake_forms_config_queue_default()}</option>
          {#each queues as queue (queue.id)}
            <option value={queue.id}>{queue.name}</option>
          {/each}
        </ListInput>
      {/each}
    </List>
    <p class="mapping-hint">{m.intake_forms_config_queue_mapping_hint()}</p>
  {/if}

  <!-- Urgency mapping editor -->
  {#if selectedRole === "urgency" && fieldType === "select"}
    <BlockTitle>{m.intake_forms_config_urgency_mapping_title()}</BlockTitle>
    <List strong inset>
      {#each options.filter((o) => optionDisplayText(o).length > 0) as opt (opt.key)}
        <ListInput
          label={optionDisplayText(opt)}
          type="select"
          dropdown
          value={getUrgencyMapping(opt.key)}
          onChange={(e: Event) => handleUrgencyMappingChange(opt.key, e)}
        >
          <option value="">{m.intake_forms_config_priority_default()}</option>
          {#each PRIORITY_OPTIONS as prio (prio.value)}
            <option value={prio.value}>{prio.label()}</option>
          {/each}
        </ListInput>
      {/each}
    </List>
    <p class="mapping-hint">{m.intake_forms_config_urgency_mapping_hint()}</p>
  {/if}

  <!-- Escalation mapping editor (select type) -->
  {#if selectedRole === "escalation" && fieldType === "select"}
    <BlockTitle>{m.intake_forms_config_escalation_mapping_title()}</BlockTitle>
    <List strong inset>
      {#each options.filter((o) => optionDisplayText(o).length > 0) as opt (opt.key)}
        <ListInput
          label={optionDisplayText(opt)}
          type="text"
          placeholder={m.intake_forms_config_escalation_alert_label()}
          value={getEscalationMapping(opt.key)}
          onInput={(e: Event) => handleEscalationMappingChange(opt.key, e)}
        />
      {/each}
    </List>
    <p class="mapping-hint">
      {m.intake_forms_config_escalation_mapping_hint()}
    </p>
  {/if}

  <!-- Escalation hint for checkbox type -->
  {#if selectedRole === "escalation" && fieldType === "checkbox"}
    <p class="mapping-hint">
      {m.intake_forms_config_escalation_checkbox_hint()}
    </p>
  {/if}

  <!-- Escalation recipient picker (shared between select and checkbox escalation) -->
  {#if selectedRole === "escalation"}
    <BlockTitle
      >{m.intake_forms_config_escalation_recipients_title()}</BlockTitle
    >
    {#if volunteers.length > 0}
      <List strong inset>
        {#each volunteers as vol (vol.id)}
          <ListItem label title={vol.name}>
            {#snippet media()}
              <Checkbox
                component="div"
                checked={escalationRecipientIds.includes(vol.id)}
                onChange={() => toggleEscalationRecipient(vol.id)}
              />
            {/snippet}
          </ListItem>
        {/each}
      </List>
    {/if}
    <p class="mapping-hint">
      {m.intake_forms_config_escalation_recipients_hint()}
    </p>
  {/if}

  <!-- Conditional visibility builder -->
  {#if earlierFields.length > 0}
    <BlockTitle>{m.intake_forms_config_condition_heading()}</BlockTitle>
    <List strong inset>
      <ListItem title={m.intake_forms_config_condition_heading()}>
        {#snippet after()}
          <Toggle
            checked={conditionEnabled}
            onChange={() => {
              conditionEnabled = !conditionEnabled;
              if (conditionEnabled && conditionRules.length === 0) {
                addConditionRule();
              }
            }}
          />
        {/snippet}
      </ListItem>
    </List>
    <p class="mapping-hint">{m.intake_forms_config_condition_hint()}</p>

    {#if conditionEnabled}
      <List strong inset>
        <ListInput
          label={m.intake_forms_config_condition_operator_label()}
          type="select"
          dropdown
          value={conditionMode}
          onChange={(e: Event) => {
            const target = e.target;
            if (target instanceof HTMLSelectElement) {
              conditionMode = target.value === "any" ? "any" : "all";
            }
          }}
        >
          <option value="all"
            >{m.intake_forms_config_condition_mode_all()}</option
          >
          <option value="any"
            >{m.intake_forms_config_condition_mode_any()}</option
          >
        </ListInput>
      </List>

      {#each conditionRules as rule, ruleIndex (ruleIndex)}
        <List strong inset>
          <ListInput
            label={m.intake_forms_config_condition_field_label()}
            type="select"
            dropdown
            value={rule.fieldKey}
            onChange={(e: Event) => handleConditionFieldChange(ruleIndex, e)}
          >
            <option value="">---</option>
            {#each earlierFields as ef (ef.fieldKey)}
              <option value={ef.fieldKey}>{ef.label}</option>
            {/each}
          </ListInput>

          {#if rule.fieldKey !== ""}
            {#if getFieldType(rule.fieldKey) !== "checkbox"}
              <ListInput
                label={m.intake_forms_config_condition_operator_label()}
                type="select"
                dropdown
                value={rule.operator}
                onChange={(e: Event) =>
                  handleConditionOperatorChange(ruleIndex, e)}
              >
                <option value="equals"
                  >{m.intake_forms_config_condition_op_equals()}</option
                >
                <option value="includes"
                  >{m.intake_forms_config_condition_op_includes()}</option
                >
              </ListInput>
            {/if}

            {#if rule.operator === "equals" || rule.operator === "includes"}
              <ListInput
                label={m.intake_forms_config_condition_value_label()}
                type="select"
                dropdown
                value={rule.optionKey}
                onChange={(e: Event) =>
                  handleConditionValueChange(ruleIndex, e)}
              >
                <option value="">---</option>
                {#each getFieldOptions(rule.fieldKey) as opt (opt.key)}
                  <option value={opt.key}>{opt.label}</option>
                {/each}
              </ListInput>
            {/if}
          {/if}
        </List>
        {#if conditionRules.length > 1}
          <div class="config-action">
            <Button
              small
              clear
              onclick={() => removeConditionRule(ruleIndex)}
              aria-label={m.intake_forms_config_condition_remove_rule()}
            >
              {m.intake_forms_config_condition_remove_rule()}
            </Button>
          </div>
        {/if}
      {/each}
      <div class="config-action">
        <Button small outline onclick={addConditionRule}>
          {m.intake_forms_config_condition_add_rule()}
        </Button>
      </div>
    {/if}
  {:else if fieldType !== "pageBreak"}
    <p class="mapping-hint">{m.intake_forms_config_condition_no_fields()}</p>
  {/if}
</ShellSheet>

<style>
  .config-action {
    padding: 0 var(--space-lg);
    margin-top: var(--space-sm);
  }

  .mapping-hint {
    font-size: var(--text-xs);
    color: var(--muted);
    padding: 0 var(--space-lg);
    margin: var(--space-xs) 0 var(--space-md);
    line-height: 1.4;
  }

  .sheet-locale-switcher {
    padding: var(--space-sm) var(--space-lg) 0;
  }
</style>
