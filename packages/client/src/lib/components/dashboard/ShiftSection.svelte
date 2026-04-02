<script lang="ts">
  import { SvelteDate } from "svelte/reactivity";
  import { CalendarDays } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import CollapsibleSection from "./CollapsibleSection.svelte";

  interface Volunteer {
    initials: string;
    isCurrentUser: boolean;
  }

  interface ShiftInfo {
    current: { start: string; end: string; label: string };
    volunteersOnShift: number;
    volunteers: Volunteer[];
  }

  interface ShiftSectionProps {
    shift: ShiftInfo | null;
    expanded: boolean;
    ontoggle: () => void;
  }

  let { shift, expanded, ontoggle }: ShiftSectionProps = $props();

  // Reactive countdown that ticks every minute.
  const now = new SvelteDate();

  $effect(() => {
    const timer = setInterval(() => {
      now.setTime(Date.now());
    }, 60_000);
    return () => clearInterval(timer);
  });

  function parseShiftTime(timeStr: string): Date {
    const parts = timeStr.split(":").map(Number);
    const hours = parts[0] ?? 0;
    const minutes = parts[1] ?? 0;
    const d = new SvelteDate(now.getTime());
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

  const shiftStart = $derived(
    shift ? parseShiftTime(shift.current.start) : null,
  );
  const shiftEnd = $derived(shift ? parseShiftTime(shift.current.end) : null);

  type ShiftState = "active" | "ended" | "not_started";

  const shiftState = $derived.by((): ShiftState => {
    if (!shiftStart || !shiftEnd) return "ended";
    if (now < shiftStart) return "not_started";
    if (now >= shiftEnd) return "ended";
    return "active";
  });

  function formatDuration(ms: number): string {
    const totalMin = Math.max(0, Math.floor(ms / 60_000));
    const h = Math.floor(totalMin / 60);
    const min = totalMin % 60;
    if (h > 0 && min > 0) return `${String(h)}h ${String(min)}m`;
    if (h > 0) return `${String(h)}h`;
    return `${String(min)}m`;
  }

  const timeDisplay = $derived.by((): string => {
    if (!shift || !shiftStart || !shiftEnd) return m.dashboard_shift_no_shift();
    const start = shift.current.start;
    const end = shift.current.end;

    if (shiftState === "not_started") {
      const diff = shiftStart.getTime() - now.getTime();
      return m.dashboard_shift_not_started({
        time: formatDuration(diff),
        start,
        end,
      });
    }
    if (shiftState === "ended") {
      return m.dashboard_shift_ended({ start, end });
    }
    const diff = shiftEnd.getTime() - now.getTime();
    return m.dashboard_shift_ends_in({
      time: formatDuration(diff),
      start,
      end,
    });
  });
</script>

<CollapsibleSection
  heading={m.dashboard_shift_heading()}
  icon={CalendarDays}
  iconColor="var(--brand-accent)"
  {expanded}
  {ontoggle}
>
  <div class="shift-content">
    <div class="shift-time">
      <span>{timeDisplay}</span>
    </div>

    {#if shift && shift.volunteers.length > 0}
      <div class="shift-volunteers">
        {#each shift.volunteers as vol (vol.initials)}
          <span class="vol-chip" class:vol-chip-you={vol.isCurrentUser}>
            {vol.initials}
          </span>
        {/each}
      </div>
    {/if}
  </div>
</CollapsibleSection>

<style>
  .shift-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0 0.75rem 0.625rem;
    font-size: 0.8125rem;
  }

  .shift-time {
    color: var(--muted);
    font-size: 0.8125rem;
  }

  .shift-volunteers {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .vol-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.1875rem 0.5rem;
    border-radius: 999px;
    background: var(--surface-1);
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--muted);
    white-space: nowrap;
  }

  .vol-chip-you {
    color: var(--ink);
    background: color-mix(in srgb, var(--brand-accent) 15%, var(--surface-1));
  }
</style>
