<!--
  Shared navbar chrome for the org app and the client portal.

  Both shells compose this, so identity, the language picker, and a row
  below the navbar land in the same slot on each surface. A volunteer
  describing the interface over the phone is describing what the client
  sees. Neither shell may place these somewhere else, because neither
  shell renders them itself.

  The identity control sits in the left slot as the org logo and opens
  whatever that shell puts behind it, a panel or a drawer. The fallback
  when an org has set no logo differs per shell and arrives as a snippet:
  the org app falls back to the volunteer's initials, the client to a menu
  icon, because a client has no user identity to show.

  This component owns both glass effects. They address the Navbar's blur
  and background layers by child position, so one owner keeps that
  assumption in one file. The blur layer only exists under the iOS theme;
  under Material the first child is the background layer and the writes
  land harmlessly on it.

  The subnavbar row is absolutely positioned rather than a flex sibling.
  Resizing a flex sibling mid-scroll makes iOS Safari jump, and WebKit has
  no scroll anchoring to absorb it. The scroll container reserves the space
  with padding-top instead, which is why the measured height is reported
  back to the shell rather than kept here.
-->
<script lang="ts">
  import { Navbar, Link } from "konsta/svelte";
  import LanguagePicker from "$lib/components/inputs/LanguagePicker.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import { chromeIntensity, flashOpaqueChrome } from "./chrome-glass.svelte.js";
  import type { ShellNavbarProps } from "./types.js";

  let {
    identity,
    identityFallback,
    identityHidden = false,
    orgNamePending = false,
    locale,
    onlocalechange,
    navbarHeight = 0,
    leading,
    // Renamed so the Konsta `title` snippet below can keep that name.
    title: titleContent,
    titleHidden = false,
    actions,
    children,
    subnavbar,
    subnavbarHidden,
    onsubnavbarheight,
    subnavbarTrailing,
    trailingWidth,
    ontrailingheight,
  }: ShellNavbarProps = $props();

  // Konsta spreads its rest props onto the Navbar root, so an attachment
  // passed here lands on the .k-navbar element itself. That is the whole
  // reason this component can own the glass effects without a wrapper
  // element, which would break the shell's `:scope > .k-navbar` lookup.
  let navbarEl = $state<HTMLElement | undefined>();

  function captureNavbar(el: Element): () => void {
    navbarEl = el instanceof HTMLElement ? el : undefined;
    return (): void => {
      navbarEl = undefined;
    };
  }

  let subnavbarInnerEl = $state<HTMLElement | undefined>();
  let trailingEl = $state<HTMLElement | undefined>();
  let subnavbarHeight = $state(0);
  let trailingHeight = $state(0);

  const isSubnavbarHidden = $derived(subnavbarHidden?.() === true);
  const hasTrailing = $derived(subnavbarTrailing != null);
  const hasSubnavbar = $derived(subnavbar != null || hasTrailing);
  // A detail pane can overlap the row without carrying a subnavbar of its
  // own, so reserving the width and rendering a pane there are separate.
  const reserveTrailing = $derived(trailingWidth != null);

  $effect(() => {
    const el = subnavbarInnerEl;
    if (el == null) {
      subnavbarHeight = 0;
      onsubnavbarheight?.(0);
      return;
    }
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry != null) {
        const h = entry.borderBoxSize[0]?.blockSize ?? el.offsetHeight;
        subnavbarHeight = h;
        onsubnavbarheight?.(h);
      }
    });
    ro.observe(el, { box: "border-box" });
    return () => ro.disconnect();
  });

  $effect(() => {
    const el = trailingEl;
    if (el == null) {
      trailingHeight = 0;
      ontrailingheight?.(0);
      return;
    }
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry != null) {
        const h = entry.borderBoxSize[0]?.blockSize ?? el.offsetHeight;
        trailingHeight = h;
        ontrailingheight?.(h);
      }
    });
    ro.observe(el, { box: "border-box" });
    return () => {
      ro.disconnect();
      ontrailingheight?.(0);
    };
  });

  // ── Chrome height: extend the navbar glass over the subnavbar ──────
  // --k-navbar-chrome-h drives the height of both layers. In split mode
  // the trailing pane can be taller than the leading one, so the mask
  // becomes two side-by-side gradients, each fading at its own height.
  // --split-right-w tracks the divider.

  function setMaskProp(el: HTMLElement, prop: string, val: string): void {
    el.style.setProperty(`-webkit-${prop}`, val);
    el.style.setProperty(prop, val);
  }

  function removeMaskProp(el: HTMLElement, prop: string): void {
    el.style.removeProperty(`-webkit-${prop}`);
    el.style.removeProperty(prop);
  }

  function applyMask(
    layers: HTMLElement[],
    maskImage: string,
    sized: { size: string; position: string; repeat: string } | null,
  ): void {
    for (const layer of layers) {
      setMaskProp(layer, "mask-image", maskImage);
      if (sized != null) {
        setMaskProp(layer, "mask-size", sized.size);
        setMaskProp(layer, "mask-position", sized.position);
        setMaskProp(layer, "mask-repeat", sized.repeat);
        layer.style.setProperty("-webkit-mask-composite", "source-over");
        layer.style.setProperty("mask-composite", "add");
      } else {
        removeMaskProp(layer, "mask-size");
        removeMaskProp(layer, "mask-position");
        removeMaskProp(layer, "mask-repeat");
        removeMaskProp(layer, "mask-composite");
      }
    }
  }

  function clearMask(layers: HTMLElement[]): void {
    for (const layer of layers) {
      for (const prop of [
        "mask-image",
        "mask-size",
        "mask-position",
        "mask-repeat",
        "mask-composite",
      ]) {
        removeMaskProp(layer, prop);
      }
    }
  }

  function glassLayers(el: HTMLElement): HTMLElement[] {
    return [el.firstElementChild, el.children[1]].filter(
      (c): c is HTMLElement => c instanceof HTMLElement,
    );
  }

  $effect(() => {
    const el = navbarEl;
    if (el == null) return;

    const effectiveSubnavH = hasTrailing
      ? Math.max(subnavbarHeight, trailingHeight)
      : subnavbarHeight;
    const layers = glassLayers(el);

    if (
      !hasSubnavbar ||
      isSubnavbarHidden ||
      effectiveSubnavH <= 0 ||
      navbarHeight <= 0
    ) {
      el.style.removeProperty("--k-navbar-chrome-h");
      clearMask(layers);
      return;
    }

    const chromeH = navbarHeight + effectiveSubnavH + 16;
    el.style.setProperty("--k-navbar-chrome-h", `${String(chromeH)}px`);

    if (hasTrailing && trailingHeight > subnavbarHeight) {
      const leadingH = navbarHeight + subnavbarHeight + 16;
      const splitW = "var(--split-right-w,var(--split-detail-width,480px))";
      applyMask(
        layers,
        [
          `linear-gradient(to bottom,black ${String(Math.round(leadingH * 0.9))}px,transparent ${String(leadingH)}px)`,
          `linear-gradient(to bottom,black ${String(Math.round(chromeH * 0.9))}px,transparent ${String(chromeH)}px)`,
        ].join(","),
        {
          size: `calc(100% - ${splitW}) 100%,${splitW} 100%`,
          position: "left top,right top",
          repeat: "no-repeat",
        },
      );
    } else {
      applyMask(
        layers,
        "linear-gradient(to bottom, black 90%, transparent)",
        null,
      );
    }
  });

  // ── Glass intensity: interpolate saturate, blur, and background ────
  // Continuous rather than binary so a drag gesture can drive the glass
  // frame by frame. The first run seeds the transition, which is why it
  // is written once outside the interpolation below.
  let chromeTransitionReady = false;

  $effect(() => {
    const el = navbarEl;
    if (el == null) return;
    const t = chromeIntensity();
    const bgBlur =
      el.firstElementChild instanceof HTMLElement ? el.firstElementChild : null;
    const bgLayer =
      el.children[1] instanceof HTMLElement ? el.children[1] : null;

    if (!chromeTransitionReady) {
      chromeTransitionReady = true;
      if (bgBlur != null) {
        bgBlur.style.setProperty(
          "transition",
          "backdrop-filter 300ms ease, -webkit-backdrop-filter 300ms ease",
        );
        bgBlur.style.setProperty(
          "-webkit-backdrop-filter",
          "saturate(100%) blur(2px)",
        );
        bgBlur.style.setProperty("backdrop-filter", "saturate(100%) blur(2px)");
      }
      if (bgLayer != null) {
        bgLayer.style.setProperty("transition", "background 300ms ease");
      }
    }

    const saturate = Math.round(100 + t * 80);
    const blur = Math.round(2 + t * 38);
    const filterVal = `saturate(${String(saturate)}%) blur(${String(blur)}px)`;

    if (bgBlur != null) {
      bgBlur.style.setProperty("-webkit-backdrop-filter", filterVal);
      bgBlur.style.setProperty("backdrop-filter", filterVal);
    }

    if (t > 0) {
      const bgOpacity = Math.round(t * 85);
      if (bgLayer != null) {
        bgLayer.style.setProperty(
          "background",
          `linear-gradient(to bottom, color-mix(in srgb, var(--paper) ${String(bgOpacity)}%, transparent) 85%, transparent)`,
        );
      }
    } else {
      if (bgLayer != null) {
        bgLayer.style.removeProperty("background");
      }
    }
  });

  // Flash enhanced glass when something in the subnavbar is activated.
  // Excludes the case header, which manages its own chrome, and the
  // section rail. Scrollbar clicks land outside the interactive targets.
  $effect(() => {
    const el = subnavbarInnerEl;
    if (el == null) return;

    const handler = (e: MouseEvent): void => {
      if (!(e.target instanceof Element)) return;
      if (e.target.closest(".case-header, .section-scroll-nav") != null) return;
      const interactive = e.target.closest(
        "button, a, [role='button'], [role='tab']",
      );
      if (interactive == null) return;
      flashOpaqueChrome();
    };
    el.addEventListener("click", handler);
    return (): void => {
      el.removeEventListener("click", handler);
    };
  });
