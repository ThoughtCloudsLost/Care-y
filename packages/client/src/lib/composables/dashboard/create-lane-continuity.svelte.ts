/**
 * Keeps the user's place in the dashboard lanes when their arrangement
 * changes (a resize, a fold, a split pane).
 *
 * Each lane records an anchor: the first ticket showing in its scroller,
 * or none while the scroller sits at its top. When the lanes-per-row
 * count changes, the primary lane (the one last focused or used) scrolls
 * its anchor back to the top of its new scroller. Focus lost with a
 * re-rendered row returns to the same ticket. Focus lost with a lane's
 * header, which is a toggle stacked and a heading side by side, returns
 * to the same lane's header in its new form. Focus that is anywhere
 * else, an input most of all, is left where it is. Nothing is announced:
 * the content and focus carry over, so nothing is lost.
 */

import { tick, untrack } from "svelte";
import { SvelteMap } from "svelte/reactivity";
import type { DashboardLaneId } from "@care-y/shared";
import { focusJumpTarget } from "$lib/utils/a11y.js";

/** Rendered ticket rows and cards carry their ticket id here. */
const TICKET_ID_ATTR = "data-ticket-id";

/** What can take focus inside a rendered ticket. */
const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export interface ArrangementChange {
  /** The lane whose place is restored; null when none was used yet. */
  readonly primary: DashboardLaneId | null;
  /** That lane's anchor ticket, or null. */
  readonly anchor: string | null;
  /** The new arrangement is one lane per row. */
  readonly stacked: boolean;
}

export interface LaneContinuityDeps {
  readonly laneIds: readonly DashboardLaneId[];
  readonly lanesPerRow: () => number;
  /** A lane's root element, holding its rendered tickets. */
  readonly laneElement: (laneId: DashboardLaneId) => HTMLElement | undefined;
  /** The element a lane's rows scroll in right now. */
  readonly scroller: (laneId: DashboardLaneId) => HTMLElement | undefined;
  /**
   * A lane's header as rendered right now: its toggle while stacked, its
   * heading side by side. The one element swaps for the other when the
   * lanes-per-row count crosses one.
   */
  readonly laneHeader: (laneId: DashboardLaneId) => HTMLElement | undefined;
  /**
   * Runs on an arrangement change before the anchor restores, so the
   * page can make the anchor reachable (expand the lane, lift its cap).
   */
  readonly onArrangementChange: (change: ArrangementChange) => void;
}

export interface LaneContinuity {
  /** The lane last focused or used, or null. */
  readonly primary: DashboardLaneId | null;
  /** The anchor recorded for a lane, or null. */
  anchor(laneId: DashboardLaneId): string | null;
  /** Mark a lane as the one in use. */
  touch(laneId: DashboardLaneId): void;
  /** Record every lane's anchor from the current layout. */
  record(): void;
}

function ticketElements(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(`[${TICKET_ID_ATTR}]`)];
}

function findTicketElement(
  root: HTMLElement,
  ticketId: string,
): HTMLElement | undefined {
  return ticketElements(root).find(
    (el) => el.getAttribute(TICKET_ID_ATTR) === ticketId,
  );
}

/**
 * Top edge of what a scroller shows, in viewport px. The shell's scroller
 * reserves the chrome that covers its top with padding, so the padding
 * is left out of the view.
 */
function viewTop(scroller: HTMLElement): number {
  const padding = parseFloat(getComputedStyle(scroller).paddingTop) || 0;
  return scroller.getBoundingClientRect().top + padding;
}

/**
 * The first ticket in `root` showing in `scroller`. Null while the
 * scroller sits at its top: there is no place to keep.
 */
export function firstVisibleTicketId(
  root: HTMLElement,
  scroller: HTMLElement,
): string | null {
  if (scroller.scrollTop <= 0) return null;
  const top = viewTop(scroller);
  const bottom = scroller.getBoundingClientRect().bottom;
  for (const el of ticketElements(root)) {
    const rect = el.getBoundingClientRect();
    if (rect.bottom > top && rect.top < bottom) {
      return el.getAttribute(TICKET_ID_ATTR);
    }
  }
  return null;
}

/** Scroll `scroller` so the ticket's top meets the top of its view. */
export function scrollTicketToTop(
  root: HTMLElement,
  scroller: HTMLElement,
  ticketId: string,
): boolean {
  const el = findTicketElement(root, ticketId);
  if (el === undefined) return false;
  scroller.scrollTop += el.getBoundingClientRect().top - viewTop(scroller);
  return true;
}

/** Focus sits nowhere: its element went with a re-render. */
function focusWasLost(): boolean {
  const active = document.activeElement;
  return active === null || active === document.body;
}

/**
 * Focus the ticket's control, but only when focus was lost (it sits on
 * the body). Focus anywhere else, an input or textarea above all, stays.
 */
