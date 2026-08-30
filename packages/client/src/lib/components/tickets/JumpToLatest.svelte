<!--
  Return to the newest message after scrolling back through a thread.

  One implementation for the volunteer thread and both client threads. A
  volunteer talking someone through the interface over the phone is
  describing the same control in the same place, which is the whole reason
  these two surfaces share components rather than resembling each other.

  Renders as a floating pill positioned above the compose bar. Requires
  a positioned ancestor that represents the composer block (the overlay
  bottom bar on client threads, or the fixed ShellMessagebar anchor on
  the org thread). The pill uses position:absolute with
  bottom:calc(100% + 8px) to sit just above that ancestor.
-->
<script lang="ts">
  import { ArrowDown } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface Props {
    /** Show the control. Callers pass "not near the bottom, and there is a thread". */
    readonly visible: boolean;
    readonly onclick: () => void;
  }

  let { visible, onclick }: Props = $props();
</script>

{#if visible}
  <button
    type="button"
    class="jump-latest"
    {onclick}
    data-testid="jump-to-latest"
  >
    <ArrowDown size={16} aria-hidden="true" />
    {m.thread_jump_to_latest()}
  </button>
{/if}

<style>
  .jump-latest {
    appearance: none;
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    width: fit-content;
    padding: 0.375rem 0.875rem;
    min-height: 44px;
    border: 1px solid var(--hair);
    border-radius: 999px;
    background: var(--raised);
    color: var(--ink);
    font-size: var(--text-xs);
    font-weight: 600;
    cursor: pointer;
    z-index: 1;
    pointer-events: auto;
  }
</style>
