<!--
  Shell wrapper for Konsta Messagebar (compose bar).

  Fixed at the bottom of the viewport. Supports two modes:
  "reply" (send SMS to client) and "note" (team-only internal note).

  Left slot: + button (compose actions), mode toggle icon.
  Right slot: send button.
  All buttons are Konsta Link iconOnly, same as tabbar icons.

  In note mode, the Glass pills get a brand-color tint via CSS custom
  property overrides on Konsta's glass tokens. On iOS this produces
  tinted liquid glass. On Material, the toolbar background tints.
-->
<script lang="ts">
  import { Messagebar, Link } from "konsta/svelte";
  import {
    Plus,
    Send,
    NotepadTextDashed,
    MessageSquareText,
  } from "@lucide/svelte";
  import type { ShellMessagebarProps } from "./types.js";
  import * as m from "$lib/paraglide/messages.js";

  let {
    value = $bindable(""),
    mode = $bindable("reply"),
    onsend,
    onplus,
    oninput,
    sendDisabled = false,
    inline = false,
  }: ShellMessagebarProps = $props();

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

  // Publish the messagebar's rendered height as a CSS variable so
  // siblings (e.g., chat-container) can use it for padding-bottom.
  let anchorEl = $state<HTMLDivElement | undefined>();

  $effect(() => {
    if (inline) return;
    const el = anchorEl;
    if (!el) return;

    function setHeight(h: number): void {
      if (h <= 0) return;
      document.documentElement.style.setProperty(
        "--messagebar-height",
        `${String(Math.ceil(h))}px`,
      );
    }

    setHeight(el.offsetHeight);

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const box = entry.borderBoxSize[0];
      setHeight(box !== undefined ? box.blockSize : el.offsetHeight);
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--messagebar-height");
    };
  });
</script>

<div
  bind:this={anchorEl}
  class="shell-messagebar-anchor"
  class:note-mode={mode === "note"}
  class:shell-messagebar-inline={inline}
>
  <Messagebar bind:value {placeholder} {oninput} class="shell-messagebar">
    {#snippet left()}
      <Link iconOnly onclick={onplus} aria-label={m.ticket_compose_actions()}>
        <Plus size={20} aria-hidden="true" />
      </Link>
      <Link
        iconOnly
        onclick={toggleMode}
        role="switch"
        aria-checked={mode === "note" ? "true" : "false"}
        aria-label={mode === "note"
          ? m.ticket_switch_to_reply()
          : m.ticket_switch_to_note()}
      >
        {#if mode === "note"}
          <NotepadTextDashed size={20} aria-hidden="true" />
        {:else}
          <MessageSquareText size={20} aria-hidden="true" />
        {/if}
      </Link>
    {/snippet}
    {#snippet right()}
      <Link
        iconOnly
        onclick={onsend}
        aria-label={sendLabel}
        aria-disabled={sendDisabled ? "true" : undefined}
        class={sendDisabled ? "opacity-30 pointer-events-none" : ""}
      >
        <Send size={20} aria-hidden="true" />
      </Link>
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

  .shell-messagebar-anchor.shell-messagebar-inline {
    position: relative;
    z-index: auto;
  }

  /* Match the tabbar safe-area override: strip extra 16px Konsta adds. */
  :global(.k-ios .shell-messagebar .k-toolbar) {
    padding-bottom: var(--k-safe-area-bottom) !important;
  }

  /* Note mode: tint the Glass pill elements with brand-accent. Uses
     --glass-surface so the tint follows the glass mode system (no need
     for separate .dark override).
     Specificity: the glass mode overrides in shared.css target
     html.glass-*.light/dark .backdrop-blur-lg at (0,3,1).
     :global(html) prefix bumps this selector to (0,3,1) minimum,
     and component styles load after global CSS so source order wins. */
  :global(html) .note-mode :global(.backdrop-blur-lg) {
    background-color: color-mix(
      in srgb,
      var(--brand-accent) 20%,
      var(--glass-surface)
    ) !important;
  }
</style>
