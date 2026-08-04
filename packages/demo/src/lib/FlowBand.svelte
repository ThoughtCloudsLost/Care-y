<script lang="ts">
  /**
   * The data flow band: the demo's own traffic drawn as a swimlane.
   *
   * Five architecture lanes stack vertically, cloud at the top and the
   * visitor's screen at the bottom. Each interaction is one vertical
   * slice, slices append rightward, and the newest one scrolls into
   * view. The band sits in the top chrome and pushes the story down; it
   * never covers the phone, which slides under it.
   *
   * Below the wide breakpoint there is no room for band and phone at
   * once, so the same slices render as a dismissible overlay list.
   * Cards keep their lane icon and color there, which is the whole
   * reason lane identity does not depend on row position.
   */

  import { prefersReducedMotion } from "svelte/motion";
  import { Waypoints, X, Clapperboard } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import FlowBandCard from "./FlowBandCard.svelte";
  import FlowBandSlice from "./FlowBandSlice.svelte";
  import FlowBandLaneIcon from "./FlowBandLaneIcon.svelte";
  import {
    FLOW_LANES,
    SLICE_HEADER_HEIGHT,
    MIN_BAND_HEIGHT,
    MAX_BAND_HEIGHT,
    laneColorVar,
    truncatePreview,
    type FlowBandStore,
  } from "./flow-band.svelte.js";
  import type { DemoFlowEvent, DemoSeamKey, FlowLane } from "./bridge.js";

  interface Props {
    store: FlowBandStore;
    /** True below the wide breakpoint, where the band becomes an overlay. */
    narrow: boolean;
    /** Read so message calls re-run when the page locale changes. */
    locale: string;
    /**
     * Reports how much page flow the band occupies, measured rather than
     * summed: an expanded card's detail strip has no fixed height. Zero
     * while closed, and zero as an overlay, which is out of flow.
     */
    onFlowHeight: (px: number) => void;
  }

  let { store, narrow, locale, onFlowHeight }: Props = $props();

  // Bound to the band element's own box. bind:offsetHeight includes the
  // bottom border, which the sticky story content sits below.
  let bandHeight = $state(0);

  $effect(() => {
    onFlowHeight(store.open && !narrow ? bandHeight : 0);
  });

  const rowHeight: number = $derived(
    (store.height - SLICE_HEADER_HEIGHT) / FLOW_LANES.length,
  );
  const bodyHeight: number = $derived(store.height - SLICE_HEADER_HEIGHT);

  // -----------------------------------------------------------------------
  // Localized vocabulary
  // -----------------------------------------------------------------------

  function laneName(lane: FlowLane): string {
    void locale;
    switch (lane) {
      case "db":
        return m.demo_flow_lane_db();
      case "server":
        return m.demo_flow_lane_server();
      case "trpc":
        return m.demo_flow_lane_trpc();
      case "crypto":
        return m.demo_flow_lane_crypto();
      case "ui":
        return m.demo_flow_lane_ui();
    }
  }

  function seamNarration(seam: DemoSeamKey): string {
    void locale;
    switch (seam) {
      case "login-pacing":
        return m.demo_flow_seam_login_pacing();
      case "twofa-choreography":
        return m.demo_flow_seam_twofa_choreography();
      case "webauthn-authenticator":
        return m.demo_flow_seam_webauthn_authenticator();
      case "oprf-evaluator":
        return m.demo_flow_seam_oprf_evaluator();
      case "outbox-delivery":
        return m.demo_flow_seam_outbox_delivery();
    }
  }

  function directionLabel(direction: DemoFlowEvent["direction"]): string {
    void locale;
    switch (direction) {
      case "up":
        return m.demo_flow_direction_up();
      case "down":
        return m.demo_flow_direction_down();
      case "local":
        return m.demo_flow_direction_local();
    }
  }

  function sliceLabel(interactionId: number): string {
    void locale;
    return m.demo_flow_slice_label({ index: String(interactionId) });
  }

  function stepsLabel(count: number): string {
    void locale;
    return m.demo_flow_slice_steps({ count: String(count) });
  }

  // -----------------------------------------------------------------------
  // Auto-scroll to the newest slice
  // -----------------------------------------------------------------------

  // Held in a plain variable rather than $state: the attachment runs with
  // the element in hand, and the effect below reads the slice count for
  // its dependency, so nothing needs the ref itself to be reactive.
  let trackEl: HTMLElement | null = null;

  function captureTrack(el: HTMLElement): () => void {
    trackEl = el;
    return () => {
      trackEl = null;
    };
  }

  function scrollToNewest(): void {
    const el = trackEl;
    if (el === null) return;
    el.scrollTo({
      left: el.scrollWidth,
      behavior: prefersReducedMotion.current ? "auto" : "smooth",
    });
  }

  $effect(() => {
    // Dependencies: a new slice, or a new event inside the newest slice.
    void store.slices.length;
    void store.slices.at(-1)?.events.length;
    scrollToNewest();
  });

  // -----------------------------------------------------------------------
  // Height resize (bottom edge of the band)
  // -----------------------------------------------------------------------

  const HEIGHT_STEP = 16;
  const HEIGHT_PAGE_STEP = 48;

  interface ResizeOrigin {
    pointerId: number;
    startY: number;
    startHeight: number;
  }

  let resizeGesture: ResizeOrigin | null = null;

  function startResize(e: PointerEvent): void {
    if (e.button !== 0) return;
    if (!(e.currentTarget instanceof HTMLElement)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeGesture = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startHeight: store.height,
    };
  }

  function moveResize(e: PointerEvent): void {
    if (resizeGesture?.pointerId !== e.pointerId) return;
    store.setHeight(
      resizeGesture.startHeight + (e.clientY - resizeGesture.startY),
    );
  }

  function endResize(e: PointerEvent): void {
    if (resizeGesture?.pointerId !== e.pointerId) return;
    resizeGesture = null;
  }

  function resizeKeydown(e: KeyboardEvent): void {
    if (e.key === "ArrowUp") {
      store.setHeight(store.height - HEIGHT_STEP);
    } else if (e.key === "ArrowDown") {
      store.setHeight(store.height + HEIGHT_STEP);
    } else if (e.key === "PageUp") {
      store.setHeight(store.height - HEIGHT_PAGE_STEP);
    } else if (e.key === "PageDown") {
      store.setHeight(store.height + HEIGHT_PAGE_STEP);
    } else if (e.key === "Home") {
      store.setHeight(MIN_BAND_HEIGHT);
    } else if (e.key === "End") {
      store.setHeight(MAX_BAND_HEIGHT);
    } else {
      return;
    }
    e.preventDefault();
  }

  // -----------------------------------------------------------------------
  // Overlay dismissal (small viewports only, where the panel is modal)
  // -----------------------------------------------------------------------

  function handleWindowKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape" && narrow && store.open) {
      store.setOpen(false);
    }
  }

  function close(): void {
    store.setOpen(false);
  }
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#snippet detailPanel(event: DemoFlowEvent)}
  {@const preview = truncatePreview(event.payloadPreview)}
  <div class="detail" style:--lane-color={laneColorVar(event.lane)}>
    <div class="detail-head">
      <span class="detail-lane">
        <span class="detail-lane-icon" aria-hidden="true">
          <FlowBandLaneIcon lane={event.lane} size={14} />
        </span>
        {laneName(event.lane)}
      </span>
      <span class="detail-meta">{directionLabel(event.direction)}</span>
      {#if event.durationMs !== null}
        <span class="detail-meta">
          <span class="detail-key">{m.demo_flow_detail_duration()}</span>
          {m.demo_flow_duration_ms({ ms: String(event.durationMs) })}
        </span>
      {/if}
      {#if event.seamKey !== null}
        <span class="detail-badge">
          <Clapperboard size={10} />
          {m.demo_flow_seam_badge()}
        </span>
      {/if}
      <button
        class="detail-close"
        type="button"
        aria-label={m.demo_flow_collapse()}
        onclick={() => store.toggleExpanded(event.id)}
      >
        <X size={12} />
      </button>
    </div>
    <p class="detail-label">{event.label}</p>
    {#if preview !== null}
      <p class="detail-payload">
        <span class="detail-key">{m.demo_flow_detail_payload()}</span>
        <code>{preview}</code>
      </p>
    {/if}
    {#if event.seamKey !== null}
      <p class="detail-seam">{seamNarration(event.seamKey)}</p>
    {/if}
  </div>
{/snippet}

{#if store.open}
  {#if narrow}
    <!-- Small viewports: band and phone cannot share the width, so the
         flow becomes a dismissible overlay list. -->
    <div class="overlay-scrim" role="presentation" onclick={close}></div>
    <section
      class="flow-band-root overlay"
      aria-label={m.demo_flow_band_title()}
    >
      <div class="band-header">
        <Waypoints size={14} />
        <span class="band-title">{m.demo_flow_band_title()}</span>
        <span class="band-count">{store.eventCount}</span>
        <button
          class="band-close"
          type="button"
          aria-label={m.demo_flow_close()}
          onclick={close}
        >
          <X size={14} />
        </button>
      </div>
      <div class="overlay-list">
        {#if store.slices.length === 0}
          <p class="band-empty">{m.demo_flow_empty()}</p>
        {:else}
          {#each store.slices as slice (slice.interactionId)}
            <div class="overlay-slice">
              <h3 class="overlay-slice-title">
                {sliceLabel(slice.interactionId)}
              </h3>
              {#each slice.events as event (event.id)}
                <FlowBandCard
                  {event}
                  laneName={laneName(event.lane)}
                  seamBadge={m.demo_flow_seam_badge()}
                  toggleHint={store.isExpanded(event.id)
                    ? m.demo_flow_collapse()
                    : m.demo_flow_expand()}
                  expanded={store.isExpanded(event.id)}
                  variant="list"
                  onToggle={(id: number) => store.toggleExpanded(id)}
                />
                {#if store.isExpanded(event.id)}
                  {@render detailPanel(event)}
                {/if}
              {/each}
            </div>
          {/each}
        {/if}
      </div>
    </section>
  {:else}
    <section
      class="flow-band-root band"
      aria-label={m.demo_flow_band_title()}
      bind:offsetHeight={bandHeight}
    >
      <div class="band-header">
        <Waypoints size={14} />
        <span class="band-title">{m.demo_flow_band_title()}</span>
        <span class="band-count">{store.eventCount}</span>
        <button
          class="band-close"
          type="button"
          aria-label={m.demo_flow_close()}
          onclick={close}
        >
          <X size={14} />
        </button>
      </div>

      <div class="band-main" style:height="{store.height}px">
        <div class="lane-column">
          <div class="lane-spacer" style:height="{SLICE_HEADER_HEIGHT}px"></div>
          {#each FLOW_LANES as lane (lane)}
            <div
              class="lane-row"
              style:--lane-color={laneColorVar(lane)}
              style:height="{rowHeight}px"
            >
              <span class="lane-strip" aria-hidden="true"></span>
              <span class="lane-icon" aria-hidden="true">
                <FlowBandLaneIcon {lane} size={14} />
              </span>
              <span class="lane-name">{laneName(lane)}</span>
            </div>
          {/each}
        </div>

        <div class="band-track" {@attach captureTrack}>
          {#if store.slices.length === 0}
            <p class="band-empty">{m.demo_flow_empty()}</p>
          {:else}
            {#each store.slices as slice (slice.interactionId)}
              <FlowBandSlice
                {slice}
                {rowHeight}
                {bodyHeight}
                label={sliceLabel(slice.interactionId)}
                toggleLabel={slice.collapsed
                  ? m.demo_flow_slice_expand()
                  : m.demo_flow_slice_collapse()}
                stepsLabel={stepsLabel(slice.events.length)}
                seamBadge={m.demo_flow_seam_badge()}
                expandHint={m.demo_flow_expand()}
                collapseHint={m.demo_flow_collapse()}
                {laneName}
                isExpanded={(id: number) => store.isExpanded(id)}
                onToggleSlice={(id: number) => store.toggleSlice(id)}
                onToggleCard={(id: number) => store.toggleExpanded(id)}
              />
            {/each}
          {/if}
        </div>
      </div>

      {#if store.expandedEvent !== null}
        {@render detailPanel(store.expandedEvent)}
      {/if}

      <!-- A button rather than a focusable role="separator": the drag
           surface has to be reachable by keyboard, and a real button gets
           that plus an accessible name without any suppressed warning.
           Arrow, Page, Home, and End keys resize it. -->
      <button
        class="band-resize"
        type="button"
        aria-label={m.demo_flow_resize()}
        title={m.demo_flow_resize()}
        onpointerdown={startResize}
        onpointermove={moveResize}
        onpointerup={endResize}
        onpointercancel={endResize}
        onkeydown={resizeKeydown}
      >
        <span class="band-resize-grip" aria-hidden="true"></span>
      </button>
    </section>
  {/if}
{/if}

<style>
  /* Lane palette. Light values by default, dark values under the same
     html.dark scope the rest of the demo page uses. The color is an
     accent beside the lane icon and the text label, never the only
     carrier of meaning. */
  .flow-band-root {
    --lane-db: #2a78d6;
    --lane-server: #eb6834;
    --lane-trpc: #1baf7a;
    --lane-crypto: #eda100;
    --lane-ui: #e87ba4;
  }

  :global(html.dark) .flow-band-root {
    --lane-db: #3987e5;
    --lane-server: #d95926;
    --lane-trpc: #199e70;
    --lane-crypto: #c98500;
    --lane-ui: #d55181;
  }

  /* The band is in normal flow directly under the sticky top bar, so
     opening it moves the story down instead of covering it. Sticky at
     the bar's height keeps it in view while the story scrolls beneath;
     the z-index puts it in the top chrome layer, above the floating
     phone frame at 50 and below the top bar at 100. */
  .band {
    position: sticky;
    top: 56px;
    z-index: 90;
    display: flex;
    flex-direction: column;
    background: rgba(245, 245, 247, 0.96);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  :global(html.dark) .band {
    background: rgba(22, 22, 24, 0.96);
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }

  .band-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 28px;
    padding: 0 0.75rem;
    color: #86868b;
  }

  :global(html.dark) .band-header {
    color: #98989d;
  }

  .band-title {
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .band-count {
    font-size: 0.6875rem;
    font-variant-numeric: tabular-nums;
    flex: 1 1 auto;
  }

  .band-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: inherit;
    cursor: pointer;
    flex-shrink: 0;
  }

  .band-close:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .band-close:focus-visible {
    outline: 2px solid #007aff;
    outline-offset: -2px;
  }

  :global(html.dark) .band-close:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  :global(html.dark) .band-close:focus-visible {
    outline-color: #64d2ff;
  }

  .band-main {
    display: flex;
    min-height: 0;
    padding: 0 0.75rem;
  }

  /* Lane column: icon, name, and a color edge per lane. Its spacer
     matches the per-slice header strip so the rows line up with the
     cards in the track. */
  .lane-column {
    flex: 0 0 auto;
    width: 8.5rem;
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgba(0, 0, 0, 0.08);
    padding-right: 0.5rem;
  }

  :global(html.dark) .lane-column {
    border-right-color: rgba(255, 255, 255, 0.1);
  }

  .lane-spacer {
    flex: 0 0 auto;
  }

  .lane-row {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    min-height: 0;
  }

  .lane-strip {
    flex: 0 0 auto;
    width: 3px;
    height: 60%;
    min-height: 14px;
    border-radius: 2px;
    background: var(--lane-color);
  }

  .lane-icon {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    color: var(--lane-color);
  }

  .lane-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: #1d1d1f;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :global(html.dark) .lane-name {
    color: #f5f5f7;
  }

  /* Timeline: slices append rightward, newest scrolled into view. The
     scrollbar is hidden the same way the top bar's section tabs hide
     theirs, so the row heights stay exact. */
  .band-track {
    flex: 1 1 auto;
    display: flex;
    align-items: stretch;
    gap: 0.5rem;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .band-track::-webkit-scrollbar {
    display: none;
  }

  .band-empty {
    margin: 0;
    padding: 0.75rem 1rem;
    align-self: center;
    font-size: 0.8125rem;
    color: #86868b;
  }

  :global(html.dark) .band-empty {
    color: #98989d;
  }

  /* Resize handle on the bottom edge. */
  .band-resize {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 10px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: ns-resize;
    touch-action: none;
  }

  .band-resize:hover .band-resize-grip {
    background: rgba(0, 0, 0, 0.3);
  }

  :global(html.dark) .band-resize:hover .band-resize-grip {
    background: rgba(255, 255, 255, 0.35);
  }

  .band-resize:focus-visible {
    outline: 2px solid #007aff;
    outline-offset: -2px;
  }

  :global(html.dark) .band-resize:focus-visible {
    outline-color: #64d2ff;
  }

  .band-resize-grip {
    width: 36px;
    height: 3px;
    border-radius: 2px;
    background: rgba(0, 0, 0, 0.18);
  }

  :global(html.dark) .band-resize-grip {
    background: rgba(255, 255, 255, 0.22);
  }

  /* -----------------------------------------------------------------------
     Expanded detail
     ----------------------------------------------------------------------- */

  .detail {
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    border-left: 3px solid var(--lane-color);
    padding: 0.5rem 0.75rem;
    background: rgba(255, 255, 255, 0.6);
  }

  :global(html.dark) .detail {
    border-top-color: rgba(255, 255, 255, 0.1);
    background: rgba(30, 30, 32, 0.6);
  }

  .detail-head {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.6875rem;
  }

  .detail-lane {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 700;
    color: #1d1d1f;
  }

  :global(html.dark) .detail-lane {
    color: #f5f5f7;
  }

  .detail-lane-icon {
    display: inline-flex;
    color: var(--lane-color);
  }

  .detail-meta {
    color: #86868b;
  }

  :global(html.dark) .detail-meta {
    color: #98989d;
  }

  .detail-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.0625rem 0.375rem;
    border: 1px dashed rgba(0, 0, 0, 0.25);
    border-radius: 999px;
    color: #636366;
  }

  :global(html.dark) .detail-badge {
    border-color: rgba(255, 255, 255, 0.3);
    color: #98989d;
  }

  .detail-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    margin-left: auto;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #86868b;
    cursor: pointer;
  }

  .detail-close:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .detail-close:focus-visible {
    outline: 2px solid #007aff;
    outline-offset: -2px;
  }

  :global(html.dark) .detail-close:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  :global(html.dark) .detail-close:focus-visible {
    outline-color: #64d2ff;
  }

  .detail-label {
    margin: 0.25rem 0 0;
    font-size: 0.8125rem;
    color: #1d1d1f;
  }

  :global(html.dark) .detail-label {
    color: #f5f5f7;
  }

  .detail-payload {
    margin: 0.25rem 0 0;
    font-size: 0.75rem;
    color: #636366;
    overflow-wrap: anywhere;
  }

  :global(html.dark) .detail-payload {
    color: #98989d;
  }

  .detail-key {
    font-weight: 600;
  }

  .detail-payload code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.6875rem;
  }

  .detail-seam {
    margin: 0.25rem 0 0;
    font-size: 0.75rem;
    color: #636366;
  }

  :global(html.dark) .detail-seam {
    color: #98989d;
  }

  /* -----------------------------------------------------------------------
     Small-viewport overlay
     ----------------------------------------------------------------------- */

  .overlay-scrim {
    position: fixed;
    inset: 56px 0 0;
    z-index: 89;
    background: rgba(0, 0, 0, 0.35);
  }

  .overlay {
    position: fixed;
    inset: 56px 0 0;
    z-index: 90;
    display: flex;
    flex-direction: column;
    background: #f5f5f7;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }

  :global(html.dark) .overlay {
    background: #161618;
    border-top-color: rgba(255, 255, 255, 0.08);
  }

  .overlay-list {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 0 0.75rem 1.5rem;
    -webkit-overflow-scrolling: touch;
  }

  .overlay-slice {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 0.5rem 0;
  }

  .overlay-slice-title {
    margin: 0;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #86868b;
  }

  :global(html.dark) .overlay-slice-title {
    color: #98989d;
  }
</style>
