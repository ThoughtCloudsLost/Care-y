<script lang="ts">
  import { CircleQuestionMark } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface Props {
    onhelp?: () => void;
  }

  let { onhelp }: Props = $props();

  function handleHelp(e: MouseEvent): void {
    e.stopPropagation();
    e.preventDefault();
    onhelp?.();
  }
</script>

<span class="encrypted-title">
  <span class="encrypted-text">{m.dashboard_encrypted_ticket()}</span>
  {#if onhelp}
    <button
      type="button"
      class="help-icon"
      onclick={handleHelp}
      aria-label={m.dashboard_encrypted_help_label()}
    >
      <CircleQuestionMark size={14} aria-hidden="true" />
    </button>
  {/if}
</span>

<style>
  .encrypted-title {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    min-width: 0;
  }

  .encrypted-text {
    font-style: italic;
    opacity: 0.45;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .help-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2.75rem;
    min-height: 2.75rem;
    margin: -0.875rem -0.75rem -0.875rem 0;
    padding: 0;
    border: none;
    background: none;
    color: var(--muted);
    cursor: pointer;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
  }
</style>
