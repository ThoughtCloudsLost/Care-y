<!--
  Shared shell that owns Konsta Page, Navbar height measurement, and the
  blur-through scroll container. AppShell and the onboarding layout both
  use this instead of duplicating the negative-margin pull-up trick.

  The global .k-page override (overflow:hidden, flex column) makes Page a
  non-scrolling flex frame. The scroll container inside it uses a negative
  margin-top equal to the Navbar height so content is painted behind the
  Navbar. padding-top compensates so visible content starts below it. This
  lets the Navbar's iOS Glass backdrop-filter blur scrolling content.
-->
<script lang="ts">
  import { Page } from "konsta/svelte";
  import type { Snippet } from "svelte";

  interface Props {
    navbar: Snippet;
    children: Snippet;
    beforeScroll?: Snippet;
    afterScroll?: Snippet;
    scrollClass?: string;
    scrollTag?: "div" | "main";
    scrollAttrs?: Record<string, unknown>;
    onNavbarHeight?: (height: number) => void;
    bindScrollEl?: (el: HTMLElement | undefined) => void;
  }

  let {
    navbar,
    children,
    beforeScroll,
    afterScroll,
    scrollClass = "",
    scrollTag = "div",
    scrollAttrs = {},
    onNavbarHeight,
    bindScrollEl,
  }: Props = $props();

  let navbarHeight = $state(0);
  let scrollEl = $state<HTMLElement | undefined>();

  $effect(() => {
    bindScrollEl?.(scrollEl);
  });

  $effect(() => {
    if (!scrollEl) return;
    const pageEl = scrollEl.closest(".k-page");
    const navbarEl = pageEl?.querySelector<HTMLElement>(":scope > .k-navbar");
    if (!navbarEl) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry != null) {
        const h = entry.borderBoxSize[0]?.blockSize ?? navbarEl.offsetHeight;
        navbarHeight = h;
        onNavbarHeight?.(h);
      }
    });
    ro.observe(navbarEl, { box: "border-box" });
    return () => ro.disconnect();
  });
</script>

<Page>
  {@render navbar()}
  {@render beforeScroll?.()}
  <svelte:element
    this={scrollTag}
    bind:this={scrollEl}
    {...scrollAttrs}
    class="page-shell-scroll {scrollClass}"
    style:--navbar-h="{navbarHeight}px"
  >
    {@render children()}
  </svelte:element>
  {@render afterScroll?.()}
</Page>

<style>
  .page-shell-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    margin-top: calc(-1 * var(--navbar-h, 0px));
    padding-top: var(--navbar-h, 0px);
  }
</style>
