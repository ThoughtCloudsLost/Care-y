<!--
  Popup wrapper with focus trap and focus restore.
  Contains its own Navbar for navigation and a scrollable content area.
  Portaled to .k-page so it escapes any parent stacking contexts.
-->
<script lang="ts">
  import { Popup, Navbar, Link } from "konsta/svelte";
  import { X } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type { ShellPopupProps } from "./types";
  import { useFocusTrap } from "./use-focus-trap.svelte";
  import { useDeferredUnmount } from "./use-deferred-unmount.svelte";
  import { portal } from "./portal";
  import ShellBackdrop from "./ShellBackdrop.svelte";

  let {
    opened,
    ondismiss,
    title,
    ariaLabel,
    left: navLeft,
    right: navRight,
    children,
  }: ShellPopupProps = $props();

  const trap = useFocusTrap({
    get opened() {
      return opened;
    },
    get ondismiss() {
      return ondismiss;
    },
  });

  const mounted = useDeferredUnmount({
    get opened() {
      return opened;
    },
  });
</script>

<div use:portal={".k-page"}>
  <ShellBackdrop {opened} ondismiss={trap.handleDismiss} />
  <Popup {opened} backdrop={false} class="glass shell-popup">
    <div
      bind:this={trap.dialogEl}
      role="dialog"
      aria-modal={opened ? "true" : undefined}
      aria-label={ariaLabel ?? title}
      tabindex="-1"
      inert={!opened ? true : undefined}
      data-testid="popup-dialog"
      class="popup-dialog"
    >
      {#if mounted.current && ((title != null && title !== "") || navLeft != null || navRight != null)}
        <Navbar {title}>
          {#snippet left()}
            {#if navLeft}
              {@render navLeft()}
            {/if}
          {/snippet}
          {#snippet right()}
            {#if navRight}
              {@render navRight()}
            {:else}
              <!-- Icon-only X with a label distinct from the ticket's
                   Close action: a text "Close" here reads as closing
                   the ticket, not the overlay. -->
              <Link
                role="button"
                iconOnly
                aria-label={m.shell_dismiss_overlay()}
                onclick={trap.handleDismiss}
              >
                <X size={22} aria-hidden="true" />
              </Link>
            {/if}
          {/snippet}
        </Navbar>
      {/if}
      <div class="popup-scroll">
        {#if mounted.current}
          {@render children()}
        {/if}
      </div>
    </div>
  </Popup>
</div>

<style>
  /* iOS: handled by .glass utility (shared.css) */

  .popup-dialog {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  /* Closed popups stay mounted; inert plus delayed visibility keeps them
     out of the accessibility tree and axe evaluation while letting the
     close transition finish (mirrors ShellSheet). */
  .popup-dialog:not([inert]) {
    visibility: visible;
    transition: none;
  }

  .popup-dialog[inert] {
    visibility: hidden;
    transition: visibility 0s var(--anim-overlay-outro, 400ms);
  }

  @media (prefers-reduced-motion: reduce) {
    .popup-dialog[inert] {
      transition-delay: 0s;
    }
  }

  .popup-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
  }

  @media (min-width: 1024px) {
    .popup-dialog {
      max-width: 480px;
      margin-inline: auto;
    }
  }
</style>
