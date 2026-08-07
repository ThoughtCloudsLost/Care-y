<!--
  DemoFrame: floating device bezel around a real-viewport iframe.

  Renders the iframe at a derived viewport size with a CSS scale
  transform so it fits the footprint. The outer element is sized to
  the footprint plus bezel. The status bar overlay is shown when the
  derived viewport is phone-shaped (width < 768); it hides with a
  fade at wider viewports. Dynamic island and home indicator are
  removed; at desktop widths the app renders edge to edge.

  Pointer handling: drag via bezel surface, resize via edge/corner
  handles. setPointerCapture keeps events arriving while the pointer
  crosses the iframe. A transparent shield covers the iframe during
  active gestures to prevent event leaks.
-->
<script lang="ts">
  import type { DemoBridge } from "./bridge.js";
  import * as m from "$lib/paraglide/messages.js";
  import {
    BEZEL,
    deriveBezelRadius,
    type FrameGeometry,
  } from "./frame-geometry.svelte.js";
  import { isRecordMode, forwardRecordParam } from "./record-mode.js";

  interface Props {
    dark?: boolean;
    geo: FrameGeometry;
    onbridgeready: (bridge: DemoBridge) => void;
    /** Whether a drag or resize gesture is active (shows pointer shield). */
    gestureActive?: boolean;
  }

  let {
    dark = false,
    geo,
    onbridgeready,
    gestureActive = false,
  }: Props = $props();

  let iframeEl: HTMLIFrameElement | undefined = $state();

  const phoneUrl = forwardRecordParam(`${import.meta.env.BASE_URL}phone.html`);

  /** Show the status bar only when viewport is phone-shaped (< 768). */
  const showStatusBar = $derived(geo.viewport.w < 768);

  /** Real system time for the status bar clock, iOS style (no AM/PM). */
  function formatClock(d: Date): string {
    const h = d.getHours() % 12 === 0 ? 12 : d.getHours() % 12;
    return `${String(h)}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  // In record mode the clock reads 9:41 (Apple marketing convention)
  // and no interval fires, so every frame is identical.
  const RECORD_CLOCK = "9:41";

  let clock = $state(isRecordMode() ? RECORD_CLOCK : formatClock(new Date()));

  $effect(() => {
    if (isRecordMode()) return;
    const id = setInterval(() => {
      clock = formatClock(new Date());
    }, 15_000);
    return () => clearInterval(id);
  });

  // rAF handle for the bridge acquisition loop. Stored so a reload()
  // during the retry window can cancel the in-flight loop before
  // starting a fresh one (prevents two loops racing).
  let bridgeRaf = 0;

  /**
   * Poll for the demoBridge on the iframe's contentWindow. The phone app
   * assigns it synchronously during module execution (before the load
   * event fires), so it is usually present immediately. A bounded
   * requestAnimationFrame retry loop handles edge cases.
   */
  function acquireBridge(win: Window): void {
    const MAX_ATTEMPTS = 30;
    let attempt = 0;

    function poll(): void {
      bridgeRaf = 0;
      const bridge = win.demoBridge;
      if (bridge !== undefined) {
        onbridgeready(bridge);
        return;
      }
      attempt += 1;
      if (attempt < MAX_ATTEMPTS) {
        bridgeRaf = requestAnimationFrame(poll);
      }
    }

    poll();
  }

  function cancelPendingBridgePoll(): void {
    if (bridgeRaf !== 0) {
      cancelAnimationFrame(bridgeRaf);
      bridgeRaf = 0;
    }
  }

  function handleLoad(): void {
    cancelPendingBridgePoll();
    const win = iframeEl?.contentWindow;
    if (win === null || win === undefined) return;
    acquireBridge(win);
  }

  /** Reload the phone iframe for a full app restart. */
  export function reload(): void {
    cancelPendingBridgePoll();
    iframeEl?.contentWindow?.location.reload();
  }

  const bezelRadius = $derived(deriveBezelRadius(geo.footprintW));

  const screenRadius = $derived(Math.max(0, bezelRadius - BEZEL));
</script>

<div
  class="device"
  style:width="{geo.footprintW + BEZEL * 2}px"
  style:height="{geo.footprintH + BEZEL * 2}px"
  style:border-radius="{bezelRadius}px"
>
  <!-- Bezel repaint layer: overflow clipping can bleed on composited
       layers; the bezel border must always win visually. -->
  <div
    class="bezel-overlay"
    style:border-radius="{bezelRadius}px"
    aria-hidden="true"
  ></div>

  <div
    class="screen"
    class:dark
    class:light={!dark}
    style:width="{geo.footprintW}px"
    style:height="{geo.footprintH}px"
    style:border-radius="{screenRadius}px"
  >
    <iframe
      bind:this={iframeEl}
      src={phoneUrl}
      title={m.demo_phone_frame_title()}
      width={geo.viewport.w}
      height={geo.viewport.h}
      onload={handleLoad}
      class="phone-iframe"
      style:width="{geo.viewport.w}px"
      style:height="{geo.viewport.h}px"
      style:transform="scale({geo.zoom})"
      style:transform-origin="top left"
    ></iframe>

    <!-- Status bar: visible only at phone-shaped viewports (< 768px).
         Fades out during resize transitions. PhoneApp keeps the
         59px safe-area inset inside the iframe under the same condition,
         so app content clears this overlay exactly when it is visible. -->
    <div
      class="status-bar"
      class:status-bar-hidden={!showStatusBar}
      aria-hidden="true"
    >
      <span class="status-time">{clock}</span>
      <span class="status-glyphs">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="0.8" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
          <rect x="10" y="3" width="3" height="9" rx="0.8" />
          <rect
            x="15"
            y="0.5"
            width="3"
            height="11.5"
            rx="0.8"
            opacity="0.35"
          />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <path
            d="M8.5 12 L5.6 8.9 a4.4 4.4 0 0 1 5.8 0 Z M3.5 6.6 a7.4 7.4 0 0 1 10 0 L11.6 8.6 a4.6 4.6 0 0 0-6.2 0 Z M0.9 3.9 a11 11 0 0 1 15.2 0 L14.2 6 a8.2 8.2 0 0 0-11.4 0 Z"
          />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect
            x="0.5"
            y="0.5"
            width="21"
            height="11"
            rx="3"
            stroke="currentColor"
            opacity="0.4"
          />
          <rect
            x="2"
            y="2"
            width="16"
            height="8"
            rx="1.6"
            fill="currentColor"
          />
          <path
            d="M23 4 v4 a2.2 2.2 0 0 0 0-4 Z"
            fill="currentColor"
            opacity="0.4"
          />
        </svg>
      </span>
    </div>

    <!-- Transparent shield: covers the iframe during active drag/resize
         so pointer events cannot leak into the iframe's document. -->
    {#if gestureActive}
      <div class="pointer-shield" aria-hidden="true"></div>
    {/if}
  </div>
</div>

<style>
  .device {
    flex-shrink: 0;
    background: #1a1a1a;
    padding: 12px;
    overflow: hidden;
    box-shadow: 0 0 0 2px #333;
    position: relative;
  }

  .bezel-overlay {
    content: "";
    position: absolute;
    inset: 0;
    border: 12px solid #1a1a1a;
    pointer-events: none;
    z-index: 2;
  }

  .screen {
    overflow: hidden;
    position: relative;
    background: var(--surface-primary, #fff);
  }

  .screen.dark {
    background: var(--surface-primary, #1c1c1e);
  }

  .phone-iframe {
    border: 0;
    display: block;
  }

  /* Status bar: iOS-style overlay at the top of the screen.
     Visible only when the derived viewport is phone-shaped. */
  .status-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 59px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px 8px;
    pointer-events: none;
    z-index: 3;
    color: #1d1d1f;
    opacity: 1;
    transition: opacity 0.2s ease;
  }

  .screen.dark .status-bar {
    color: #f5f5f7;
  }

  .status-bar-hidden {
    opacity: 0;
    pointer-events: none;
  }

  .status-time {
    font-size: 17px;
    font-weight: 600;
    font-family: -apple-system, system-ui, sans-serif;
    letter-spacing: 0.01em;
    min-width: 54px;
  }

  .status-glyphs {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .pointer-shield {
    position: absolute;
    inset: 0;
    z-index: 1;
    cursor: inherit;
  }

  @media (prefers-reduced-motion: reduce) {
    .status-bar {
      transition: none;
    }
  }
</style>
