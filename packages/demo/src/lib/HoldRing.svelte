<script lang="ts">
  /**
   * Radial progress ring for the long-press hold gesture.
   *
   * Purely presentational (aria-hidden). The ring fills clockwise from
   * the top as progress goes from 0 to 1. The hold always takes the full
   * duration, so the ring stays visible under reduced motion; only its
   * easing transition is dropped there.
   */

  interface Props {
    /** Hold progress, 0 to 1. */
    progress: number;
    /** Diameter of the ring in px. */
    size?: number;
  }

  let { progress, size = 48 }: Props = $props();

  const STROKE_WIDTH = 3;
  const radius = $derived((size - STROKE_WIDTH) / 2);
  const circumference = $derived(2 * Math.PI * radius);
  const offset = $derived(circumference * (1 - progress));
  const center = $derived(size / 2);
</script>

<svg
  class="hold-ring"
  width={size}
  height={size}
  viewBox="0 0 {size} {size}"
  aria-hidden="true"
>
  <!-- Background track -->
  <circle
    cx={center}
    cy={center}
    r={radius}
    fill="none"
    stroke="rgba(255, 255, 255, 0.2)"
    stroke-width={STROKE_WIDTH}
  />
  <!-- Progress arc -->
  <circle
    class="hold-ring__arc"
    cx={center}
    cy={center}
    r={radius}
    fill="none"
    stroke="rgba(255, 255, 255, 0.9)"
    stroke-width={STROKE_WIDTH}
    stroke-dasharray={circumference}
    stroke-dashoffset={offset}
    stroke-linecap="round"
    transform="rotate(-90 {center} {center})"
  />
</svg>

<style>
  .hold-ring {
    pointer-events: none;
    display: block;
  }

  .hold-ring__arc {
    transition: stroke-dashoffset 60ms linear;
  }

  @media (prefers-reduced-motion: reduce) {
    .hold-ring__arc {
      transition: none;
    }
  }
</style>
