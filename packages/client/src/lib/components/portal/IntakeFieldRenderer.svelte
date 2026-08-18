<!--
  Dynamic field renderer for the public intake form. Renders exactly the five
  schema field types using Konsta UI components. No conditional-sub-field API.
  Value changes via callback prop (runes idiom).
-->
<script lang="ts">
  import {
    List,
    ListItem,
    ListInput,
    Checkbox,
    BlockTitle,
  } from "konsta/svelte";
  import type { IntakeFieldConfig, AvailabilityData } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import FieldError from "$lib/components/FieldError.svelte";
  import AvailabilityField from "./AvailabilityField.svelte";

  interface IntakeFieldRendererProps {
    readonly fieldId: string;
    readonly label: string;
    readonly config: IntakeFieldConfig;
    readonly isRequired: boolean;
    readonly value: string | string[] | AvailabilityData | undefined;
    readonly error?: string;
    readonly onchange: (value: string | string[] | AvailabilityData) => void;
  }

  let {
    fieldId,
    label,
    config,
    isRequired,
    value,
    error,
    onchange,
  }: IntakeFieldRendererProps = $props();

  const inputId = $derived(`intake-field-${fieldId}`);
  const labelId = $derived(`intake-label-${fieldId}`);

  const requiredMarker = $derived(isRequired ? " *" : "");
  const displayLabel = $derived(`${label}${requiredMarker}`);

  function handleTextInput(e: Event): void {
    const target = e.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement
    ) {
      onchange(target.value);
    }
  }

  function handleSelectChange(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLSelectElement) {
      onchange(target.value);
    }
  }

  function handleCheckboxToggle(option: string): void {
    const current = Array.isArray(value) ? value : [];
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    onchange(next);
  }

  function handleAvailabilityChange(data: AvailabilityData): void {
    onchange(data);
  }

  const charCount = $derived.by((): { current: number; max: number } | null => {
    if (config.type !== "text" && config.type !== "textarea") return null;
    if (config.maxLength === undefined) return null;
    const current = typeof value === "string" ? value.length : 0;
    return { current, max: config.maxLength };
  });
</script>

{#if config.type === "text"}
  <label for={inputId} class="sr-only">{displayLabel}</label>
  <BlockTitle id={labelId}>{displayLabel}</BlockTitle>
  <List strong inset>
    <ListInput
      {inputId}
      type="text"
      placeholder={config.placeholder ?? ""}
      value={typeof value === "string" ? value : ""}
      maxlength={config.maxLength}
      autocomplete="off"
      aria-required={isRequired ? "true" : undefined}
      onInput={handleTextInput}
    />
  </List>
  {#if charCount}
    <p class="char-count" aria-hidden="true">
      {m.intake_char_count({ count: charCount.current, max: charCount.max })}
    </p>
  {/if}
  <FieldError message={error} />
{:else if config.type === "textarea"}
  <label for={inputId} class="sr-only">{displayLabel}</label>
  <BlockTitle id={labelId}>{displayLabel}</BlockTitle>
  <List strong inset>
    <ListInput
      {inputId}
      type="textarea"
      placeholder={config.placeholder ?? ""}
      value={typeof value === "string" ? value : ""}
      maxlength={config.maxLength}
      autocomplete="off"
      aria-required={isRequired ? "true" : undefined}
      onInput={handleTextInput}
    />
  </List>
  {#if charCount}
    <p class="char-count" aria-hidden="true">
      {m.intake_char_count({ count: charCount.current, max: charCount.max })}
    </p>
  {/if}
  <FieldError message={error} />
{:else if config.type === "select"}
  <label for={inputId} class="sr-only">{displayLabel}</label>
  <BlockTitle id={labelId}>{displayLabel}</BlockTitle>
  <List strong inset>
    <ListInput
      {inputId}
      type="select"
      dropdown
      value={typeof value === "string" ? value : ""}
      autocomplete="off"
      aria-required={isRequired ? "true" : undefined}
      onChange={handleSelectChange}
    >
      <option value="" disabled selected>{label}</option>
      {#each config.options as option (option)}
        <option value={option}>{option}</option>
      {/each}
    </ListInput>
  </List>
  <FieldError message={error} />
{:else if config.type === "multiselect"}
  <BlockTitle id={labelId}>{displayLabel}</BlockTitle>
  <List strong inset role="group" aria-labelledby={labelId}>
    {#each config.options as option (option)}
      <ListItem label title={option}>
        {#snippet media()}
          <Checkbox
            component="div"
            checked={Array.isArray(value) && value.includes(option)}
            onChange={() => handleCheckboxToggle(option)}
          />
        {/snippet}
      </ListItem>
    {/each}
  </List>
  <FieldError message={error} />
{:else if config.type === "availability"}
  <BlockTitle id={labelId}>{displayLabel}</BlockTitle>
  <AvailabilityField
    allowRecurring={config.allowRecurring}
    allowSpecific={config.allowSpecific}
    value={value !== undefined &&
    typeof value === "object" &&
    !Array.isArray(value)
      ? value
      : undefined}
    {error}
    onchange={handleAvailabilityChange}
  />
{/if}

<style>
  .char-count {
    font-size: var(--text-xs);
    color: var(--muted);
    text-align: right;
    padding: 0 var(--space-lg);
    margin: calc(-1 * var(--space-xs)) 0 0;
  }
</style>
