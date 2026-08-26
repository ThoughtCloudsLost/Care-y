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
  import {
    resolveLocalized,
    BASE_LOCALE,
    type IntakeFieldConfig,
    type IntakeFieldRole,
    type IntakeOption,
    type AvailabilityData,
    type FormLocale,
  } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import FieldError from "$lib/components/FieldError.svelte";
  import AvailabilityField from "./AvailabilityField.svelte";
  import IntakePrivacyIndicator from "./IntakePrivacyIndicator.svelte";

  interface IntakeFieldRendererProps {
    readonly fieldId: string;
    readonly label: string;
    readonly helpText?: string;
    readonly config: IntakeFieldConfig;
    readonly isRequired: boolean;
    readonly role?: IntakeFieldRole | null;
    readonly locale?: FormLocale;
    readonly value: string | string[] | AvailabilityData | boolean | undefined;
    readonly error?: string;
    readonly onchange: (
      value: string | string[] | AvailabilityData | boolean,
    ) => void;
  }

  let {
    fieldId,
    label,
    helpText,
    config,
    isRequired,
    role = null,
    locale = BASE_LOCALE,
    value,
    error,
    onchange,
  }: IntakeFieldRendererProps = $props();

  /** Resolve help text from config or prop, respecting locale. */
  const resolvedHelpText = $derived.by((): string | undefined => {
    // Prop-level helpText takes priority (used by the editor preview)
    if (helpText != null && helpText.length > 0) return helpText;
    // Fall back to config-embedded helpText when present.
    // richText configs have no helpText property.
    if (config.type !== "richText" && config.helpText != null) {
      return resolveLocalized(config.helpText, locale);
    }
    return undefined;
  });

  /** Resolve display text for a localized option. */
  function optionText(opt: IntakeOption): string {
    return resolveLocalized(opt.label, locale) ?? opt.key;
  }

  const inputId = $derived(`intake-field-${fieldId}`);
  const labelId = $derived(`intake-label-${fieldId}`);
  const helpTextId = $derived(`intake-help-${fieldId}`);

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

  function handleCheckboxSingleToggle(): void {
    onchange(value !== true);
  }

  function handleAvailabilityChange(data: AvailabilityData): void {
    onchange(data);
  }

  /** Server-metadata roles produce a plaintext derived signal at submit. */
  const SERVER_METADATA_ROLES: ReadonlySet<string> = new Set([
    "queue-routing",
    "urgency",
    "escalation",
  ]);

  const charCount = $derived.by((): { current: number; max: number } | null => {
    if (config.type !== "text" && config.type !== "textarea") return null;
    if (config.maxLength === undefined) return null;
    const current = typeof value === "string" ? value.length : 0;
    return { current, max: config.maxLength };
  });

  function handleDateInput(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      onchange(target.value);
    }
  }

  /**
   * Compile-time exhaustiveness check. If a new field type is added to the
   * IntakeFieldType union without a corresponding renderer branch, this
   * function call produces a type error (string not assignable to never).
   */
  function assertExhaustive(_type: never): void {
    // Runtime fallback handled in the template; this exists only for
    // the type-level check.
  }
</script>

