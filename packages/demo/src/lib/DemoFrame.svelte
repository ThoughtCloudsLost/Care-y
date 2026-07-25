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
    box-shadow:
      0 0 0 2px #333,
      0 20px 60px rgba(0, 0, 0, 0.4);
  }

  .screen {
    border-radius: 38px;
    overflow: hidden;
    position: relative;
    background: var(--surface-primary, #fff);
  }

  .screen.dark {
    background: var(--surface-primary, #1c1c1e);
  }
</style>
