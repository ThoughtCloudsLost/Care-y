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
    intakeFieldTypeSchema,
    ticketPrioritySchema,
    textSubtypeSchema,
    visibilityOperatorSchema,
    resolveLocalized,
    normalizeVisibleWhen,
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
    type LocalizedRichText,
    type FormLocale,
    queueIdSchema,
  } from "@care-y/shared";
  import { SvelteSet } from "svelte/reactivity";
  import * as m from "$lib/paraglide/messages.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import FieldError from "$lib/components/FieldError.svelte";
  import FormContentEditor from "./FormContentEditor.svelte";
  import { getFieldTypeLabel, getRoleLabel } from "./intake-field-labels.js";
  import {
    readLocale,
    setLocaleText,
    hasContent,
    trimLocalized,
    trimLocalizedRichText,
    hasAnyRichContent,
  } from "$lib/utils/localized-text.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";

  // ---- Types ----

  import type {
    FieldConfigState,
    FieldConfigInitial,
    QueueOption,
    VolunteerOption,
    EarlierFieldOption,
  } from "./intake-field-config-types.js";
  import type {
    VisibleWhenV2,
    VisibilityRule,
    VisibilityOperator,
  } from "@care-y/shared";

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

  // Local mutable field type (F-004: type is changeable inside the sheet)
  let currentFieldType = $state<IntakeFieldType>("text");

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

  /**
   * Preserved type-specific config snapshots (F-004).
   * When the user switches type, the discarded config is stashed here
   * so switching back restores it. Dropped on save.
   */
  let preservedConfigs = $state<
    Partial<Record<IntakeFieldType, IntakeFieldConfig>>
  >({});

  // Role mapping state
  let queueRoutingMapping = $state<Record<string, QueueId>>({});
  let urgencyMapping = $state<Record<string, TicketPriority>>({});
  let escalationMapping = $state<Record<string, string>>({});
  let escalationRecipientIds = $state<string[]>([]);

  let atLeastOneError = $state("");

  // Conditional visibility state (v2: OR-of-AND groups)
  let conditionEnabled = $state(false);

  /** Local mutable rule shape used in the condition editor. */
  interface ConditionRule {
    fieldKey: string;
    operator: VisibilityOperator;
    optionKey: string;
    boolValue: boolean;
  }

  /** Max 10 OR-groups, max 20 AND-rules per group (schema caps). */
  const MAX_GROUPS = 10;
  const MAX_RULES_PER_GROUP = 20;

  let conditionGroups = $state<ConditionRule[][]>([]);

  // Page break state
  let pageBreakTitle = $state<LocalizedText>({});

  // Rich text block state
  let richTextBody = $state<LocalizedRichText>({});

  const orgKeyManager = getOrgKeyManager();

  /** Native locale name for display. */
  function localeName(loc: FormLocale): string {
    switch (loc) {
      case "en":
        return "EN";
      case "es":
        return "ES";
    }
  }

  // Compute compatible roles for the current (local) field type
  const compatibleRoles = $derived.by((): IntakeFieldRole[] => {
    const roles: IntakeFieldRole[] = [];
    for (const role of intakeFieldRoleSchema.options) {
      // eslint-disable-next-line security/detect-object-injection -- role is from the intakeFieldRoleSchema enum values
      const allowed = ROLE_WIDGET_COMPATIBILITY[role];
      if (allowed.includes(currentFieldType)) {
        roles.push(role);
      }
    }
    return roles;
  });

  // Reset state when sheet opens
  let wasOpened = $state(false);
  $effect(() => {
    if (opened && !wasOpened) {
      currentFieldType = fieldType;
      preservedConfigs = {};
      label = { ...initial.label };
      helpText = { ...initial.helpText };
      isRequired = initial.isRequired;
      selectedRole = initial.role;
      sheetLocale = parentLocale;
      escalationRecipientIds =
        initial.escalationRecipientIds != null
          ? [...initial.escalationRecipientIds]
          : [];

      // Restore conditional visibility (normalize v1 to v2 defensively)
      if (initial.visibleWhen != null) {
        const v2 = normalizeVisibleWhen(initial.visibleWhen);
        conditionEnabled = true;
        conditionGroups = v2.groups.map((group) =>
          group.map((r) => ({
            fieldKey: r.fieldKey,
            operator: r.operator,
            optionKey: r.optionKey ?? "",
            boolValue: r.boolValue ?? true,
          })),
        );
      } else {
        conditionEnabled = false;
        conditionGroups = [];
      }

      restoreConfigState(initial.config);
      atLeastOneError = "";
    }
    wasOpened = opened;
  });

  /**
   * Apply a config's values to the local editor state fields.
   * Used both when the sheet opens and when switching type restores
   * a previously preserved config.
   */
  function restoreConfigState(cfg: IntakeFieldConfig): void {
    // Reset all type-specific fields to defaults first
    subtype = "";
    numberMin = undefined;
    numberMax = undefined;
    placeholder = {};
    maxLength = undefined;
    options = [];
    requiredTrue = false;
    allowRecurring = true;
    allowSpecific = true;
    pageBreakTitle = {};
    richTextBody = {};
    queueRoutingMapping = {};
    urgencyMapping = {};
    escalationMapping = {};

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
        if (cfg.queueRoutingMapping != null)
          queueRoutingMapping = { ...cfg.queueRoutingMapping };
        if (cfg.urgencyMapping != null)
          urgencyMapping = { ...cfg.urgencyMapping };
        if (cfg.escalationMapping != null)
          escalationMapping = { ...cfg.escalationMapping };
        break;
      case "multiselect":
        options = cfg.options.map((o) => ({
          key: o.key,
          label: { ...o.label },
        }));
        if (cfg.queueRoutingMapping != null)
          queueRoutingMapping = { ...cfg.queueRoutingMapping };
        break;
      case "checkbox":
        requiredTrue = cfg.requiredTrue === true;
        break;
      case "availability":
        allowRecurring = cfg.allowRecurring;
        allowSpecific = cfg.allowSpecific;
        break;
      case "date":
        break;
      case "pageBreak":
        pageBreakTitle = cfg.title != null ? { ...cfg.title } : {};
        break;
      case "richText":
        richTextBody = { ...cfg.body };
        break;
    }
  }

  /**
   * Sensible defaults for each field type (F-004). Seeded when the user
   * switches to a type that has no preserved config.
   */
  function getTypeDefaults(type: IntakeFieldType): IntakeFieldConfig {
    switch (type) {
      case "text":
        return { type: "text", maxLength: 200 };
      case "textarea":
        return { type: "textarea", maxLength: 2000 };
      case "select":
        return {
          type: "select",
          options: [
            { key: crypto.randomUUID(), label: { en: "" } },
            { key: crypto.randomUUID(), label: { en: "" } },
          ],
        };
      case "multiselect":
        return {
          type: "multiselect",
          options: [
            { key: crypto.randomUUID(), label: { en: "" } },
            { key: crypto.randomUUID(), label: { en: "" } },
          ],
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

  /** Switch the field type, preserving the outgoing config and restoring any previously preserved config. */
  function switchFieldType(newType: IntakeFieldType): void {
    if (newType === currentFieldType) return;

    // Stash the current type's config so switching back restores it
    preservedConfigs = {
      ...preservedConfigs,
      [currentFieldType]: buildConfig(),
    };

    currentFieldType = newType;

    // Clear role if it is not compatible with the new type
    if (selectedRole != null) {
      // eslint-disable-next-line security/detect-object-injection -- selectedRole is from IntakeFieldRole enum
      const allowed = ROLE_WIDGET_COMPATIBILITY[selectedRole];
      if (!allowed.includes(newType)) {
        selectedRole = null;
      }
    }

    // Restore preserved config or seed defaults
    // eslint-disable-next-line security/detect-object-injection -- newType is from IntakeFieldType enum
    const preserved = preservedConfigs[newType];
    if (preserved != null) {
      restoreConfigState(preserved);
    } else {
      restoreConfigState(getTypeDefaults(newType));
    }
  }

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

  // ---- Build config ----

  /** Resolve the base-locale display text for an option. */
  function optionDisplayText(opt: IntakeOption): string {
    return resolveLocalized(opt.label, BASE_LOCALE) ?? "";
  }

  /** Read an option label in the current sheet locale. */
  function optionLocaleText(opt: IntakeOption): string {
    return readLocale(opt.label, sheetLocale);
  }

  function buildConfig(): IntakeFieldConfig {
    const ht = hasContent(helpText) ? trimLocalized(helpText) : undefined;
    if (currentFieldType === "text") {
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
    if (currentFieldType === "textarea") {
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
    if (currentFieldType === "select") {
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
    if (currentFieldType === "multiselect") {
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
    if (currentFieldType === "checkbox") {
      return {
        type: "checkbox",
        ...(requiredTrue ? { requiredTrue: true } : {}),
        ...(ht != null ? { helpText: ht } : {}),
      };
    }
    if (currentFieldType === "date") {
      return {
        type: "date",
        ...(ht != null ? { helpText: ht } : {}),
      };
    }
    if (currentFieldType === "pageBreak") {
      const pt = hasContent(pageBreakTitle)
        ? trimLocalized(pageBreakTitle)
        : undefined;
      return {
        type: "pageBreak",
        ...(pt != null ? { title: pt } : {}),
      };
    }
    if (currentFieldType === "richText") {
      const trimmed = trimLocalizedRichText(richTextBody);
      return {
        type: "richText",
        body: hasAnyRichContent(trimmed) ? trimmed : {},
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

  /** Build a v2 visibleWhen from the condition editor groups. */
  function buildVisibleWhen(): VisibleWhenV2 | undefined {
    if (!conditionEnabled || conditionGroups.length === 0) return undefined;

    const groups: VisibilityRule[][] = [];
    for (const group of conditionGroups) {
      const rules: VisibilityRule[] = group
        .filter((r) => r.fieldKey !== "")
        .map((r): VisibilityRule => {
          const base: Pick<VisibilityRule, "fieldKey" | "operator"> = {
            fieldKey: r.fieldKey,
            operator: r.operator,
          };
          if (
            r.operator === "equals" ||
            r.operator === "notEquals" ||
            r.operator === "includes" ||
            r.operator === "notIncludes"
          ) {
            return { ...base, optionKey: r.optionKey };
          }
          if (r.operator === "checked") {
            return { ...base, boolValue: r.boolValue };
          }
          // isEmpty / isNotEmpty carry neither optionKey nor boolValue
          return base;
        });
      if (rules.length > 0) {
        groups.push(rules);
      }
    }

    if (groups.length === 0) return undefined;
    return { version: 2, groups };
  }

  /** Default empty rule for new conditions. */
  function emptyRule(): ConditionRule {
    return { fieldKey: "", operator: "equals", optionKey: "", boolValue: true };
  }

  /** Auto-select the default operator for a field type. */
  function defaultOperatorForType(
    ft: IntakeFieldType | undefined,
  ): VisibilityOperator {
    switch (ft) {
      case "checkbox":
        return "checked";
      case "multiselect":
        return "includes";
      case "text":
      case "textarea":
      case "date":
        return "isNotEmpty";
      case "select":
      case "availability":
      case "pageBreak":
      case "richText":
      case undefined:
        return "equals";
    }
  }

  /** Add an AND-rule to the last group (or create the first group). */
  function addAndCondition(): void {
    if (conditionGroups.length === 0) {
      conditionGroups = [[emptyRule()]];
      return;
    }
    const lastIdx = conditionGroups.length - 1;
    const lastGroup = conditionGroups.at(lastIdx);
    if (lastGroup === undefined) return;
    if (lastGroup.length >= MAX_RULES_PER_GROUP) return;
    conditionGroups = conditionGroups.map((g, i) =>
      i === lastIdx ? [...g, emptyRule()] : g,
    );
  }

  /** Start a new OR-group with one empty rule. */
  function addOrCondition(): void {
    if (conditionGroups.length >= MAX_GROUPS) return;
    conditionGroups = [...conditionGroups, [emptyRule()]];
  }

  /** Remove a rule from a group. Drops the group when empty. */
  function removeConditionRule(groupIdx: number, ruleIdx: number): void {
    const updated = conditionGroups
      .map((g, gi) => {
        if (gi !== groupIdx) return g;
        return g.filter((_, ri) => ri !== ruleIdx);
      })
      .filter((g) => g.length > 0);
    conditionGroups = updated;
  }

  /** Total rule count across all groups. */
  const totalRuleCount = $derived(
    conditionGroups.reduce((sum, g) => sum + g.length, 0),
  );

  /** Whether the last group has hit its per-group cap. */
  const lastGroupAtCap = $derived.by((): boolean => {
    if (conditionGroups.length === 0) return false;
    const last = conditionGroups.at(conditionGroups.length - 1);
    return last !== undefined && last.length >= MAX_RULES_PER_GROUP;
  });

  /** Update a condition rule field selection. */
  function handleConditionFieldChange(
    groupIdx: number,
    ruleIdx: number,
    e: Event,
  ): void {
    const target = e.target;
    if (!(target instanceof HTMLSelectElement)) return;
    const fk = target.value;
    const ef = earlierFields.find((f) => f.fieldKey === fk);
    const op = defaultOperatorForType(ef?.fieldType);
    conditionGroups = conditionGroups.map((g, gi) => {
      if (gi !== groupIdx) return g;
      return g.map((r, ri) =>
        ri === ruleIdx
          ? { ...r, fieldKey: fk, operator: op, optionKey: "", boolValue: true }
          : r,
      );
    });
  }

  /** Update a condition rule operator. */
  function handleConditionOperatorChange(
    groupIdx: number,
    ruleIdx: number,
    e: Event,
  ): void {
    const target = e.target;
    if (!(target instanceof HTMLSelectElement)) return;
    const parsed = visibilityOperatorSchema.safeParse(target.value);
    if (!parsed.success) return;
    conditionGroups = conditionGroups.map((g, gi) => {
      if (gi !== groupIdx) return g;
      return g.map((r, ri) =>
        ri === ruleIdx ? { ...r, operator: parsed.data } : r,
      );
    });
  }

  /** Update a condition rule option key value. */
  function handleConditionValueChange(
    groupIdx: number,
    ruleIdx: number,
    e: Event,
  ): void {
    const target = e.target;
    if (!(target instanceof HTMLSelectElement)) return;
    conditionGroups = conditionGroups.map((g, gi) => {
      if (gi !== groupIdx) return g;
      return g.map((r, ri) =>
        ri === ruleIdx ? { ...r, optionKey: target.value } : r,
      );
    });
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
    if (currentFieldType === "pageBreak") {
      const result: FieldConfigState = {
        fieldType: currentFieldType,
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

    // Rich text blocks carry only body content and an optional condition
    if (currentFieldType === "richText") {
      const result: FieldConfigState = {
        fieldType: currentFieldType,
        label: {},
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
      (currentFieldType === "select" || currentFieldType === "multiselect") &&
      !options.some((o) => optionDisplayText(o).trim().length > 0)
    ) {
      optionsError = m.intake_forms_config_options_required();
      return;
    }
    const result: FieldConfigState = {
      fieldType: currentFieldType,
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

  <!-- Field type selector (F-004: type at the top, changeable in place) -->
  <List strong inset>
    <ListInput
      label={m.intake_forms_config_field_type_label()}
      type="select"
      dropdown
      value={currentFieldType}
      onChange={(e: Event) => {
        const target = e.target;
        if (target instanceof HTMLSelectElement) {
          const parsed = intakeFieldTypeSchema.safeParse(target.value);
          if (parsed.success) switchFieldType(parsed.data);
        }
      }}
    >
      {#each intakeFieldTypeSchema.options as ft (ft)}
        <option value={ft}>{getFieldTypeLabel(ft)}</option>
      {/each}
    </ListInput>
  </List>

  {#if currentFieldType === "pageBreak"}
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
  {:else if currentFieldType === "richText"}
    <!-- Rich text block config: FormContentEditor for the body -->
    <div class="rich-text-editor-wrapper">
      <FormContentEditor
        value={richTextBody}
        locale={sheetLocale}
        onchange={(updated: LocalizedRichText) => {
          richTextBody = updated;
        }}
        label={m.intake_forms_field_type_rich_text()}
        orgPublicKey={orgKeyManager.getPublicKey()}
      />
    </div>
  {:else}
    <!-- Role picker (ADR-068), positioned after type per F-004 -->
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

  {#if currentFieldType === "text" || currentFieldType === "textarea"}
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
      {#if currentFieldType === "text"}
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

  {#if currentFieldType === "select" || currentFieldType === "multiselect"}
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

  {#if currentFieldType === "checkbox"}
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

  {#if currentFieldType === "availability"}
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
  {#if selectedRole === "queue-routing" && (currentFieldType === "select" || currentFieldType === "multiselect")}
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
  {#if selectedRole === "urgency" && currentFieldType === "select"}
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
  {#if selectedRole === "escalation" && currentFieldType === "select"}
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
  {#if selectedRole === "escalation" && currentFieldType === "checkbox"}
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

  <!-- Conditional visibility builder (v2: OR-of-AND groups) -->
  {#if earlierFields.length > 0}
    <BlockTitle>{m.intake_forms_config_condition_heading()}</BlockTitle>
    <List strong inset>
      <ListItem title={m.intake_forms_config_condition_heading()}>
        {#snippet after()}
          <Toggle
            checked={conditionEnabled}
            onChange={() => {
              conditionEnabled = !conditionEnabled;
              if (conditionEnabled && conditionGroups.length === 0) {
                addAndCondition();
              }
            }}
          />
        {/snippet}
      </ListItem>
    </List>
    <p class="mapping-hint">{m.intake_forms_config_condition_hint()}</p>

    {#if conditionEnabled}
      {#each conditionGroups as group, groupIdx (groupIdx)}
        {#if groupIdx > 0}
          <p class="condition-or-separator">
            {m.intake_forms_config_condition_or_separator()}
          </p>
        {/if}
        <List strong inset>
          {#each group as rule, ruleIdx (ruleIdx)}
            <ListInput
              label={m.intake_forms_config_condition_field_label()}
              type="select"
              dropdown
              value={rule.fieldKey}
              onChange={(e: Event) =>
                handleConditionFieldChange(groupIdx, ruleIdx, e)}
            >
              <option value="">---</option>
              {#each earlierFields as ef (ef.fieldKey)}
                <option value={ef.fieldKey}>{ef.label}</option>
              {/each}
            </ListInput>

            {#if rule.fieldKey !== ""}
              {@const driverType = getFieldType(rule.fieldKey)}
              {#if driverType === "select"}
                <ListInput
                  label={m.intake_forms_config_condition_operator_label()}
                  type="select"
                  dropdown
                  value={rule.operator}
                  onChange={(e: Event) =>
                    handleConditionOperatorChange(groupIdx, ruleIdx, e)}
                >
                  <option value="equals"
                    >{m.intake_forms_config_condition_op_equals()}</option
                  >
                  <option value="notEquals"
                    >{m.intake_forms_config_condition_op_not_equals()}</option
                  >
                </ListInput>
              {:else if driverType === "multiselect"}
                <ListInput
                  label={m.intake_forms_config_condition_operator_label()}
                  type="select"
                  dropdown
                  value={rule.operator}
                  onChange={(e: Event) =>
                    handleConditionOperatorChange(groupIdx, ruleIdx, e)}
                >
                  <option value="includes"
                    >{m.intake_forms_config_condition_op_includes()}</option
                  >
                  <option value="notIncludes"
                    >{m.intake_forms_config_condition_op_not_includes()}</option
                  >
                </ListInput>
              {:else if driverType === "text" || driverType === "textarea" || driverType === "date"}
                <ListInput
                  label={m.intake_forms_config_condition_operator_label()}
                  type="select"
                  dropdown
                  value={rule.operator}
                  onChange={(e: Event) =>
                    handleConditionOperatorChange(groupIdx, ruleIdx, e)}
                >
                  <option value="isEmpty"
                    >{m.intake_forms_config_condition_op_is_empty()}</option
                  >
                  <option value="isNotEmpty"
                    >{m.intake_forms_config_condition_op_is_not_empty()}</option
                  >
                </ListInput>
              {/if}
              <!-- checkbox: no operator picker (toggle polarity below) -->

              {#if rule.operator === "equals" || rule.operator === "notEquals" || rule.operator === "includes" || rule.operator === "notIncludes"}
                <ListInput
                  label={m.intake_forms_config_condition_value_label()}
                  type="select"
                  dropdown
                  value={rule.optionKey}
                  onChange={(e: Event) =>
                    handleConditionValueChange(groupIdx, ruleIdx, e)}
                >
                  <option value="">---</option>
                  {#each getFieldOptions(rule.fieldKey) as opt (opt.key)}
                    <option value={opt.key}>{opt.label}</option>
                  {/each}
                </ListInput>
              {/if}

              {#if driverType === "checkbox"}
                <ListItem
                  title={rule.boolValue
                    ? m.intake_forms_config_condition_op_checked()
                    : m.intake_forms_config_condition_op_unchecked()}
                >
                  {#snippet after()}
                    <Toggle
                      checked={rule.boolValue}
                      onChange={() => {
                        conditionGroups = conditionGroups.map((g, gi) => {
                          if (gi !== groupIdx) return g;
                          return g.map((r, ri) =>
                            ri === ruleIdx
                              ? { ...r, boolValue: !r.boolValue }
                              : r,
                          );
                        });
                      }}
                    />
                  {/snippet}
                </ListItem>
              {/if}
            {/if}

            {#if totalRuleCount > 1}
              <ListItem>
                {#snippet inner()}
                  <Button
                    small
                    clear
                    onclick={() => removeConditionRule(groupIdx, ruleIdx)}
                    aria-label={m.intake_forms_config_condition_remove_rule()}
                  >
                    {m.intake_forms_config_condition_remove_rule()}
                  </Button>
                {/snippet}
              </ListItem>
            {/if}
          {/each}
        </List>
      {/each}
      <div class="config-action condition-buttons">
        <Button
          small
          outline
          onclick={addAndCondition}
          disabled={lastGroupAtCap}
        >
          {m.intake_forms_config_condition_add_and()}
        </Button>
        <Button
          small
          outline
          onclick={addOrCondition}
          disabled={conditionGroups.length >= MAX_GROUPS}
        >
          {m.intake_forms_config_condition_add_or()}
        </Button>
      </div>
    {/if}
  {:else if currentFieldType !== "pageBreak"}
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

  .rich-text-editor-wrapper {
    padding: 0 var(--space-lg);
    margin-top: var(--space-sm);
  }

  .condition-or-separator {
    text-align: center;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: var(--space-sm) 0;
  }

  .condition-buttons {
    display: flex;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
  }
</style>
