<!--
  Availability picker for the intake form. Collects recurring and specific
  time windows in the client's local timezone. Emits AvailabilityData with
  local HH:mm strings and the IANA zone name (no UTC conversion client-side).
-->
<script lang="ts">
  import {
    List,
    ListInput,
    Button,
    Block,
    BlockTitle,
    Searchbar,
    ListItem,
  } from "konsta/svelte";
  import { SvelteMap } from "svelte/reactivity";
  import { dayOfWeekSchema } from "@care-y/shared";
  import type { AvailabilityData, DayOfWeek } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import FieldError from "$lib/components/FieldError.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";

  interface AvailabilityFieldProps {
    readonly allowRecurring: boolean;
    readonly allowSpecific: boolean;
    readonly value: AvailabilityData | undefined;
    readonly error?: string;
    readonly onchange: (data: AvailabilityData) => void;
  }

  let {
    allowRecurring,
    allowSpecific,
    value,
    error,
    onchange,
  }: AvailabilityFieldProps = $props();

  const MAX_RECURRING = 21;
  const MAX_SPECIFIC = 30;

  const DAYS: readonly DayOfWeek[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ] as const;

  const dayLabels: Record<DayOfWeek, () => string> = {
    monday: () => m.intake_avail_day_monday(),
    tuesday: () => m.intake_avail_day_tuesday(),
    wednesday: () => m.intake_avail_day_wednesday(),
    thursday: () => m.intake_avail_day_thursday(),
    friday: () => m.intake_avail_day_friday(),
    saturday: () => m.intake_avail_day_saturday(),
    sunday: () => m.intake_avail_day_sunday(),
  };

  // Timezone state: captures initial value from prop, then managed internally.
  // svelte-ignore state_referenced_locally
  let timezone = $state(
    value?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  let timezoneSheetOpen = $state(false);
  let timezoneSearch = $state("");

  // Build grouped timezone list from Intl
  interface TimezoneGroup {
    region: string;
    zones: string[];
  }

  const allTimezoneGroups = $derived.by((): TimezoneGroup[] => {
    let zones: string[];
    try {
      zones = Intl.supportedValuesOf("timeZone");
    } catch {
      // Fallback for environments that lack supportedValuesOf
      zones = [timezone];
    }

    const grouped = new SvelteMap<string, string[]>();
    for (const tz of zones) {
      const slash = tz.indexOf("/");
      const region = slash > 0 ? tz.substring(0, slash) : "Other";
      let list = grouped.get(region);
      if (!list) {
        list = [];
        grouped.set(region, list);
      }
      list.push(tz);
    }

    const result: TimezoneGroup[] = [];
    for (const [region, tzList] of grouped) {
      result.push({ region, zones: tzList });
    }
    result.sort((a, b) => a.region.localeCompare(b.region));
    return result;
  });

  const filteredTimezoneGroups = $derived.by((): TimezoneGroup[] => {
    const q = timezoneSearch.trim().toLowerCase();
    if (q === "") return allTimezoneGroups;

    const result: TimezoneGroup[] = [];
    for (const group of allTimezoneGroups) {
      const matching = group.zones.filter((tz) => tz.toLowerCase().includes(q));
      if (matching.length > 0) {
        result.push({ region: group.region, zones: matching });
      }
    }
    return result;
  });

  // Recurring windows state
  interface RecurringEntry {
    day: DayOfWeek;
    start: string;
    end: string;
    error: string | null;
  }

  // svelte-ignore state_referenced_locally
  let recurringWindows: RecurringEntry[] = $state(
    value?.recurring.map((r) => ({
      day: r.day,
      start: r.start,
      end: r.end,
      error: null,
    })) ?? [],
  );

  // Specific windows state
  interface SpecificEntry {
    date: string;
    start: string;
    end: string;
    dateError: string | null;
    timeError: string | null;
  }

  // svelte-ignore state_referenced_locally
  let specificWindows: SpecificEntry[] = $state(
    value?.specific.map((s) => ({
      date: s.date,
      start: s.start,
      end: s.end,
      dateError: null,
      timeError: null,
    })) ?? [],
  );

  function getTodayISO(): string {
    const now = new Date();
    const y = String(now.getFullYear());
    const mo = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${mo}-${d}`;
  }

  function validateEndAfterStart(start: string, end: string): string | null {
    if (start === "" || end === "") return null;
    if (end <= start) return m.intake_avail_error_end_before_start();
    return null;
  }

  function validateDateNotPast(dateStr: string): string | null {
    if (dateStr === "") return null;
    if (dateStr < getTodayISO()) return m.intake_avail_error_past_date();
    return null;
  }

  function emitValue(): void {
    const data: AvailabilityData = {
      timezone,
      recurring: recurringWindows
        .filter((w) => w.start !== "" && w.end !== "")
        .map((w) => ({ day: w.day, start: w.start, end: w.end })),
      specific: specificWindows
        .filter((w) => w.date !== "" && w.start !== "" && w.end !== "")
        .map((w) => ({ date: w.date, start: w.start, end: w.end })),
    };
    onchange(data);
  }

  function handleTimezoneSelect(tz: string): void {
    timezone = tz;
    timezoneSheetOpen = false;
    timezoneSearch = "";
    emitValue();
  }

  function handleTimezoneSearchInput(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      timezoneSearch = target.value;
    }
  }

  function handleTimezoneSearchClear(): void {
    timezoneSearch = "";
  }

  // Recurring handlers
  function addRecurring(): void {
    if (recurringWindows.length >= MAX_RECURRING) return;
    // Pick the first weekday not already used, or default to monday
    const usedDays = new Set(recurringWindows.map((w) => w.day));
    const available = DAYS.find((d) => !usedDays.has(d));
    recurringWindows.push({
      day: available ?? "monday",
      start: "",
      end: "",
      error: null,
    });
    emitValue();
  }

  function removeRecurring(index: number): void {
    recurringWindows.splice(index, 1);
    emitValue();
  }

  function updateRecurringDay(index: number, e: Event): void {
    const target = e.target;
    if (target instanceof HTMLSelectElement) {
      const day = dayOfWeekSchema.parse(target.value);
      recurringWindows = recurringWindows.map((w, i) =>
        i === index ? { ...w, day } : w,
      );
      emitValue();
    }
  }

  function updateRecurringStart(index: number, e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      const start = target.value;
      recurringWindows = recurringWindows.map((w, i) =>
        i === index
          ? { ...w, start, error: validateEndAfterStart(start, w.end) }
          : w,
      );
      emitValue();
    }
  }

  function updateRecurringEnd(index: number, e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      const end = target.value;
      recurringWindows = recurringWindows.map((w, i) =>
        i === index
          ? { ...w, end, error: validateEndAfterStart(w.start, end) }
          : w,
      );
      emitValue();
    }
  }

  // Specific handlers
  function addSpecific(): void {
    if (specificWindows.length >= MAX_SPECIFIC) return;
    specificWindows.push({
      date: getTodayISO(),
      start: "",
      end: "",
      dateError: null,
      timeError: null,
    });
    emitValue();
  }

  function removeSpecific(index: number): void {
    specificWindows.splice(index, 1);
    emitValue();
  }

  function updateSpecificDate(index: number, e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      const date = target.value;
      specificWindows = specificWindows.map((w, i) =>
        i === index ? { ...w, date, dateError: validateDateNotPast(date) } : w,
      );
      emitValue();
    }
  }

  function updateSpecificStart(index: number, e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      const start = target.value;
      specificWindows = specificWindows.map((w, i) =>
        i === index
          ? { ...w, start, timeError: validateEndAfterStart(start, w.end) }
          : w,
      );
      emitValue();
    }
  }

  function updateSpecificEnd(index: number, e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      const end = target.value;
      specificWindows = specificWindows.map((w, i) =>
        i === index
          ? { ...w, end, timeError: validateEndAfterStart(w.start, end) }
          : w,
      );
      emitValue();
    }
  }

  const hasAnyWindows = $derived(
    recurringWindows.length > 0 || specificWindows.length > 0,
  );
</script>

<div class="availability-field">
  <!-- Timezone line -->
  <div class="avail-tz-block">
    <Block nested>
      <div class="avail-tz-line">
        <span>{m.intake_avail_timezone_label({ timezone })}</span>
        <Button
          small
          outline
          onclick={() => {
            timezoneSheetOpen = true;
          }}
        >
          {m.intake_avail_timezone_change()}
        </Button>
      </div>
    </Block>
  </div>

  {#if !hasAnyWindows}
    <Block nested>
      <p class="avail-empty">{m.intake_avail_empty()}</p>
    </Block>
  {/if}

  <!-- Recurring windows -->
  {#if allowRecurring}
    {#if recurringWindows.length > 0}
      <BlockTitle>
        {m.intake_avail_recurring_title()}
        <span class="avail-count">
          {m.intake_avail_recurring_count({
            count: recurringWindows.length,
            max: MAX_RECURRING,
          })}
        </span>
      </BlockTitle>

      {#each recurringWindows as entry, i (i)}
        <div class="avail-window-group">
          <List strong inset nested>
            <ListInput
              type="select"
              dropdown
              label={m.intake_avail_day_monday()}
              value={entry.day}
              onChange={(e: Event) => updateRecurringDay(i, e)}
            >
              {#each DAYS as day (day)}
                <!-- eslint-disable-next-line security/detect-object-injection -- day is from the DAYS const array, not user input -->
                <option value={day}>{dayLabels[day]()}</option>
              {/each}
            </ListInput>

            <li class="avail-time-row">
              <div class="avail-time-pair">
                <label for={`rec-start-${String(i)}`} class="sr-only">
                  {m.intake_avail_start_time()}
                </label>
                <ListInput
                  inputId={`rec-start-${String(i)}`}
                  type="time"
                  value={entry.start}
                  aria-label={m.intake_avail_start_time()}
                  onInput={(e: Event) => updateRecurringStart(i, e)}
                />
                <span class="avail-time-sep" aria-hidden="true">
                  {m.intake_avail_time_to()}
                </span>
                <label for={`rec-end-${String(i)}`} class="sr-only">
                  {m.intake_avail_end_time()}
                </label>
                <ListInput
                  inputId={`rec-end-${String(i)}`}
                  type="time"
                  value={entry.end}
                  aria-label={m.intake_avail_end_time()}
                  onInput={(e: Event) => updateRecurringEnd(i, e)}
                />
              </div>
            </li>
          </List>
        </div>
        {#if entry.error}
          <FieldError message={entry.error} />
        {/if}
        <div class="avail-remove-row">
          <Button small outline onclick={() => removeRecurring(i)}>
            {m.intake_avail_remove()}
          </Button>
        </div>
      {/each}
    {/if}

    {#if recurringWindows.length < MAX_RECURRING}
      <Block nested>
        <Button outline onclick={addRecurring}>
          {m.intake_avail_add_recurring()}
        </Button>
      </Block>
    {:else}
      <Block nested>
        <p class="avail-max-reached">{m.intake_avail_max_reached()}</p>
      </Block>
    {/if}
  {/if}

  <!-- Specific windows -->
  {#if allowSpecific}
    {#if specificWindows.length > 0}
      <BlockTitle>
        {m.intake_avail_specific_title()}
        <span class="avail-count">
          {m.intake_avail_specific_count({
            count: specificWindows.length,
            max: MAX_SPECIFIC,
          })}
        </span>
      </BlockTitle>

      {#each specificWindows as entry, i (i)}
        <div class="avail-window-group">
          <List strong inset nested>
            <ListInput
              inputId={`spec-date-${String(i)}`}
              type="date"
              value={entry.date}
              min={getTodayISO()}
              onInput={(e: Event) => updateSpecificDate(i, e)}
            />

            <li class="avail-time-row">
              <div class="avail-time-pair">
                <label for={`spec-start-${String(i)}`} class="sr-only">
                  {m.intake_avail_start_time()}
                </label>
                <ListInput
                  inputId={`spec-start-${String(i)}`}
                  type="time"
                  value={entry.start}
                  aria-label={m.intake_avail_start_time()}
                  onInput={(e: Event) => updateSpecificStart(i, e)}
                />
                <span class="avail-time-sep" aria-hidden="true">
                  {m.intake_avail_time_to()}
                </span>
                <label for={`spec-end-${String(i)}`} class="sr-only">
                  {m.intake_avail_end_time()}
                </label>
                <ListInput
                  inputId={`spec-end-${String(i)}`}
                  type="time"
                  value={entry.end}
                  aria-label={m.intake_avail_end_time()}
                  onInput={(e: Event) => updateSpecificEnd(i, e)}
                />
              </div>
            </li>
          </List>
        </div>
        {#if entry.dateError}
          <FieldError message={entry.dateError} />
        {/if}
        {#if entry.timeError}
          <FieldError message={entry.timeError} />
        {/if}
        <div class="avail-remove-row">
          <Button small outline onclick={() => removeSpecific(i)}>
            {m.intake_avail_remove()}
          </Button>
        </div>
      {/each}
    {/if}

    {#if specificWindows.length < MAX_SPECIFIC}
      <Block nested>
        <Button outline onclick={addSpecific}>
          {m.intake_avail_add_specific()}
        </Button>
      </Block>
    {:else}
      <Block nested>
        <p class="avail-max-reached">{m.intake_avail_max_reached()}</p>
      </Block>
    {/if}
  {/if}

  <FieldError message={error} />
</div>

<!-- Timezone selector sheet -->
<ShellSheet
  opened={timezoneSheetOpen}
  ondismiss={() => {
    timezoneSheetOpen = false;
    timezoneSearch = "";
  }}
  ariaLabel={m.intake_avail_timezone_change()}
>
  <div class="tz-search-wrapper">
    <Searchbar
      placeholder={m.intake_avail_timezone_search()}
      value={timezoneSearch}
      onInput={handleTimezoneSearchInput}
      onClear={handleTimezoneSearchClear}
      disableButton={false}
    />
  </div>

  {#each filteredTimezoneGroups as group (group.region)}
    <BlockTitle>{group.region}</BlockTitle>
    <List strong inset>
      {#each group.zones as tz (tz)}
        <ListItem title={tz} link onclick={() => handleTimezoneSelect(tz)} />
      {/each}
    </List>
  {/each}
</ShellSheet>

<style>
  .availability-field {
    width: 100%;
  }

  .avail-tz-block {
    margin-bottom: var(--space-sm);
  }

  .avail-tz-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    flex-wrap: wrap;
    font-size: var(--text-sm);
    color: var(--ink);
  }

  .avail-empty {
    text-align: center;
    color: var(--muted);
    font-size: var(--text-sm);
    padding: var(--space-md) 0;
  }

  .avail-count {
    color: var(--muted);
    font-weight: 400;
    margin-left: var(--space-xs);
  }

  .avail-window-group {
    margin-bottom: 0;
  }

  .avail-time-row {
    display: block;
    list-style: none;
    padding: 0;
  }

  .avail-time-pair {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .avail-time-sep {
    flex-shrink: 0;
    font-size: var(--text-sm);
    color: var(--muted);
    padding: 0 var(--space-xxs);
  }

  .avail-remove-row {
    display: flex;
    justify-content: flex-end;
    padding: var(--space-xs) var(--space-md);
  }

  .avail-max-reached {
    text-align: center;
    color: var(--muted);
    font-size: var(--text-sm);
  }

  .tz-search-wrapper {
    padding: var(--space-sm) var(--space-md) 0;
  }
</style>
