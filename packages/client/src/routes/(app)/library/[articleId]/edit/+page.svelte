<!--
  Edit KB article route.

  Loads an existing article via trpc.kb.getItem, decrypts title and body,
  and passes both to ArticleEditor in edit mode. Route page owns the
  shell: navbar (Cancel / Edit Article / Save), subnavbar (EditorToolbar
  with scroll collapse and the a11y checker toggle), and PTR suppression.
-->
<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { page } from "$app/state";
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
  import { getOrgDecryptCache, getOrgKeyManager } from "$lib/crypto/context.js";
  import {
    getNavbarOverrideCtx,
    getScrollContainer,
  } from "$lib/shell/context.js";
  import { useScrollDirection } from "$lib/shell/use-scroll-direction.svelte.js";
  import { usePTR } from "$lib/shell/ptr-context.svelte.js";
  import { requireRouter } from "$lib/errors.js";
  import { createEditorBridge } from "$lib/editor/editor-bridge.svelte.js";
  import { useNavigationGuard } from "$lib/editor/use-navigation-guard.svelte.js";
  import { shellBack } from "$lib/shell/navigation.js";
  import EditorToolbar from "$lib/components/library/EditorToolbar.svelte";
  import ArticleEditor from "$lib/components/library/ArticleEditor.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import QueryError from "$lib/components/QueryError.svelte";

  const kbRouter = requireRouter(trpc.kb, "kb");
  const orgCache = getOrgDecryptCache();
  const orgKeyManager = getOrgKeyManager();
  const queryClient = useQueryClient();
  const navbarCtx = getNavbarOverrideCtx();
  const ptr = usePTR();

  ptr.setEnabled(false);

  const articleId = $derived(page.params.articleId ?? "");

  // Scroll direction for subnavbar collapse/reveal
  const getScroll = getScrollContainer();
  const scrollEl = $derived(getScroll());
  const scrollDir = useScrollDirection({
    get scrollEl() {
      return scrollEl;
    },
  });

  // ── Bridge ──

  let bridge = createEditorBridge();

  const guard = useNavigationGuard({
    isDirty: () => bridge.dirty,
    get fallbackUrl() {
      return resolve(`/library/${articleId}`);
    },
    onLeave: () => ptr.setEnabled(true),
  });

  // Note: we intentionally do NOT set tabbarHidden when the editor is
  // focused. tabbarHidden sets overflow:hidden on <main>, which prevents
  // scrolling through the article content. On iOS Safari the tabbar
  // (position:fixed bottom:0) is already behind the keyboard since the
  // layout viewport does not shrink. The keyboard-docked toolbar sits
  // above the keyboard via the visualViewport-based positioning.

  // ── Load article ──

  const articleQuery = createQuery(() => ({
    queryKey: kbKeys.item(articleId),
    queryFn: async () => kbRouter.getItem.query({ itemId: articleId }),
    enabled: articleId !== "",
  }));

  const article = $derived(articleQuery.data);

  // ── Decrypt title and body (async Worker) ──

  let decryptedTitle: string | null = $state(null);
  let decryptedBody: unknown = $state(null);
  let decryptAttempted = $state(false);
  let editDecryptVersion = 0;

  $effect(() => {
    if (article == null || !orgKeyManager.isLoaded) {
      decryptedTitle = null;
      decryptedBody = null;
      decryptAttempted = false;
      return;
    }

    const titleCt =
      article.encryptedTitle instanceof Uint8Array
        ? article.encryptedTitle
        : new Uint8Array(article.encryptedTitle.data);
    const bodyCt =
      article.encryptedBody instanceof Uint8Array
        ? article.encryptedBody
        : new Uint8Array(article.encryptedBody.data);
    const version = ++editDecryptVersion;

    void (async (): Promise<void> => {
      try {
        const [titleBytes, bodyBytes] = await Promise.all([
          orgKeyManager.decrypt(titleCt),
          orgKeyManager.decrypt(bodyCt),
        ]);
        if (version !== editDecryptVersion) return;
        decryptedTitle = new TextDecoder().decode(titleBytes);
        const text = new TextDecoder().decode(bodyBytes);
        decryptedBody = JSON.parse(text) as unknown;
      } catch {
        if (version !== editDecryptVersion) return;
        decryptedTitle = null;
        decryptedBody = null;
      } finally {
        if (version === editDecryptVersion) decryptAttempted = true;
      }
    })();
  });

  const isReady = $derived(
    article != null &&
      decryptAttempted &&
      decryptedTitle !== null &&
      decryptedBody !== null,
  );

  // ── Categories for the selector ──

  const categoriesQuery = createQuery(() => ({
    queryKey: kbKeys.categories(),
    queryFn: async () => kbRouter.listCategories.query(),
  }));

  const categoryOptions = $derived(
    (categoriesQuery.data ?? []).map((c) => ({
      id: c.id,
      name: orgCache.decrypt(`kb-cat:${c.id}`, c.encryptedName),
    })),
  );

  // ── Navigation ──

  function handleSaved(): void {
    guard.allowNavigation();
    void queryClient.invalidateQueries({ queryKey: kbKeys.items() });
    void queryClient.invalidateQueries({
      queryKey: kbKeys.item(articleId),
    });
    shellBack(`/library/${articleId}`);
  }

  function handleCancel(): void {
    shellBack(`/library/${articleId}`);
  }

  // ── Navbar override ──

  $effect(() => {
    navbarCtx.current = {
      left: navLeft,
      title: m.library_edit_article_title(),
      right: navRight,
      subnavbar: editorSubnavbar,
      subnavbarHidden: () => scrollDir.hidden && !bridge.editorFocused,
      searchHidden: true,
    };
    return () => {
      navbarCtx.current = undefined;
      ptr.setEnabled(true);
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
    aria-label={m.common_save()}
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
    <div class="subnav-row">
      {#if bridge.toolbarState !== null && bridge.dispatchCommand !== null}
        <div class="subnav-toolbar">
          <EditorToolbar
            toolbarState={bridge.toolbarState}
            oncommand={bridge.dispatchCommand}
          />
        </div>
      {/if}
      <Link
        iconOnly
        onclick={() => bridge.setA11yVisible?.(!bridge.a11yVisible)}
        role="button"
        aria-label={bridge.a11yVisible
          ? m.library_a11y_toggle_off()
          : m.library_a11y_toggle_on()}
        aria-pressed={bridge.a11yVisible}
        class="relative subnav-a11y"
      >
        <Accessibility size={22} aria-hidden="true" />
        {#if bridge.a11yIssueCount > 0}
          <span class="a11y-badge">{bridge.a11yIssueCount}</span>
        {/if}
      </Link>
    </div>
  {/if}
{/snippet}

{#if articleQuery.isLoading || !isReady}
  <div class="edit-loading">
    <DecryptPlaceholder block length={200} />
  </div>
{:else if articleQuery.isError}
  <QueryError error={articleQuery.error} />
{:else if article != null && decryptedTitle !== null && decryptedBody !== null}
  <ArticleEditor
    existingArticle={{
      id: articleId,
      categoryId: article.categoryId,
      decryptedTitle,
      decryptedBody,
    }}
    categories={categoryOptions}
    {bridge}
    onsave={handleSaved}
  />
{/if}

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
     Safari. Safari does NOT support interactive-widget=resizes-content,
     so position:fixed bottom:0 lands behind the keyboard. Instead we
     use the visualViewport API (via keyboard-viewport.ts) which syncs
     --app-height and --vv-offset-top as CSS custom properties.

     top = vv.offsetTop + vv.height puts the element's top edge at the
     bottom of the visible area. translateY(-100%) shifts it up by its
     own height, so its bottom edge sits at the keyboard's top edge.

     The EditorToolbar component handles its own 2-row layout and
     horizontal scroll internally. */
  .toolbar-keyboard {
    position: fixed;
    left: 0;
    right: 0;
    top: calc(var(--vv-offset-top, 0px) + var(--app-height, 100dvh));
    transform: translateY(-100%);
    z-index: 500;
    border-top: 1px solid var(--hair, var(--divider));
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

  @media (hover: hover) {
    .toolbar-keyboard {
      display: none;
    }
  }

  .edit-loading {
    padding: var(--space-lg) var(--page-pad-x);
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

  /* Subnavbar row: the toolbar scroller flexes; min-width 0 lets it
     shrink so the a11y toggle stays pinned at the right edge. */
  .subnav-row {
    display: flex;
    align-items: center;
  }

  .subnav-toolbar {
    flex: 1;
    min-width: 0;
  }

  .subnav-row > :global(.subnav-a11y) {
    flex-shrink: 0;
    margin-inline-start: auto;
    margin-inline-end: var(--page-pad-x, 0.75rem);
  }
</style>