export function restoreTicketFocus(
  roots: readonly HTMLElement[],
  ticketId: string,
): boolean {
  if (!focusWasLost()) return false;
  for (const root of roots) {
    const el = findTicketElement(root, ticketId);
    if (el === undefined) continue;
    const target = el.matches(FOCUSABLE)
      ? el
      : el.querySelector<HTMLElement>(FOCUSABLE);
    if (target === null) return false;
    target.focus({ preventScroll: true });
    return true;
  }
  return false;
}

/**
 * Focus a lane's header in its current form, but only when focus was
 * lost, as for a ticket. A heading takes focus from script alone
 * (tabindex -1); a toggle is a button and stays in the tab order.
 */
export function restoreHeaderFocus(header: HTMLElement | undefined): boolean {
  if (header === undefined || !focusWasLost()) return false;
  focusJumpTarget(header);
  return true;
}

export function createLaneContinuity(deps: LaneContinuityDeps): LaneContinuity {
  let primary = $state<DashboardLaneId | null>(null);
  const anchors = new SvelteMap<DashboardLaneId, string | null>();
  // Read only from event handlers and the restore; nothing renders them.
  let focusedTicketId: string | null = null;
  let focusedHeaderLane: DashboardLaneId | null = null;

  function laneContaining(node: Node): DashboardLaneId | undefined {
    return deps.laneIds.find(
      (id) => deps.laneElement(id)?.contains(node) === true,
    );
  }

  function record(): void {
    for (const id of deps.laneIds) {
      const root = deps.laneElement(id);
      const scroller = deps.scroller(id);
      anchors.set(
        id,
        root === undefined || scroller === undefined
          ? null
          : firstVisibleTicketId(root, scroller),
      );
    }
  }

  function touch(laneId: DashboardLaneId): void {
    primary = laneId;
  }

  // Scrolling records every anchor; scrolling inside a lane also makes
  // it the primary one, as a press in it does. Focus inside a lane does
  // the same, and notes the ticket or the lane header it landed on.
  $effect(() => {
    let frame = 0;
    const onScroll = (event: Event): void => {
      const target = event.target;
      if (target instanceof Node) {
        const lane = laneContaining(target);
        if (lane !== undefined) touch(lane);
      }
      if (frame !== 0) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        record();
      });
    };
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      const lane = laneContaining(target);
      if (lane !== undefined) touch(lane);
    };
    const onFocusIn = (event: FocusEvent): void => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const lane = laneContaining(target);
      if (lane !== undefined) touch(lane);
      focusedTicketId =
        lane === undefined
          ? null
          : (target
              .closest(`[${TICKET_ID_ATTR}]`)
              ?.getAttribute(TICKET_ID_ATTR) ?? null);
      focusedHeaderLane =
        lane !== undefined && deps.laneHeader(lane)?.contains(target) === true
          ? lane
          : null;
    };
    document.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    document.addEventListener("pointerdown", onPointerDown, {
      passive: true,
      capture: true,
    });
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      document.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      });
      document.removeEventListener("focusin", onFocusIn);
      cancelAnimationFrame(frame);
    };
  });

  async function restore(stacked: boolean): Promise<void> {
    const lane = primary;
    const anchor = lane === null ? null : (anchors.get(lane) ?? null);
    const focused = focusedTicketId;
    const focusedHeader = focusedHeaderLane;
    deps.onArrangementChange({ primary: lane, anchor, stacked });
    await tick();
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
    if (lane !== null && anchor !== null) {
      const root = deps.laneElement(lane);
      const scroller = deps.scroller(lane);
      if (root !== undefined && scroller !== undefined) {
        scrollTicketToTop(root, scroller, anchor);
      }
    }
    if (focused !== null) {
      const roots = deps.laneIds.flatMap((id) => {
        const el = deps.laneElement(id);
        return el === undefined ? [] : [el];
      });
      // The primary lane first: a ticket listed in two lanes returns to
      // the one in use.
      const primaryRoot = lane === null ? undefined : deps.laneElement(lane);
      const ordered =
        primaryRoot === undefined
          ? roots
          : [primaryRoot, ...roots.filter((el) => el !== primaryRoot)];
      restoreTicketFocus(ordered, focused);
    }
    if (focusedHeader !== null) {
      restoreHeaderFocus(deps.laneHeader(focusedHeader));
    }
    record();
  }

  let previous: number | undefined;
  $effect(() => {
    const lanesPerRow = deps.lanesPerRow();
    const before = previous;
    previous = lanesPerRow;
    if (before === undefined || before === lanesPerRow) return;
    untrack(() => {
      void restore(lanesPerRow === 1);
    });
  });

  return {
    get primary(): DashboardLaneId | null {
      return primary;
    },
    anchor(laneId: DashboardLaneId): string | null {
      return anchors.get(laneId) ?? null;
    },
    touch,
    record,
  };
}
