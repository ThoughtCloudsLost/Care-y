<!--
  Field configuration sheet for the admin form builder.
  Renders inside a ShellSheet with role="dialog" and aria-modal="true".
  Configures label, required state, and type-specific options.
-->
<script lang="ts">
  import { List, ListItem, ListInput, Toggle, Button } from "konsta/svelte";
  import type { IntakeFieldConfig, IntakeFieldType } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import FieldError from "$lib/components/FieldError.svelte";

  interface FieldConfigState {
    readonly label: string;
    readonly isRequired: boolean;
    readonly config: IntakeFieldConfig;
  }

  interface IntakeFieldConfigSheetProps {
    readonly opened: boolean;
    readonly fieldType: IntakeFieldType;
    readonly initial: FieldConfigState;
    readonly ondone: (result: FieldConfigState) => void;
    readonly ondismiss: () => void;
  }

  let {
    opened,
    fieldType,
    initial,
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

  let atLeastOneError = $state("");

  // Reset state when sheet opens
  let wasOpened = $state(false);
  $effect(() => {
    if (opened && !wasOpened) {
      label = initial.label;
      isRequired = initial.isRequired;

      const cfg = initial.config;
      switch (cfg.type) {
        case "text":
        case "textarea":
          placeholder = cfg.placeholder ?? "";
          maxLength = cfg.maxLength;
          break;
        case "select":
        case "multiselect":
          options = [...cfg.options];
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
      return { type: "select", options: options.filter((o) => o.length > 0) };
    }
    if (fieldType === "multiselect") {
      return {
        type: "multiselect",
        options: options.filter((o) => o.length > 0),
      };
    }
    return { type: "availability", allowRecurring, allowSpecific };
  }

  function handleDone(): void {
    const result: FieldConfigState = {
      label,
      isRequired,
      config: buildConfig(),
    };
    ondone(result);
  }
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
</ShellSheet>

<style>
  .config-action {
    padding: 0 var(--space-lg);
    margin-top: var(--space-sm);
  }
</style>
