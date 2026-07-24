<!--
  DOM-mounted backdrop for Shell overlay components.

  Replaces Konsta's built-in CSS-transition backdrop which stays in the
  DOM at all times, toggling between opacity-1 and opacity-0 via a timed
  CSS transition. On iOS PWAs, that transition can be interrupted by rapid
  interactions or animation-frame drops, leaving the backdrop stuck at a
  partial opacity (visible dim with pointer-events-none).

  This component uses {#if} to mount/unmount the element entirely. Entry
  uses a CSS animation; exit is instant DOM removal (no stuck state
  possible). The visual pop is negligible because the Konsta overlay
  component still runs its own exit animation on top.
-->
<script lang="ts">
  interface Props {
    opened: boolean;
    ondismiss: () => void;
  }

  let { opened, ondismiss }: Props = $props();
</script>

{#if opened}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    onclick={ondismiss}
    class="shell-backdrop"
    data-testid="shell-backdrop"
  ></div>
{/if}

<style>
  .shell-backdrop {
    position: fixed;
    z-index: 40;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    animation: backdrop-in 200ms ease-out;
  }

  @keyframes backdrop-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .shell-backdrop {
      animation: none;
    }
  }
</style>