{#if config.type === "text"}
  <label for={inputId} class="sr-only">{displayLabel}</label>
  <BlockTitle id={labelId}>{displayLabel}</BlockTitle>
  <List strong inset>
    <ListInput
      {inputId}
      type={config.subtype === "email"
        ? "email"
        : config.subtype === "phone"
          ? "tel"
          : config.subtype === "number"
            ? "number"
            : "text"}
      placeholder={resolveLocalized(config.placeholder, locale) ?? ""}
      value={typeof value === "string" ? value : ""}
      maxlength={config.maxLength}
      autocomplete="off"
      required={isRequired}
      aria-describedby={resolvedHelpText != null && resolvedHelpText.length > 0
        ? helpTextId
        : undefined}
      onInput={handleTextInput}
    >
      {#snippet info()}
        {#if resolvedHelpText}
          <span id={helpTextId} class="field-help-text">{resolvedHelpText}</span
          >
        {/if}
        {#if charCount}
          <span class="char-count" aria-hidden="true">
            {m.intake_char_count({
              count: charCount.current,
              max: charCount.max,
            })}
          </span>
        {/if}
      {/snippet}
    </ListInput>
  </List>
  <FieldError message={error} />
  {#if role}
    <IntakePrivacyIndicator
      hasMetadataSignal={SERVER_METADATA_ROLES.has(role)}
    />
  {/if}
{:else if config.type === "textarea"}
  <label for={inputId} class="sr-only">{displayLabel}</label>
  <BlockTitle id={labelId}>{displayLabel}</BlockTitle>
  <List strong inset>
    <ListInput
      {inputId}
      type="textarea"
      placeholder={resolveLocalized(config.placeholder, locale) ?? ""}
      value={typeof value === "string" ? value : ""}
      maxlength={config.maxLength}
      autocomplete="off"
      required={isRequired}
      aria-describedby={resolvedHelpText != null && resolvedHelpText.length > 0
        ? helpTextId
        : undefined}
      onInput={handleTextInput}
    >
      {#snippet info()}
        {#if resolvedHelpText}
          <span id={helpTextId} class="field-help-text">{resolvedHelpText}</span
          >
        {/if}
        {#if charCount}
          <span class="char-count" aria-hidden="true">
            {m.intake_char_count({
              count: charCount.current,
              max: charCount.max,
            })}
          </span>
        {/if}
      {/snippet}
    </ListInput>
  </List>
  <FieldError message={error} />
  {#if role}
    <IntakePrivacyIndicator
      hasMetadataSignal={SERVER_METADATA_ROLES.has(role)}
    />
  {/if}
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
      required={isRequired}
      aria-describedby={resolvedHelpText != null && resolvedHelpText.length > 0
        ? helpTextId
        : undefined}
      onChange={handleSelectChange}
    >
      <option value="" disabled selected>{label}</option>
      {#each config.options as option (option.key)}
        <option value={option.key}>{optionText(option)}</option>
      {/each}
      {#snippet info()}
        {#if resolvedHelpText}
          <span id={helpTextId} class="field-help-text">{resolvedHelpText}</span
          >
        {/if}
      {/snippet}
    </ListInput>
  </List>
  <FieldError message={error} />
  {#if role}
    <IntakePrivacyIndicator
      hasMetadataSignal={SERVER_METADATA_ROLES.has(role)}
    />
  {/if}
{:else if config.type === "multiselect"}
  <BlockTitle id={labelId}>{displayLabel}</BlockTitle>
  {#if resolvedHelpText}
    <p id={helpTextId} class="field-help-text">{resolvedHelpText}</p>
  {/if}
  <List
    strong
    inset
    role="group"
    aria-labelledby={labelId}
    aria-describedby={resolvedHelpText != null && resolvedHelpText.length > 0
      ? helpTextId
      : undefined}
  >
    {#each config.options as option (option.key)}
      <ListItem label title={optionText(option)}>
        {#snippet media()}
          <Checkbox
            component="div"
            checked={Array.isArray(value) && value.includes(option.key)}
            onChange={() => handleCheckboxToggle(option.key)}
          />
        {/snippet}
      </ListItem>
    {/each}
  </List>
  <FieldError message={error} />
  {#if role}
    <IntakePrivacyIndicator
      hasMetadataSignal={SERVER_METADATA_ROLES.has(role)}
    />
  {/if}
{:else if config.type === "checkbox"}
  {#if resolvedHelpText}
    <p id={helpTextId} class="field-help-text">{resolvedHelpText}</p>
  {/if}
  <List strong inset>
    <ListItem
      label
      title={displayLabel}
      aria-describedby={resolvedHelpText != null && resolvedHelpText.length > 0
        ? helpTextId
        : undefined}
    >
      {#snippet media()}
        <Checkbox
          component="div"
          checked={value === true}
          onChange={handleCheckboxSingleToggle}
        />
      {/snippet}
    </ListItem>
  </List>
  <FieldError message={error} />
  {#if role}
    <IntakePrivacyIndicator
      hasMetadataSignal={SERVER_METADATA_ROLES.has(role)}
    />
  {/if}
{:else if config.type === "availability"}
  <BlockTitle id={labelId}>{displayLabel}</BlockTitle>
  {#if resolvedHelpText}
    <p id={helpTextId} class="field-help-text">{resolvedHelpText}</p>
  {/if}
  <div
    role="group"
    aria-labelledby={labelId}
    aria-describedby={resolvedHelpText != null && resolvedHelpText.length > 0
      ? helpTextId
      : undefined}
  >
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
  </div>
{:else if config.type === "date"}
  <label for={inputId} class="sr-only">{displayLabel}</label>
  <BlockTitle id={labelId}>{displayLabel}</BlockTitle>
  <List strong inset>
    <ListInput
      {inputId}
      type="date"
      value={typeof value === "string" ? value : ""}
      autocomplete="off"
      required={isRequired}
      aria-describedby={resolvedHelpText != null && resolvedHelpText.length > 0
        ? helpTextId
        : undefined}
      onInput={handleDateInput}
    >
      {#snippet info()}
        {#if resolvedHelpText}
          <span id={helpTextId} class="field-help-text">{resolvedHelpText}</span
          >
        {/if}
      {/snippet}
    </ListInput>
  </List>
  <FieldError message={error} />
  {#if role}
    <IntakePrivacyIndicator
      hasMetadataSignal={SERVER_METADATA_ROLES.has(role)}
    />
  {/if}
{:else if config.type === "pageBreak"}
  <!-- Page breaks are handled at the body/editor level, not rendered as fields.
       This branch exists for exhaustiveness. -->
{:else if config.type === "richText"}
  <!-- Rich text blocks are structural content, not input fields.
       Rendering handled in a later task; branch exists for exhaustiveness. -->
{:else}
  <!-- Exhaustiveness guard: compile-time error if a field type branch is missing -->
  {assertExhaustive(config)}
  <BlockTitle>{displayLabel}</BlockTitle>
  <p class="field-unknown-type" role="alert">
    {m.intake_field_unknown_type()}
  </p>
{/if}

<style>
  .char-count {
    font-size: var(--text-xs);
    color: var(--muted);
    text-align: right;
    display: block;
    margin-top: 2px;
  }

  .field-help-text {
    font-size: var(--text-xs);
    color: var(--muted);
    display: block;
    line-height: 1.4;
    white-space: pre-line;
  }

  /* Help text outside a ListInput (multiselect, checkbox, availability)
     needs horizontal padding to align with inset list cards. Inside the
     info slot, Konsta handles the layout. */
  p.field-help-text {
    padding: 0 var(--space-lg);
    margin: var(--space-xs) 0 0;
  }

  .field-unknown-type {
    font-size: var(--text-sm);
    color: var(--muted);
    padding: 0 var(--space-lg);
    font-style: italic;
  }
</style>
