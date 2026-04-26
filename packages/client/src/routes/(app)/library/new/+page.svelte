<!--
  New KB article route.

  Full-page editor for creating a new article. Route page owns the
  shell: navbar (Cancel / New Article / Publish), subnavbar (EditorToolbar
  with scroll collapse), and pull-to-refresh suppression. ArticleEditor
  populates the EditorBridge with toolbar state and save callback.
-->
<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { Link, Preloader, DialogButton } from "konsta/svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import {
    ChevronLeft,
    Save,
    Undo2,
    Redo2,
    Accessibility,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { kbKeys } from "$lib/query/keys.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import {
    getNavbarOverrideCtx,
    getTabbarOverrideCtx,
    getScrollContainer,
  } from "$lib/shell/context.js";
  import { useScrollDirection } from "$lib/shell/use-scroll-direction.svelte.js";
  import { usePTR } from "$lib/shell/ptr-context.svelte.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import type { SerializedBuffer } from "$lib/utils/buffer-encoding.js";
  import { createEditorBridge } from "$lib/editor/editor-bridge.svelte.js";
  import { useNavigationGuard } from "$lib/editor/use-navigation-guard.svelte.js";
  import EditorToolbar from "$lib/components/library/EditorToolbar.svelte";
  import ArticleEditor from "$lib/components/library/ArticleEditor.svelte";

  if (!trpc.kb) throw new RouterNotAvailableError("kb");
  const kbRouter = trpc.kb;
  const orgCache = getOrgDecryptCache();
  const queryClient = useQueryClient();
  const navbarCtx = getNavbarOverrideCtx();
  const tabbarOverride = getTabbarOverrideCtx();
  const ptr = usePTR();

  // Disable PTR on editor pages (conflicts with contenteditable scrolling)
  ptr.setEnabled(false);

  // Scroll direction for subnavbar collapse/reveal
  const getScroll = getScrollContainer();
  const scrollEl = $derived(getScroll());
  const scrollDir = useScrollDirection({
    get scrollEl() {
      return scrollEl;
    },
  });

  // ── Bridge (ArticleEditor populates, route page reads) ──

  let bridge = createEditorBridge();

  const guard = useNavigationGuard({
    isDirty: () => bridge.dirty,
    fallbackUrl: resolve("/library"),
    onLeave: () => ptr.setEnabled(true),
  });

  // Note: we intentionally do NOT set tabbarHidden when the editor is
  // focused. tabbarHidden sets overflow:hidden on <main>, which prevents
  // scrolling through the article content. On iOS Safari the tabbar
  // (position:fixed bottom:0) is already behind the keyboard since the
  // layout viewport does not shrink. The keyboard-docked toolbar sits
  // above the keyboard via the visualViewport-based positioning.

  // ── Categories for the selector ──

  const categoriesQuery = createQuery(() => ({
    queryKey: kbKeys.categories(),
    queryFn: async () => kbRouter.listCategories.query(),
  }));

  const categoryOptions = $derived(
    (categoriesQuery.data ?? []).map((c) => ({
      id: c.id,
      name: orgCache.decrypt(
        `kb-cat:${c.id}`,
        c.encryptedName as SerializedBuffer,
      ),
    })),
  );

  // ── Navigation ──

  function handleSaved(): void {
    guard.allowNavigation();
    void queryClient.invalidateQueries({ queryKey: kbKeys.items() });
    void goto(resolve("/library"));
  }

  function handleCancel(): void {
    void goto(resolve("/library"));
  }

  // ── Navbar override (shell owns toolbar and save button) ──

  $effect(() => {
    try {
      navbarCtx.current = {
        left: navLeft,
        title: "New Article",
        right: navRight,
        subnavbar: editorSubnavbar,
        subnavbarHidden: () => scrollDir.hidden && !bridge.editorFocused,
        searchHidden: true,
      };
    } catch (err: unknown) {
      console.error("[new page] navbar override failed", err);
    }
    return () => {
      navbarCtx.current = undefined;
      ptr.setEnabled(true);
    };
  });

  $effect(() => {
    tabbarOverride.current = {
      right: a11yTabbarRight,
      ariaLabel: m.library_editor_toolbar(),
    };
    return () => {
      tabbarOverride.current = undefined;
    };
  });
</script>