</script>

<Navbar role="banner" class="" {@attach captureNavbar}>
  {#snippet left()}
    {#if leading}
      {@render leading()}
    {:else if !identityHidden}
      <Link
        iconOnly
        role="button"
        aria-label={identity.label}
        onclick={identity.onIdentityTap}
        data-testid="shell-identity"
      >
        <span class="navbar-avatar" aria-hidden="true">
          {#if identity.logoUrl}
            <img
              src={identity.logoUrl}
              alt=""
              class="navbar-avatar-logo"
              loading="eager"
            />
          {:else}
            {@render identityFallback()}
          {/if}
        </span>
      </Link>
    {/if}
  {/snippet}

  {#snippet title()}
    {#if titleContent !== undefined}
      {#if typeof titleContent === "string"}
        <span class="heading-compact">{titleContent}</span>
      {:else}
        {@render titleContent()}
      {/if}
    {:else}
      <div class="navbar-title-group" class:heading-hidden={titleHidden}>
        <span class="heading-compact">
          <InlineSkeleton loading={orgNamePending} width="10ch">
            {identity.orgName}
          </InlineSkeleton>
        </span>
        <LanguagePicker value={locale} onchange={onlocalechange} />
      </div>
    {/if}
  {/snippet}

  {#snippet right()}
    {@render actions?.()}
  {/snippet}

  {@render children?.()}
</Navbar>

{#if hasSubnavbar}
  <div
    class="shell-subnavbar"
    class:shell-subnavbar--hidden={isSubnavbarHidden}
    class:shell-subnavbar--split={reserveTrailing}
    style:--subnavbar-h="{subnavbarHeight}px"
    style:--navbar-h="{navbarHeight}px"
  >
    <div class="shell-subnavbar-inner" bind:this={subnavbarInnerEl}>
      {@render subnavbar?.()}
    </div>
    {#if subnavbarTrailing}
      <div
        bind:this={trailingEl}
        class="split-subnavbar-right"
        style:width={`var(--split-right-w, ${trailingWidth ?? "var(--split-detail-width, 480px)"})`}
      >
        {@render subnavbarTrailing()}
      </div>
    {/if}
  </div>
{/if}

<style>
  /* ── Identity ── */

  .navbar-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    background: var(--brand-fill, var(--brand-primary));
    /* Text sits ON the brand fill, so it needs the fill-safe on-color.
       --brand-text is surface-safe and can vanish against its own fill. */
    color: var(--brand-on);
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    overflow: hidden;
  }

  .navbar-avatar-logo {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .navbar-title-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .heading-hidden {
    opacity: 0;
    transition: opacity 150ms ease;
  }

  /* Navbar keeps Konsta's default sticky + z-20. */

  @media (prefers-contrast: more) {
    :global(.k-navbar) {
      background: Canvas !important;
      color: CanvasText !important;
    }

    /* Remove the blur and gradient layers inside the Navbar */
    :global(.k-navbar) > :first-child,
    :global(.k-navbar) > :nth-child(2) {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      background: none !important;
      mask-image: none !important;
      -webkit-mask-image: none !important;
    }
  }

  /* ── Subnavbar (collapsible region below the Navbar) ────────────── */
  /* Absolutely positioned so it does NOT participate in flex layout.
     The scroll container reserves space via padding-top instead. This
     prevents iOS Safari scroll-position jumps caused by flex siblings
     resizing mid-scroll (WebKit lacks scroll anchoring in stable
     Safari 26). */

  .shell-subnavbar {
    position: absolute;
    top: var(--navbar-h);
    left: 0;
    right: 0;
    z-index: 21; /* above Navbar's blur/bg layers (z-20) */
  }

  /* Only clip overflow during the collapse animation. When visible,
     overflow must stay visible so popovers inside the subnavbar
     (filter pill dropdowns) can render outside the bounds. */
  .shell-subnavbar--hidden {
    overflow: hidden;
    pointer-events: none;
  }

  /* No background on the subnavbar itself. The Navbar's bg/blur layers
     are extended via --k-navbar-chrome-h to cover this region, creating
     one continuous glass surface regardless of theme. */

  .shell-subnavbar-inner {
    will-change: transform, opacity;
    transition:
      transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
      opacity 200ms ease;
    padding-inline-end: var(--split-right-w, 0px);
  }

  /* Konsta's --shadow-ios-light-glass includes a heavy 25px outer shadow
     designed for navbar-scale surfaces. Inside the subnavbar it creates a
     visible dark blob beneath the segmented control in light themes.
     Strip the outer shadow, keep only the inset highlights. */
  .shell-subnavbar-inner :global(.glass) {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.5),
      inset 0 0 0 0.5px rgba(255, 255, 255, 0.15) !important;
  }

  /* Material: solid elevated surface instead of iOS glass blur. */
  :global(.k-material) .shell-subnavbar-inner {
    background: var(--paper);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .shell-subnavbar--hidden .shell-subnavbar-inner {
    transform: translateY(calc(-1 * var(--subnavbar-h)));
    opacity: 0;
    pointer-events: none;
  }

  .shell-subnavbar--split > .shell-subnavbar-inner {
    padding-inline-end: var(--split-right-w, var(--split-detail-width, 480px));
  }

  .split-subnavbar-right {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    border-inline-start: 1px solid var(--hair, var(--divider));
  }

  @media (prefers-contrast: more) {
    .shell-subnavbar-inner {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      mask-image: none !important;
      -webkit-mask-image: none !important;
      background: Canvas !important;
      color: CanvasText !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .shell-subnavbar-inner {
      transition: none;
    }
  }
</style>
