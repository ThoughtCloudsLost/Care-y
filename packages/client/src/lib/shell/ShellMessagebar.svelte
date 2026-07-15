<!--
  Shell wrapper for Konsta Messagebar (compose bar).

  Fixed at the bottom of the viewport. Supports three modes:
  "reply" (encrypted in-app message), "note" (internal note),
  and "sms" (plaintext SMS to client).

  When collapsed, only the + button renders. Consumers control
  collapse state and provide header/footer snippets for mode
  indicators, character counters, etc.

  Left slot: + button (compose actions).
  Right slot: send button.
  All buttons are Konsta Link iconOnly, same as tabbar icons.
-->
<script lang="ts">
  import { Messagebar, Link } from "konsta/svelte";
  import { Plus, Send } from "@lucide/svelte";
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
    collapsed = false,
    header,
    footer,
  }: ShellMessagebarProps = $props();

  const placeholder = $derived(
    mode === "note"
      ? m.ticket_compose_note_placeholder()
      : mode === "sms"
        ? m.ticket_compose_sms_placeholder()
        : m.ticket_compose_reply_placeholder(),
  );

  const sendLabel = $derived(
    mode === "note"
      ? m.ticket_save_note()
      : mode === "sms"
        ? m.ticket_sms_send()
        : m.ticket_send(),
  );

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

  // Patch Konsta internals after mount so the textarea can auto-grow.
  // Verified DOM (iOS):
  //   anchor (.shell-messagebar-anchor, fixed, height:0)
  //     .k-messagebar (fixed) ← must become relative for anchor to track height
  //       .k-toolbar (relative)
  //         bg div (absolute)
  //         inner div .h-12 (48px fixed) ← must become auto-height
  //           Glass (+ button) | Glass (textarea .h-10) | Glass (send button)
  let textareaEl = $state<HTMLTextAreaElement | undefined>();

  $effect(() => {
    if (!anchorEl) return;

    const msgbar = anchorEl.querySelector<HTMLElement>(".k-messagebar");
    if (msgbar) msgbar.style.position = "relative";

    const toolbar = anchorEl.querySelector<HTMLElement>(".k-toolbar");
    const inner = toolbar?.children[1];
    if (inner instanceof HTMLElement) {
      inner.style.height = "auto";
      inner.style.minHeight = "48px";
      inner.style.alignItems = "center";

      const left = inner.children[0];
      const right = inner.children[2];
      for (const btn of [left, right]) {
        if (btn instanceof HTMLElement) {
          btn.style.alignSelf = "flex-end";
          btn.style.height = "48px";
          btn.style.flexShrink = "0";
        }
      }
    }

    if (collapsed) {
      textareaEl = undefined;
      return;
    }

    textareaEl = anchorEl.querySelector("textarea") ?? undefined;
  });

  const MAX_LINES = 8;

  function handleInput(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLTextAreaElement) {
      target.style.height = "auto";
      target.style.overflowY = "hidden";
      const scrollH = target.scrollHeight;
      const computed = getComputedStyle(target);
      const lineH = parseFloat(computed.lineHeight) || 16;
      const padTop = parseFloat(computed.paddingTop) || 0;
      const padBot = parseFloat(computed.paddingBottom) || 0;
      const maxH = padTop + lineH * MAX_LINES + padBot;

      if (scrollH > maxH) {
        target.style.height = `${String(maxH)}px`;
        target.style.overflowY = "auto";
      } else {
        target.style.height = `${String(scrollH)}px`;
      }
    }
    oninput?.(e);
  }

  $effect(() => {
    if (value === "" && textareaEl) {
      textareaEl.style.height = "";
      textareaEl.style.overflowY = "";
    }
  });
</script>

<div
  bind:this={anchorEl}
  class="shell-messagebar-anchor"
  class:shell-messagebar-inline={inline}
  class:shell-messagebar-collapsed={collapsed}
>
  {#if !collapsed && header}{@render header()}{/if}
  <Messagebar
    bind:value
    {placeholder}
    oninput={handleInput}
    class="shell-messagebar"
  >
    {#snippet left()}
      <Link
        iconOnly
        role="button"
        onclick={(e: MouseEvent) => {
          const el = e.currentTarget;
          if (el instanceof HTMLElement) onplus(el);
        }}
        aria-label={m.ticket_compose_actions()}
      >
        <Plus size={20} aria-hidden="true" />
      </Link>
    {/snippet}
    {#snippet right()}
      <Link
        iconOnly
        role="button"
        onclick={onsend}
        aria-label={sendLabel}
        aria-disabled={sendDisabled ? "true" : undefined}
        class={sendDisabled ? "opacity-30 pointer-events-none" : ""}
      >
        <Send size={20} aria-hidden="true" />
      </Link>
    {/snippet}
  </Messagebar>
  {#if !collapsed && footer}{@render footer()}{/if}
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

  /* Blur layer behind the messagebar, fading upward into content.
     Mirrors the Navbar's bgBlur pattern but anchored at the bottom.
     Hidden when collapsed (only the + button floats, no chrome). */
  .shell-messagebar-anchor:not(.shell-messagebar-collapsed)::before {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: calc(100% + 70px);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    mask-image: linear-gradient(to top, black 60%, transparent);
    -webkit-mask-image: linear-gradient(to top, black 60%, transparent);
    pointer-events: none;
    z-index: -1;
  }

  /* Collapsed: hide the entire messagebar but preserve its layout so the
     + button never shifts when expanding. The left slot overrides back to
     visible so only the + button floats above content. */
  :global(.shell-messagebar-collapsed .k-messagebar) {
    visibility: hidden;
  }
  :global(
    .shell-messagebar-collapsed
      .k-messagebar
      .k-toolbar
      > :nth-child(2)
      > :first-child
  ) {
    visibility: visible;
  }

  :global(.shell-messagebar textarea) {
    resize: none;
    touch-action: pan-y !important;
  }
</style>
