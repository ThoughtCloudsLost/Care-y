<!--
  Shell wrapper for Konsta Messagebar (compose bar).

  Maps to a native input accessory view if the app is later wrapped in
  Capacitor. Fixed at the bottom of the viewport.
  Supports two modes: "reply" (send SMS to client) and "note" (team-only
  internal note). Three simultaneous visual signals distinguish the modes:
  bar background color, mode pill label, and send icon.

  Why a wrapper div instead of `class="fixed"` on Messagebar directly:
  Konsta's Messagebar already bakes `fixed bottom-0` into its own base
  classes, but its internal Toolbar adds `pb-safe-4` on iOS for safe-area
  padding. Applying our own `padding-bottom: env(safe-area-inset-bottom)`
  on the Messagebar root would double the safe-area padding. The wrapper
  div gives us a controlled positioning layer outside Konsta's internals.
  We omit safe-area padding here because Toolbar handles it.
-->
<script lang="ts">
  import { Messagebar, Link } from "konsta/svelte";
  import { Send, Lock, Paperclip, BookDashed } from "@lucide/svelte";
  import type { ShellMessagebarProps } from "./types.js";
  import * as m from "$lib/paraglide/messages.js";

  let {
    value = $bindable(""),
    mode = $bindable("reply"),
    onsend,
    onattach,
    onpreset,
    sendDisabled = false,
  }: ShellMessagebarProps = $props();

  const NOTE_COLORS = {
    bgIos: "bg-[var(--brand-primary)]/10 dark:bg-[var(--brand-primary)]/20",
    bgMaterial:
      "bg-[var(--brand-primary)]/10 dark:bg-[var(--brand-primary)]/20",
  };

  const placeholder = $derived(
    mode === "note"
      ? m.ticket_compose_note_placeholder()
      : m.ticket_compose_reply_placeholder(),
  );

  const sendLabel = $derived(
    mode === "note" ? m.ticket_save_note() : m.ticket_send(),
  );

  function toggleMode(): void {
    mode = mode === "reply" ? "note" : "reply";
  }
</script>

<div class="shell-messagebar-anchor">
  <Messagebar
    bind:value
    {placeholder}
    colors={mode === "note" ? NOTE_COLORS : undefined}
    class="shell-messagebar"
  >
    {#snippet left()}
      <div class="messagebar-left">
        <Link iconOnly onclick={onattach} aria-label={m.ticket_attach_file()}>
          <Paperclip size={20} aria-hidden="true" />
        </Link>
        <button
          class="mode-pill"
          class:mode-pill-note={mode === "note"}
          onclick={toggleMode}
          aria-label={mode === "note"
            ? m.ticket_switch_to_reply()
            : m.ticket_switch_to_note()}
        >
          {#if mode === "note"}
            <Lock size={12} aria-hidden="true" />
            {m.ticket_mode_note()}
          {:else}
            {m.ticket_mode_reply()}
          {/if}
        </button>
      </div>
    {/snippet}
    {#snippet right()}
      <div class="messagebar-right">
        <Link
          iconOnly
          onclick={onpreset}
          aria-label={m.ticket_preset_replies()}
        >
          <BookDashed size={20} aria-hidden="true" />
        </Link>
        <Link
          iconOnly
          onclick={onsend}
          aria-label={sendLabel}
          class={sendDisabled ? "opacity-30 pointer-events-none" : ""}
        >
          {#if mode === "note"}
            <Lock size={20} aria-hidden="true" />
          {:else}
            <Send size={20} aria-hidden="true" />
          {/if}
        </Link>
      </div>
    {/snippet}
  </Messagebar>
</div>

<style>
  .shell-messagebar-anchor {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 20;
  }

  .messagebar-left,
  .messagebar-right {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .mode-pill {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 3px 8px;
    border-radius: 10px;
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    border: 1px solid var(--muted);
    background: var(--surface-1);
    color: var(--ink);
    cursor: pointer;
    white-space: nowrap;
  }

  .mode-pill-note {
    border-color: var(--brand-primary);
    background: color-mix(in srgb, var(--brand-primary) 15%, var(--surface-1));
    color: var(--brand-text);
  }
</style>
