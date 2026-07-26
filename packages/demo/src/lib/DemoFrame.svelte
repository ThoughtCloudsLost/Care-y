<!--
  DemoFrame: presentational device chrome for the interactive demo.

  Renders a fixed 390x844 logical-point phone frame with rounded bezel
  and a .screen inner element. A ResizeObserver measures the parent and
  applies a CSS transform so the frame fits without horizontal overflow.

  No Konsta imports: device bezels have no Konsta equivalent.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import * as m from "$lib/paraglide/messages.js";

  interface Props {
    dark?: boolean;
    children: Snippet;
  }

  let { dark = false, children }: Props = $props();

  const FRAME_W = 390;
  const FRAME_H = 844;
  // Bezel adds padding around the screen on each side
  const BEZEL = 12;
  const OUTER_W = FRAME_W + BEZEL * 2;
  const OUTER_H = FRAME_H + BEZEL * 2;

  let scaleFactor = $state(1);

  // Attachment instead of bind:this + $effect: the node arrives typed and
  // non-null, and the observer lifecycle is tied to the element directly.
  const observeScale: Attachment<HTMLDivElement> = (node) => {
    const observer = new ResizeObserver((entries) => {
      const entry = entries.at(0);
      if (entry === undefined) return;
      const { width, height } = entry.contentRect;
      const scaleX = width / OUTER_W;
      const scaleY = height / OUTER_H;
      scaleFactor = Math.min(scaleX, scaleY, 1);
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  };
</script>

<div class="frame-container" {@attach observeScale}>
  <div
    class="device"
    style:width="{OUTER_W}px"
    style:height="{OUTER_H}px"
    style:transform="scale({scaleFactor})"
  >
    <div
      class="screen theme-default"
      class:dark
      class:light={!dark}
      style:width="{FRAME_W}px"
      style:height="{FRAME_H}px"
    >
      {@render children()}
      <div class="status-bar" aria-hidden="true">
        <span class="status-time">{m.demo_status_bar_time()}</span>
        <span class="island"></span>
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
      <div class="home-indicator" aria-hidden="true"></div>
    </div>
  </div>
</div>

<style>
  .frame-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .device {
    flex-shrink: 0;
    transform-origin: center center;
    border-radius: 48px;
    background: #1a1a1a;
    padding: 12px;
    /* The device is the containing block for fixed-position shell
       chrome (nearest transformed ancestor). Production hides
       off-canvas chrome (closed side panel) beyond the viewport;
       here the device must clip it. */
    overflow: hidden;
    box-shadow:
      0 0 0 2px #333,
      0 20px 60px rgba(0, 0, 0, 0.4);
  }

  .screen {
    border-radius: 38px;
    overflow: hidden;
    position: relative;
    background: var(--surface-primary, #fff);
    /* Identity transform makes the screen the containing block for
       fixed-position shell chrome (sheet, panels, navbar overlays),
       so they anchor to the 390x844 screen exactly as they anchor
       to the viewport in production, instead of to the bezel box. */
    transform: translateZ(0);
  }

  .screen.dark {
    background: var(--surface-primary, #1c1c1e);
  }

  /* Device chrome overlays. The app renders beneath the status bar
     and above the home indicator via the safe-area insets that
     DemoSurface sets on the Konsta root, matching a real device. */
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
    z-index: 9999;
    color: #1d1d1f;
  }

  .screen.dark .status-bar {
    color: #f5f5f7;
  }

  .status-time {
    font-size: 17px;
    font-weight: 600;
    font-family: -apple-system, system-ui, sans-serif;
    letter-spacing: 0.01em;
    min-width: 54px;
  }

  .island {
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 122px;
    height: 36px;
    border-radius: 20px;
    background: #000;
  }

  .status-glyphs {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .home-indicator {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 134px;
    height: 5px;
    border-radius: 3px;
    background: #1d1d1f;
    opacity: 0.9;
    pointer-events: none;
    z-index: 9999;
  }

  .screen.dark .home-indicator {
    background: #f5f5f7;
  }
</style>