{#snippet navLeft()}
  <Link
    iconOnly
    onclick={handleCancel}
    role="button"
    aria-label={m.common_cancel()}
  >
    <ChevronLeft size={22} aria-hidden="true" />
  </Link>
  <Link
    iconOnly
    onclick={() => bridge.dispatchCommand?.({ kind: "undo" })}
    role="button"
    aria-label={m.library_editor_undo()}
    class={bridge.toolbarState?.canUndo === true
      ? ""
      : "opacity-40 pointer-events-none"}
  >
    <Undo2 size={22} aria-hidden="true" />
  </Link>
{/snippet}

{#snippet navRight()}
  <Link
    iconOnly
    onclick={() => bridge.dispatchCommand?.({ kind: "redo" })}
    role="button"
    aria-label={m.library_editor_redo()}
    class={bridge.toolbarState?.canRedo === true
      ? ""
      : "opacity-40 pointer-events-none"}
  >
    <Redo2 size={22} aria-hidden="true" />
  </Link>
  <Link
    iconOnly
    onclick={() => void bridge.save?.()}
    role="button"
    aria-label={m.library_publish()}
    class={bridge.canPublish ? "" : "opacity-40 pointer-events-none"}
  >
    {#if bridge.saving}
      <Preloader class="w-4 h-4" />
    {:else}
      <Save size={22} aria-hidden="true" />
    {/if}
  </Link>
{/snippet}

{#snippet editorSubnavbar()}
  {#if !bridge.editorFocused}
    {#if bridge.toolbarState !== null && bridge.dispatchCommand !== null}
      <EditorToolbar
        toolbarState={bridge.toolbarState}
        oncommand={bridge.dispatchCommand}
      />
    {/if}
  {/if}
{/snippet}

{#snippet a11yTabbarRight()}
  <Link
    iconOnly
    onclick={() => bridge.setA11yVisible?.(!bridge.a11yVisible)}
    role="button"
    aria-label={bridge.a11yVisible
      ? m.library_a11y_toggle_off()
      : m.library_a11y_toggle_on()}
    aria-pressed={bridge.a11yVisible}
    class="relative"
  >
    <Accessibility size={24} aria-hidden="true" />
    {#if bridge.a11yIssueCount > 0}
      <span class="a11y-badge">{bridge.a11yIssueCount}</span>
    {/if}
  </Link>
{/snippet}

<ArticleEditor categories={categoryOptions} {bridge} onsave={handleSaved} />

<!-- Keyboard-docked toolbar. onmousedown preventDefault keeps focus in the
     contenteditable so the iOS keyboard does not dismiss when tapping
     toolbar buttons. Standard rich-text-editor pattern (ProseMirror menu). -->
{#if bridge.editorFocused && bridge.toolbarState !== null && bridge.dispatchCommand !== null}
  <div class="toolbar-keyboard">
    <EditorToolbar
      toolbarState={bridge.toolbarState}
      oncommand={bridge.dispatchCommand}
    />
  </div>
{/if}

<ShellDialog
  opened={guard.discardDialogOpen}
  ondismiss={() => guard.dismiss()}
  title={m.library_discard_title()}
>
  {#snippet content()}
    {m.library_discard_body()}
  {/snippet}
  {#snippet buttons()}
    <DialogButton onclick={() => guard.dismiss()}>
      {m.common_cancel()}
    </DialogButton>
    <DialogButton strong onclick={() => guard.confirmDiscard()}>
      {m.library_discard_confirm()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<style>
  /* Keyboard-docked toolbar: docked above the software keyboard on iOS
     Safari. Uses visualViewport API positioning (see edit page for full
     explanation). EditorToolbar handles its own 2-row layout and scroll. */
  .toolbar-keyboard {
    position: fixed;
    left: 0;
    right: 0;
    top: calc(var(--vv-offset-top, 0px) + var(--app-height, 100dvh));
    transform: translateY(-100%);
    z-index: 500;
    border-top: 1px solid var(--divider);
  }

  /* iOS: translucent glass above keyboard */
  :global(.k-ios) .toolbar-keyboard {
    background: color-mix(in srgb, var(--paper) 50%, transparent);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    -webkit-mask-image: linear-gradient(to bottom, black 90%, transparent);
    mask-image: linear-gradient(to bottom, black 90%, transparent);
  }

  /* Material: solid surface above keyboard */
  :global(.k-material) .toolbar-keyboard {
    background: var(--paper);
    box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.1);
  }

  /* On desktop (hover-capable devices), keep toolbar in subnavbar only */
  @media (hover: hover) {
    .toolbar-keyboard {
      display: none;
    }
  }

  .a11y-badge {
    position: absolute;
    top: 0;
    right: 0;
    min-width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--brand-accent);
    color: white;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 3px;
    pointer-events: none;
    line-height: 1;
  }
</style>
