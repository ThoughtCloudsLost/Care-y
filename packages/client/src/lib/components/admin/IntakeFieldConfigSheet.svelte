<!--
  Field configuration sheet for the admin form builder.
  Renders inside a ShellSheet with role="dialog" and aria-modal="true".
  Configures label, required state, type-specific options, semantic role
  (ADR-068), and role-specific mapping editors (queue routing, urgency,
  escalation with recipient picker).
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
  } from "konsta/svelte";
  import {
    ROLE_WIDGET_COMPATIBILITY,
    intakeFieldRoleSchema,
    ticketPrioritySchema,
    type IntakeFieldConfig,
    type IntakeFieldType,
    type IntakeFieldRole,
    type TicketPriority,
    type QueueId,
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
  } from "./intake-field-config-types.js";

  interface IntakeFieldConfigSheetProps {
    readonly opened: boolean;
    readonly fieldType: IntakeFieldType;
    readonly initial: FieldConfigInitial;
    readonly queues: readonly QueueOption[];
    readonly volunteers: readonly VolunteerOption[];
    readonly ondone: (result: FieldConfigState) => void;
    readonly ondismiss: () => void;
  }

  let {
    opened,
    fieldType,
    initial,
    queues,
    volunteers,
    ondone,
    ondismiss,
  }: IntakeFieldConfigSheetProps = $props();

  let label = $state("");
  let isRequired = $state(false);

  // Type-specific config state
  let placeholder = $state("");
  let maxLength = $state<number | undefined>(undefined);
  let options = $state<string[]>([]);
  let allowRecurring = $state(true);
  let allowSpecific = $state(true);
  let requiredTrue = $state(false);

  // Role state (ADR-068)
  let selectedRole = $state<IntakeFieldRole | null>(null);

  // Role mapping state
  let queueRoutingMapping = $state<Record<string, QueueId>>({});
  let urgencyMapping = $state<Record<string, TicketPriority>>({});
  let escalationMapping = $state<Record<string, string>>({});
  let escalationRecipientIds = $state<string[]>([]);

  let atLeastOneError = $state("");

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
      label = initial.label;
      isRequired = initial.isRequired;
      selectedRole = initial.role;
      escalationRecipientIds =
        initial.escalationRecipientIds != null
          ? [...initial.escalationRecipientIds]
          : [];

      const cfg = initial.config;
      switch (cfg.type) {
        case "text":
        case "textarea":
          placeholder = cfg.placeholder ?? "";
          maxLength = cfg.maxLength;
          break;
        case "select":
          options = [...cfg.options];
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
          options = [...cfg.options];
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
      label = target.value;
    }
  }

  function handlePlaceholderInput(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      placeholder = target.value;
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
      options = options.map((o, i) => (i === index ? target.value : o));
    }
  }

  function addOption(): void {
    options = [...options, ""];
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

  function handleQueueMappingChange(optionLabel: string, e: Event): void {
    const target = e.target;
    if (target instanceof HTMLSelectElement) {
      const val = target.value;
      if (val === "") {
        // Remove mapping for this option via destructure-rest
        const { [optionLabel]: _removed, ...rest } = queueRoutingMapping;
        queueRoutingMapping = rest;
      } else {
        queueRoutingMapping = {
          ...queueRoutingMapping,
          [optionLabel]: queueIdSchema.parse(val),
        };
      }
    }
  }

  function handleUrgencyMappingChange(optionLabel: string, e: Event): void {
    const target = e.target;
    if (target instanceof HTMLSelectElement) {
      const val = target.value;
      if (val === "") {
        const { [optionLabel]: _removed, ...rest } = urgencyMapping;
        urgencyMapping = rest;
      } else {
        const parsed = ticketPrioritySchema.safeParse(val);
        if (parsed.success) {
          urgencyMapping = {
            ...urgencyMapping,
            [optionLabel]: parsed.data,
          };
        }
      }
    }
  }

  function handleEscalationMappingChange(optionLabel: string, e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      const val = target.value;
      if (val === "") {
        const { [optionLabel]: _removed, ...rest } = escalationMapping;
        escalationMapping = rest;
      } else {
        escalationMapping = { ...escalationMapping, [optionLabel]: val };
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

  function buildConfig(): IntakeFieldConfig {
    if (fieldType === "text") {
      return {
        type: "text",
        ...(placeholder ? { placeholder } : {}),
        ...(maxLength !== undefined ? { maxLength } : {}),
      };
    }
    if (fieldType === "textarea") {
      return {
        type: "textarea",
        ...(placeholder ? { placeholder } : {}),
        ...(maxLength !== undefined ? { maxLength } : {}),
      };
    }
    if (fieldType === "select") {
      const filteredOptions = options.filter((o) => o.length > 0);
      const cfg: IntakeFieldConfig = {
        type: "select",
        options: filteredOptions,
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
      const filteredOptions = options.filter((o) => o.length > 0);
      const cfg: IntakeFieldConfig = {
        type: "multiselect",
        options: filteredOptions,
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
      };
    }
    return { type: "availability", allowRecurring, allowSpecific };
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

  function handleDone(): void {
    const result: FieldConfigState = {
      label,
      isRequired,
      config: buildConfig(),
      role: selectedRole,
      routingQueueIds: deriveRoutingQueueIds(),
      escalationRecipientIds:
        selectedRole === "escalation" && escalationRecipientIds.length > 0
          ? escalationRecipientIds
          : null,
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
    <Button small clear onclick={handleDone}>
      {m.intake_forms_config_done()}
    </Button>
  {/snippet}

  <List strong inset>
    <ListInput
      label={m.intake_forms_config_label()}
      type="text"
      value={label}
      onInput={handleLabelInput}
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

  {#if fieldType === "text" || fieldType === "textarea"}
    <List strong inset>
      <ListInput
        label={m.intake_forms_config_placeholder()}
        type="text"
        value={placeholder}
        onInput={handlePlaceholderInput}
      />
      <ListInput
        label={m.intake_forms_config_max_length()}
        type="number"
        value={maxLength !== undefined ? String(maxLength) : ""}
        onInput={handleMaxLengthInput}
      />
    </List>
  {/if}

  {#if fieldType === "select" || fieldType === "multiselect"}
    <List strong inset>
      {#each options as option, index (index)}
        <ListInput
          label={`${m.intake_forms_config_options()} ${String(index + 1)}`}
          type="text"
          value={option}
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

  <!-- Role picker (ADR-068) -->
  {#if compatibleRoles.length > 0}
    <BlockTitle>{m.intake_forms_config_role_label()}</BlockTitle>
    <List strong inset>
      <ListInput
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

  <!-- Queue routing mapping editor -->
  {#if selectedRole === "queue-routing" && (fieldType === "select" || fieldType === "multiselect")}
    <BlockTitle>{m.intake_forms_config_queue_mapping_title()}</BlockTitle>
    <List strong inset>
      {#each options.filter((o) => o.length > 0) as optionLabel (optionLabel)}
        <ListInput
          label={optionLabel}
          type="select"
          dropdown
          value={getQueueMapping(optionLabel)}
          onChange={(e: Event) => handleQueueMappingChange(optionLabel, e)}
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
      {#each options.filter((o) => o.length > 0) as optionLabel (optionLabel)}
        <ListInput
          label={optionLabel}
          type="select"
          dropdown
          value={getUrgencyMapping(optionLabel)}
          onChange={(e: Event) => handleUrgencyMappingChange(optionLabel, e)}
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
      {#each options.filter((o) => o.length > 0) as optionLabel (optionLabel)}
        <ListInput
          label={optionLabel}
          type="text"
          placeholder={m.intake_forms_config_escalation_alert_label()}
          value={getEscalationMapping(optionLabel)}
          onInput={(e: Event) => handleEscalationMappingChange(optionLabel, e)}
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
</style>
