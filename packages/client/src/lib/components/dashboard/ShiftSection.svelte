<script lang="ts">
  import { SvelteDate } from "svelte/reactivity";
  import * as m from "$lib/paraglide/messages.js";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import { toastStore } from "$lib/stores/toast.svelte.js";

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
    loading?: boolean;
    /** Open tickets assigned to the viewer (the myOpen bucket length). */
    myOpenCount: number;
  }

  let { shift, loading = false, myOpenCount }: ShiftSectionProps = $props();

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

  function formatShiftCountdown(ms: number): string {
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
        time: formatShiftCountdown(diff),
        start,
        end,
      });
    }
    if (shiftState === "ended") {
      return m.dashboard_shift_ended({ start, end });
    }
    const diff = shiftEnd.getTime() - now.getTime();
    return m.dashboard_shift_ends_in({
      time: formatShiftCountdown(diff),
      start,
      end,
    });
  });

  const openWithYou = $derived(
    myOpenCount === 1
      ? m.dashboard_shift_open_with_you_one({ count: myOpenCount })
      : m.dashboard_shift_open_with_you_other({ count: myOpenCount }),
  );

  function handleEndShift(): void {
    // No shift backend yet; announce the deferral rather than faking a write.
    toastStore.show(m.feature_coming_soon());
  }
</script>

<section class="shift" aria-label={m.dashboard_shift_heading()}>
  <span class="dot" aria-hidden="true"></span>
  {#if loading}
    <span class="t"><InlineSkeleton width="22ch" /></span>
  {:else}
    <span class="t num">{timeDisplay} · {openWithYou}</span>
    {#if shift && shift.volunteers.length > 0}
      <span
        class="chips"
        aria-label={m.dashboard_shift_volunteers({
          count: shift.volunteersOnShift,
        })}
      >
        {#each shift.volunteers as vol, i (`${vol.initials}${String(i)}`)}
          <span
            class="chip"
            class:chip-you={vol.isCurrentUser}
            aria-hidden="true">{vol.initials}</span
          >
        {/each}
      </span>
    {/if}
  {/if}
  <button type="button" class="end" disabled={loading} onclick={handleEndShift}>
    {m.dashboard_shift_end()}
  </button>
</section>

<style>
  .shift {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: var(--space-2xl) var(--page-pad-x) 0;
    padding: 11px 14px;
    border: 1px solid var(--hair);
    border-radius: 10px;
    background: var(--raised);
  }

  .dot {
    width: 8px;
    height: 8px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--brand-fill);
  }

  .t {
    min-width: 0;
    font-size: 13.5px;
    color: var(--ink-2);
  }

  .num {
    font-variant-numeric: tabular-nums;
  }

  .chips {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    border-radius: 999px;
    background: var(--hair);
    font-size: 11px;
    font-weight: 500;
    color: var(--muted);
    white-space: nowrap;
  }

  .chip-you {
    background: var(--hair-2);
    color: var(--ink);
    font-weight: 600;
  }

  .end {
    margin-left: auto;
    flex-shrink: 0;
    appearance: none;
    background: none;
    border: none;
    padding: 0;
    font-family: inherit;
    font-size: 12.5px;
    font-weight: 700;
    color: var(--brand-text);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .end:disabled {
    opacity: 0.5;
    cursor: default;
  }
</style>
