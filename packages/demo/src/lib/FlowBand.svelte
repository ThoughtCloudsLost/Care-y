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
  import FlowBandCardStack from "./FlowBandCardStack.svelte";
  import FlowBandSlice from "./FlowBandSlice.svelte";
  import FlowBandLaneIcon from "./FlowBandLaneIcon.svelte";
  import FlowBandKindIcon from "./FlowBandKindIcon.svelte";
  import {
    FLOW_LANES,
    SLICE_HEADER_HEIGHT,
    MIN_BAND_HEIGHT,
    MAX_BAND_HEIGHT,
    laneColorVar,
    truncatePreview,
    groupSliceEvents,
    type FlowBandStore,
    type FlowCell,
    type FlowSlice,
  } from "./flow-band.svelte.js";
  import type {
    DemoFlowEvent,
    DemoSeamKey,
    FlowDetailRow,
    FlowLane,
    FlowValueKind,
  } from "./bridge.js";

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
      case "recorded-derivation":
        return m.demo_flow_seam_recorded_derivation();
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

  function classificationName(kind: FlowValueKind): string {
    void locale;
    switch (kind) {
      case "ciphertext":
        return m.demo_flow_kind_ciphertext();
      case "plaintext":
        return m.demo_flow_kind_plaintext();
      case "key-material":
        return m.demo_flow_kind_key_material();
      case "identifier":
        return m.demo_flow_kind_identifier();
      case "metadata":
        return m.demo_flow_kind_metadata();
    }
  }

  function kindNote(kind: FlowValueKind): string {
    void locale;
    switch (kind) {
      case "ciphertext":
        return m.demo_flow_kind_ciphertext_note();
      case "plaintext":
        return m.demo_flow_kind_plaintext_note();
      case "key-material":
        return m.demo_flow_kind_key_material_note();
      case "identifier":
        return m.demo_flow_kind_identifier_note();
      case "metadata":
        return m.demo_flow_kind_metadata_note();
    }
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

  /** Minimum gap between two smooth scrolls before switching to instant. */
  const SCROLL_BURST_MS = 200;

  let scrollRaf = 0;
  let lastScrollAt = 0;

  function applyScroll(): void {
    scrollRaf = 0;
    const el = trackEl;
    if (el === null) return;
    const now = performance.now();
    const useInstant =
      prefersReducedMotion.current || now - lastScrollAt < SCROLL_BURST_MS;
    lastScrollAt = now;
    el.scrollTo({
      left: el.scrollWidth,
      behavior: useInstant ? "auto" : "smooth",
    });
  }

  function scrollToNewest(): void {
    if (scrollRaf === 0) {
      scrollRaf = requestAnimationFrame(applyScroll);
    }
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
  let resizeRaf = 0;
  let lastResizeY = 0;

  function applyResizeFrame(): void {
    resizeRaf = 0;
    if (resizeGesture === null) return;
    store.setHeight(
      resizeGesture.startHeight + (lastResizeY - resizeGesture.startY),
    );
  }

  function startResize(e: PointerEvent): void {
    if (e.button !== 0) return;
    if (!(e.currentTarget instanceof HTMLElement)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeGesture = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startHeight: store.height,
    };
    lastResizeY = e.clientY;
  }

  function moveResize(e: PointerEvent): void {
    if (resizeGesture?.pointerId !== e.pointerId) return;
    lastResizeY = e.clientY;
    if (resizeRaf === 0) {
      resizeRaf = requestAnimationFrame(applyResizeFrame);
    }
  }

  function endResize(e: PointerEvent): void {
    if (resizeGesture?.pointerId !== e.pointerId) return;
    if (resizeRaf !== 0) {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = 0;
    }
    lastResizeY = e.clientY;
    applyResizeFrame();
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

  // Stable callbacks passed to every FlowBandSlice. Hoisted so the
  // template does not allocate new closures on every render.
  const isExpandedCb = (id: number): boolean => store.isExpanded(id);
  const onToggleSliceCb = (id: number): void => {
    store.toggleSlice(id);
  };
  const onToggleCardCb = (id: number): void => {
    store.toggleExpanded(id);
  };
  const onToggleRunCb = (id: number): void => {
    store.toggleRun(id);
  };

  /**
   * Columns for one slice, used by the overlay list. Declared here with
   * an explicit return type rather than called inline in the template:
   * the type-aware lint rules cannot follow a generic return through a
   * template each-expression, and read it as untyped.
   */
  function cellsOf(slice: FlowSlice): FlowCell[] {
    return groupSliceEvents(slice.events);
  }
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#snippet detailRowTable(heading: string, rows: readonly FlowDetailRow[])}
  <div class="detail-table-wrap">
    <h4 class="detail-section-head">{heading}</h4>
    <table class="detail-table">
      <thead>
        <tr>
          <th>{m.demo_flow_detail_col_name()}</th>
          <th>{m.demo_flow_detail_col_kind()}</th>
          <th>{m.demo_flow_detail_col_value()}</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as row (row.name)}
          <tr>
            <td class="detail-td-name">{row.name}</td>
            <td class="detail-td-kind">
              <span class="detail-kind-icon" aria-hidden="true">
                <FlowBandKindIcon kind={row.kind} size={12} />
              </span>
              <span class="detail-kind-word"
                >{classificationName(row.kind)}</span
              >
            </td>
            <td class="detail-td-value">
              <code>{row.value}</code>
              {#if row.bytes !== undefined}
                <span class="detail-bytes">
                  {m.demo_flow_detail_bytes({ count: String(row.bytes) })}
                </span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/snippet}

{#snippet detailPanel(event: DemoFlowEvent)}
  {@const ctx = store.expandedContext}
  {@const preview = truncatePreview(event.payloadPreview)}
  {@const detail = event.detail}
  {@const classification = detail?.classification ?? null}
  <div class="detail" style:--lane-color={laneColorVar(event.lane)}>
    <div class="detail-head">
      <span class="detail-lane">
        <span class="detail-lane-icon" aria-hidden="true">
          <FlowBandLaneIcon lane={event.lane} size={14} />
        </span>
        {laneName(event.lane)}
      </span>
      <span class="detail-meta">{directionLabel(event.direction)}</span>
      {#if classification !== null}
        <span class="detail-chip" title={kindNote(classification)}>
          <span class="detail-kind-icon" aria-hidden="true">
            <FlowBandKindIcon kind={classification} size={12} />
          </span>
          {classificationName(classification)}
        </span>
      {/if}
      {#if event.seamKey !== null}
        <span class="detail-badge">
          <Clapperboard size={10} />
          {m.demo_flow_seam_badge()}
        </span>
      {/if}
      {#if ctx !== null}
        <span class="detail-meta">
          {m.demo_flow_detail_step({
            index: String(ctx.stepIndex),
            count: String(ctx.stepCount),
          })}
        </span>
        {#if ctx.offsetMs > 0}
          <span class="detail-meta detail-tabular">
            {m.demo_flow_detail_offset({ ms: String(ctx.offsetMs) })}
          </span>
        {/if}
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

    <!-- Timing line -->
    <div class="detail-timing">
      {#if event.durationMs !== null}
        <span class="detail-meta">
          <span class="detail-key">{m.demo_flow_detail_duration()}</span>
          {m.demo_flow_duration_ms({ ms: String(event.durationMs) })}
        </span>
      {/if}
      {#if ctx?.partner !== null && ctx?.partner?.durationMs !== null && event.durationMs !== null}
        <span class="detail-meta">
          <span class="detail-key">{m.demo_flow_detail_round_trip()}</span>
          {m.demo_flow_duration_ms({
            ms: String(event.durationMs + (ctx?.partner?.durationMs ?? 0)),
          })}
        </span>
      {/if}
    </div>

    <!-- Source statement (SQL, procedure path, etc.) -->
    {#if detail?.source !== null && detail?.source !== undefined}
      <div class="detail-source-wrap">
        <h4 class="detail-section-head">{m.demo_flow_detail_source()}</h4>
        <div class="detail-source-scroll">
          <pre class="detail-source"><code>{detail.source}</code></pre>
        </div>
      </div>
    {/if}

    <!-- Input rows -->
    {#if detail !== null && detail.input.length > 0}
      {@render detailRowTable(m.demo_flow_detail_input(), detail.input)}
    {/if}

    <!-- Result rows -->
    {#if detail !== null && detail.result.length > 0}
      {@render detailRowTable(m.demo_flow_detail_result(), detail.result)}
    {/if}

    <!-- Fallback for events without structured detail -->
    {#if detail === null && preview !== null}
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
              <!-- The overlay folds runs the same way the swimlane does.
                   It has more to gain from it: a flat list has no columns
                   to save, but twelve identical decrypt rows push whatever
                   came next off the bottom of a phone screen. -->
              {#each cellsOf(slice) as cell (cell.id)}
                {#if cell.isRun}
                  {@const anchor = cell.anchor}
                  {@const open = store.expandedRuns.has(cell.id)}
                  <FlowBandCardStack
                    events={cell.events}
                    expanded={open}
                    laneName={laneName(anchor.lane)}
                    directionName={directionLabel(anchor.direction)}
                    seamBadge={m.demo_flow_seam_badge()}
                    spreadHint={m.demo_flow_stack_spread()}
                    expandHint={m.demo_flow_expand()}
                    collapseHint={m.demo_flow_collapse()}
                    restackLabel={m.demo_flow_stack_restack()}
                    countLabel={stepsLabel(cell.events.length)}
                    variant="list"
                    {locale}
                    isExpanded={isExpandedCb}
                    onToggleCard={onToggleCardCb}
                    onToggleStack={() => {
                      store.toggleRun(cell.id);
                    }}
                  />
                {:else}
                  {@const event = cell.anchor}
                  <FlowBandCard
                    {event}
                    laneName={laneName(event.lane)}
                    directionName={directionLabel(event.direction)}
                    seamBadge={m.demo_flow_seam_badge()}
                    toggleHint={store.isExpanded(event.id)
                      ? m.demo_flow_collapse()
                      : m.demo_flow_expand()}
                    expanded={store.isExpanded(event.id)}
                    variant="list"
                    {locale}
                    onToggle={(id: number) => store.toggleExpanded(id)}
                  />
                  {#if store.isExpanded(event.id)}
                    {@render detailPanel(event)}
                  {/if}
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
              <span class="lane-swatch" aria-hidden="true"></span>
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
                countLabel={stepsLabel}
                expandedRuns={store.expandedRuns}
                onToggleRun={onToggleRunCb}
                seamBadge={m.demo_flow_seam_badge()}
                expandHint={m.demo_flow_expand()}
                collapseHint={m.demo_flow_collapse()}
                restackLabel={m.demo_flow_stack_restack()}
                {laneName}
                directionName={directionLabel}
                {locale}
                isExpanded={isExpandedCb}
                onToggleSlice={onToggleSliceCb}
                onToggleCard={onToggleCardCb}
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
    background: color-mix(in srgb, var(--paper) 96%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--hair);
  }

  .band-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 28px;
    padding: 0 0.75rem;
    color: var(--muted);
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
    background: color-mix(in srgb, var(--ink) 6%, transparent);
  }

  .band-close:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: -2px;
  }

  .band-main {
    display: flex;
    min-height: 0;
    padding: 0 0.75rem;
  }

  /* Lane column: icon, name, and a tinted swatch per lane. The old
     left-border strip is gone per the Inkwell "no thick-left-border
     accents" rule. The swatch is a small rounded block that reads as a
     legend entry beside the icon and label. */
  .lane-column {
    flex: 0 0 auto;
    width: 8.5rem;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--hair);
    padding-right: 0.5rem;
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

  .lane-swatch {
    flex: 0 0 auto;
    width: 10px;
    height: 10px;
    border-radius: 3px;
    background: color-mix(in srgb, var(--lane-color) 20%, transparent);
  }

  :global(html.dark) .lane-swatch {
    background: color-mix(in srgb, var(--lane-color) 28%, transparent);
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
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
    color: var(--muted);
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
    background: color-mix(in srgb, var(--ink) 30%, transparent);
  }

  .band-resize:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: -2px;
  }

  .band-resize-grip {
    width: 36px;
    height: 3px;
    border-radius: 2px;
    background: color-mix(in srgb, var(--ink) 18%, transparent);
  }

  /* -----------------------------------------------------------------------
     Expanded detail panel
     ----------------------------------------------------------------------- */

  .detail {
    border-top: 1px solid var(--hair);
    padding: 0.5rem 0.75rem;
    border-radius: 0 0 10px 10px;
    background: color-mix(in srgb, var(--lane-color) 6%, var(--raised));
  }

  :global(html.dark) .detail {
    background: color-mix(in srgb, var(--lane-color) 10%, var(--raised));
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
    color: var(--ink);
  }

  .detail-lane-icon {
    display: inline-flex;
    color: var(--lane-color);
  }

  .detail-meta {
    color: var(--muted);
  }

  .detail-tabular {
    font-variant-numeric: tabular-nums;
  }

  .detail-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.0625rem 0.375rem;
    border: 1px solid var(--hair);
    border-radius: 6px;
    color: var(--ink-2);
    font-size: 0.625rem;
  }

  .detail-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.0625rem 0.375rem;
    border: 1px dashed color-mix(in srgb, var(--ink) 25%, transparent);
    border-radius: 999px;
    color: var(--muted);
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
    color: var(--muted);
    cursor: pointer;
  }

  .detail-close:hover {
    background: color-mix(in srgb, var(--ink) 6%, transparent);
  }

  .detail-close:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: -2px;
  }

  .detail-label {
    margin: 0.25rem 0 0;
    font-size: 0.8125rem;
    color: var(--ink);
  }

  .detail-timing {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin: 0.25rem 0 0;
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }

  .detail-key {
    font-weight: 600;
  }

  /* Source (SQL, procedure path, etc.) */
  .detail-source-wrap {
    margin: 0.375rem 0 0;
  }

  .detail-section-head {
    margin: 0 0 0.125rem;
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .detail-source-scroll {
    overflow-x: auto;
    max-width: 100%;
  }

  .detail-source {
    margin: 0;
    padding: 0.375rem 0.5rem;
    border: 1px solid var(--hair);
    border-radius: 6px;
    background: color-mix(in srgb, var(--paper-deep) 60%, transparent);
    font-family:
      "Atkinson Hyperlegible Mono Variable", ui-monospace, SFMono-Regular,
      Menlo, monospace;
    font-size: 0.6875rem;
    line-height: 1.4;
    white-space: pre;
    color: var(--ink);
  }

  /* Input/result tables */
  .detail-table-wrap {
    margin: 0.375rem 0 0;
    overflow-x: auto;
    max-width: 100%;
  }

  .detail-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.6875rem;
  }

  .detail-table th {
    text-align: left;
    padding: 0.125rem 0.5rem 0.125rem 0;
    font-weight: 600;
    color: var(--muted);
    border-bottom: 1px solid var(--hair);
    white-space: nowrap;
  }

  .detail-table td {
    padding: 0.125rem 0.5rem 0.125rem 0;
    border-bottom: 1px solid color-mix(in srgb, var(--hair) 50%, transparent);
    color: var(--ink);
  }

  .detail-td-name {
    font-family:
      "Atkinson Hyperlegible Mono Variable", ui-monospace, SFMono-Regular,
      Menlo, monospace;
    white-space: nowrap;
    color: var(--ink-2);
  }

  .detail-td-kind {
    white-space: nowrap;
  }

  .detail-kind-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    color: var(--muted);
  }

  .detail-kind-word {
    font-size: 0.625rem;
    color: var(--muted);
  }

  .detail-td-value code {
    font-family:
      "Atkinson Hyperlegible Mono Variable", ui-monospace, SFMono-Regular,
      Menlo, monospace;
    font-size: 0.6875rem;
    word-break: break-all;
  }

  .detail-bytes {
    font-size: 0.625rem;
    font-variant-numeric: tabular-nums;
    color: var(--muted);
    margin-left: 0.25rem;
  }

  .detail-payload {
    margin: 0.25rem 0 0;
    font-size: 0.75rem;
    color: var(--muted);
    overflow-wrap: anywhere;
  }

  .detail-payload code {
    font-family:
      "Atkinson Hyperlegible Mono Variable", ui-monospace, SFMono-Regular,
      Menlo, monospace;
    font-size: 0.6875rem;
  }

  .detail-seam {
    margin: 0.25rem 0 0;
    font-size: 0.75rem;
    color: var(--muted);
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
    background: var(--paper);
    border-top: 1px solid var(--hair);
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
    color: var(--muted);
  }
</style>
