<!--
  KB article editor content component.

  Owns ProseMirror state, crypto, upload, preview, and dialogs.
  Does NOT render the toolbar or save button (shell concerns).
  Populates an EditorBridge so the route page can render those
  in the navbar and subnavbar slots.
-->
<script lang="ts">
  import { Node as PMNode } from "prosemirror-model";
  import { setBlockType, toggleMark, wrapIn, lift } from "prosemirror-commands";
  import { wrapInList, liftListItem } from "prosemirror-schema-list";
  import { undo, redo } from "prosemirror-history";
  import {
    Button as KButton,
    Preloader,
    ListInput,
    List as KList,
    ListItem,
  } from "konsta/svelte";
  import { Check } from "@lucide/svelte";
  import Register from "$lib/components/Register.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import {
    kbArticleSchema,
    kbEditorPlugins,
  } from "$lib/editor/prosemirror-schema.js";
  import { useProseMirror } from "$lib/editor/use-prosemirror.svelte.js";
  import {
    deriveToolbarState,
    blockTypeActive,
    type ToolbarCommand,
  } from "$lib/editor/toolbar-state.js";
  import { headingHierarchyPlugin } from "$lib/editor/plugins/heading-hierarchy.js";
  import { linkTextLintPlugin } from "$lib/editor/plugins/link-text-lint.js";
  import {
    atagDecorationsPlugin,
    atagDecorationsKey,
    setAtagActive,
  } from "$lib/editor/plugins/atag-decorations.js";
  import {
    createImageNodeView,
    type ImageViewDeps,
  } from "$lib/editor/node-views/image-view.js";
  import { fetchBlob } from "$lib/utils/fetch-blob.js";
  import { extractExcerpt } from "$lib/utils/render-article.js";
  import type { EditorBridge } from "$lib/editor/editor-bridge.svelte.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import ShellPopover from "$lib/shell/ShellPopover.svelte";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { isGenericLinkText } from "$lib/editor/atag-checks.js";
  import {
    KB_ATTACHMENT_MAX_BYTES,
    KB_ALLOWED_CONTENT_TYPES,
    type KbAllowedContentType,
  } from "@care-y/shared";
  import { uint8ArrayToBase64 } from "$lib/utils/buffer-encoding.js";
  import { untrack } from "svelte";
  import { SvelteMap } from "svelte/reactivity";

  interface CategoryOption {
    id: string;
    name: string | null;
  }

  interface ExistingArticle {
    id: string;
    categoryId: string;
    decryptedTitle: string;
    decryptedBody: unknown;
  }

  interface Props {
    existingArticle?: ExistingArticle;
    categories: CategoryOption[];
    bridge: EditorBridge;
    onsave: () => void;
  }

  let { existingArticle, categories, bridge, onsave }: Props = $props();

  const kbRouter = requireRouter(trpc.kb, "kb");
  const orgKeyManager = getOrgKeyManager();

  const isEditMode = $derived(existingArticle !== undefined);

  /** Type guard: checks that a string is one of the allowed content types. */
  function isAllowedContentType(type: string): type is KbAllowedContentType {
    return (KB_ALLOWED_CONTENT_TYPES as readonly string[]).includes(type);
  }

  // ── State ──

  // One-time seed from props (untrack prevents state_referenced_locally warning)
  const initialTitle = untrack(() => existingArticle?.decryptedTitle ?? "");
  const initialCategoryId = untrack(() => existingArticle?.categoryId ?? "");

  let title = $state(initialTitle);
  let selectedCategoryId = $state(initialCategoryId);
  let categorySelectorOpen = $state(false);
  let categoryAnchorEl = $state<HTMLElement | undefined>(undefined);
  let a11yVisible = $state(false);
  let saving = $state(false);
  let uploading = $state(false);

  // Link sheet state
  let linkSheetOpen = $state(false);
  let linkUrl = $state("");
  let linkText = $state("");

  // Alt text dialog state
  let altDialogOpen = $state(false);
  let altText = $state("");
  let altDecorative = $state(false);
  let pendingImageFile: File | null = null;

  // Max body size: 500KB pre-encryption
  const MAX_BODY_BYTES = 500 * 1024;

  // Pending image uploads for new articles (no article ID yet).
  // Keyed by the temporary blob: URL inserted into the doc.
  // On save, these are uploaded after article creation, then the
  // doc's blob: URLs are replaced with kb-attachment:// URIs.
  interface PendingUpload {
    plainBytes: Uint8Array;
    contentType: string;
    filename: string;
  }
  const pendingUploads = new SvelteMap<string, PendingUpload>();

  // ── Suppress iOS Safari auto-zoom on contenteditable focus ──
  // Temporarily sets maximum-scale=1 while the editor is mounted.
  // Restored on unmount so pinch-to-zoom works on other pages.
  // Disabling meta-viewport zoom conflicts with WCAG 1.4.4 (resize text),
  // but is accepted here because iOS Safari's auto-zoom on contenteditable
  // is disorienting and breaks the keyboard-docked toolbar positioning.
  $effect(() => {
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="viewport"]',
    );
    if (meta === null) return;
    const original = meta.getAttribute("content") ?? "";
    meta.setAttribute(
      "content",
      original.replace(/maximum-scale=\d+/, "maximum-scale=1"),
    );
    return () => {
      meta.setAttribute("content", original);
    };
  });

  // ── Editor mount ──

  let editorMountEl = $state<HTMLElement | null>(null);

  // Parse existing article body into a ProseMirror doc (one-time, not reactive)
  const initialDoc = untrack((): PMNode | undefined => {
    const body = existingArticle?.decryptedBody;
    if (body == null) return undefined;
    try {
      return PMNode.fromJSON(kbArticleSchema, body);
    } catch {
      return undefined;
    }
  });

  // Image NodeView dependencies
  const imageViewDeps: ImageViewDeps = {
    downloadBlob: async (attachmentId) =>
      fetchBlob(`/api/blobs/kb-attachments/${attachmentId}`),
    orgKeyManager,
  };

  const allPlugins = [
    ...kbEditorPlugins,
    headingHierarchyPlugin(),
    linkTextLintPlugin(),
    atagDecorationsPlugin(),
  ];

  const editor = useProseMirror(() => editorMountEl, {
    schema: kbArticleSchema,
    plugins: allPlugins,
    doc: initialDoc,
    nodeViews: {
      image: createImageNodeView(imageViewDeps),
    },
  });

  // ── Content checks ──

  const canPublish = $derived(
    title.trim().length > 0 && selectedCategoryId !== "" && !saving,
  );

  const dirty = $derived(
    title !== initialTitle ||
      selectedCategoryId !== initialCategoryId ||
      (editor.state !== null &&
        (initialDoc !== undefined
          ? !editor.state.doc.eq(initialDoc)
          : editor.state.doc.content.size > 2)),
  );

  // ── Bridge population (route page reads these for navbar/subnavbar) ──

  $effect(() => {
    bridge.toolbarState =
      editor.state !== null ? deriveToolbarState(editor.state) : null;
    bridge.dispatchCommand = handleToolbarCommand;
    bridge.save = handleSave;
    bridge.saving = saving;
    bridge.canPublish = canPublish;
    bridge.a11yVisible = a11yVisible;
    bridge.setA11yVisible = toggleA11yDecorations;
    // Live issue count from the plugin state
    const pluginState =
      editor.state !== null ? atagDecorationsKey.getState(editor.state) : null;
    bridge.a11yIssueCount = pluginState?.warnings.length ?? 0;
    bridge.dirty = dirty;
  });

  // ── Track editor focus (bridge.editorFocused reveals toolbar) ──
  //
  // focusout fires transiently during scroll gestures on iOS Safari and
  // when the user taps a toolbar button (focus moves to the button then
  // back). Without debouncing, this causes the keyboard toolbar to
  // flicker off, the subnavbar toolbar to flash in, and the tabbar-hidden
  // class to toggle, which re-enables page scroll and lets the absolutely
  // positioned subnavbar drift with the scroll position. The 150ms delay
  // on focusout prevents this: if focus returns within that window (as it
  // does for scroll gestures and toolbar taps), the state never changes.

  $effect(() => {
    const el = editorMountEl;
    if (el === null) return;
    let focusOutTimer = 0;
    let subnavRevealTimer = 0;
    let vvCleanup: (() => void) | null = null;

    /** Scroll #main-content so the cursor clears the keyboard toolbar. */
    function scrollCursorClearOfToolbar(): void {
      const view = editor.view;
      if (view === null) return;
      const coords = view.coordsAtPos(view.state.selection.head);
      const kbToolbar =
        document.querySelector<HTMLElement>(".toolbar-keyboard");
      if (kbToolbar === null) return;
      const kbToolbarTop = kbToolbar.getBoundingClientRect().top;
      if (coords.bottom > kbToolbarTop) {
        const main = document.getElementById("main-content");
        if (main !== null) {
          main.scrollBy({
            top: coords.bottom - kbToolbarTop + 16,
            behavior: "smooth",
          });
        }
      }
    }

    function onFocusIn(): void {
      // Cancel any pending focusout so the state stays stable.
      clearTimeout(focusOutTimer);

      const wasHidden = !bridge.editorFocused;
      bridge.editorFocused = true;

      // The subnavbar is position:absolute and covers content below
      // the navbar. If it was hidden when the user tapped, it reveals
      // on focus and may obscure the cursor. After the 300ms reveal
      // animation, check whether the cursor is behind the subnavbar
      // and scroll the main content container to clear it.
      if (wasHidden && editor.view !== null) {
        subnavRevealTimer = window.setTimeout(() => {
          // Re-read the view: useProseMirror nulls it on destroy, and a
          // navigation (a save, for instance) can unmount the editor inside
          // this delay. A captured reference would still point at the
          // destroyed view, whose docView is null.
          const view = editor.view;
          if (view === null) return;
          const coords = view.coordsAtPos(view.state.selection.head);
          const subnavbar = document.querySelector<HTMLElement>(
            ".shell-subnavbar-inner",
          );
          if (subnavbar === null) return;
          const toolbarBottom = subnavbar.getBoundingClientRect().bottom;
          if (coords.top < toolbarBottom) {
            const main = document.getElementById("main-content");
            if (main !== null) {
              main.scrollBy({
                top: coords.top - toolbarBottom - 16,
                behavior: "smooth",
              });
            }
          }
        }, 350);

        // The keyboard toolbar scroll check can't use a fixed timeout
        // because the iOS keyboard animation length varies. Instead,
        // wait for the visualViewport to stop resizing (keyboard fully
        // open), then check once.
        const vv = window.visualViewport;
        if (vv) {
          const viewport = vv;
          let settleTimer = 0;
          function onVVResize(): void {
            clearTimeout(settleTimer);
            settleTimer = window.setTimeout(() => {
              cleanupVV();
              scrollCursorClearOfToolbar();
            }, 200);
          }
          function cleanupVV(): void {
            clearTimeout(settleTimer);
            viewport.removeEventListener("resize", onVVResize);
            if (vvCleanup === cleanupVV) vvCleanup = null;
          }
          vvCleanup = cleanupVV;
          viewport.addEventListener("resize", onVVResize);
        }
      }
    }

    /** Tap while keyboard is already open: cursor may land behind toolbar. */
    function onEditorClick(): void {
      if (!document.documentElement.classList.contains("keyboard-open")) return;
      // One rAF for the browser to finalize cursor position after tap.
      requestAnimationFrame(scrollCursorClearOfToolbar);
    }

    function onFocusOut(): void {
      // Debounce: iOS Safari fires focusout transiently during scroll
      // and when tapping toolbar buttons. Wait 150ms to see if focus
      // returns before tearing down the keyboard toolbar state.
      clearTimeout(focusOutTimer);
      focusOutTimer = window.setTimeout(() => {
        // Only clear if focus truly left the editor area. Also keep
        // focused state if the active element is inside the keyboard
        // toolbar (the user tapped a formatting button).
        const active = document.activeElement;
        const inEditor = el?.contains(active) === true;
        const inToolbar =
          active !== null && active.closest(".toolbar-keyboard") !== null;
        if (!inEditor && !inToolbar) {
          bridge.editorFocused = false;
        }
      }, 150);
    }
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    el.addEventListener("click", onEditorClick);
    return () => {
      clearTimeout(focusOutTimer);
      clearTimeout(subnavRevealTimer);
      vvCleanup?.();
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
      el.removeEventListener("click", onEditorClick);
    };
  });

  // ── A11y decoration toggle ──
  // Dispatching inside $effect causes a reactivity loop (dispatch
  // updates editor.state, which re-triggers the effect). Instead,
  // dispatch imperatively from the setA11yVisible callback.

  function toggleA11yDecorations(visible: boolean): void {
    a11yVisible = visible;
    const view = editor.view;
    if (view === null) return;
    const tr = view.state.tr.setMeta(setAtagActive, visible);
    view.dispatch(tr);
    // Announce for screen readers
    const pluginState = atagDecorationsKey.getState(view.state);
    const count = pluginState?.warnings.length ?? 0;
    const msg = visible
      ? count > 0
        ? m.library_a11y_issues_found({ count: String(count) })
        : m.library_a11y_no_issues()
      : m.library_a11y_toggle_off();
    announceToLiveRegion("polite", msg);
  }

  // ── Toolbar command dispatch ──

  function handleToolbarCommand(cmd: ToolbarCommand): void {
    const view = editor.view;
    if (view === null) return;

    const { state, dispatch } = view;

    switch (cmd.kind) {
      case "toggleBold":
        if (kbArticleSchema.marks.strong)
          toggleMark(kbArticleSchema.marks.strong)(state, dispatch);
        break;
      case "toggleItalic":
        if (kbArticleSchema.marks.em)
          toggleMark(kbArticleSchema.marks.em)(state, dispatch);
        break;
      case "toggleStrikethrough":
        if (kbArticleSchema.marks.strikethrough)
          toggleMark(kbArticleSchema.marks.strikethrough)(state, dispatch);
        break;
      case "toggleCode":
        if (kbArticleSchema.marks.code)
          toggleMark(kbArticleSchema.marks.code)(state, dispatch);
        break;
      case "toggleLink":
        openLinkSheet();
        break;
      case "wrapInBulletList":
        if (kbArticleSchema.nodes.bullet_list) {
          if (
            blockTypeActive(state, kbArticleSchema.nodes.bullet_list) &&
            kbArticleSchema.nodes.list_item
          ) {
            liftListItem(kbArticleSchema.nodes.list_item)(state, dispatch);
          } else {
            wrapInList(kbArticleSchema.nodes.bullet_list)(state, dispatch);
          }
        }
        break;
      case "wrapInOrderedList":
        if (kbArticleSchema.nodes.ordered_list) {
          if (
            blockTypeActive(state, kbArticleSchema.nodes.ordered_list) &&
            kbArticleSchema.nodes.list_item
          ) {
            liftListItem(kbArticleSchema.nodes.list_item)(state, dispatch);
          } else {
            wrapInList(kbArticleSchema.nodes.ordered_list)(state, dispatch);
          }
        }
        break;
      case "wrapInBlockquote":
        if (kbArticleSchema.nodes.blockquote) {
          if (blockTypeActive(state, kbArticleSchema.nodes.blockquote)) {
            lift(state, dispatch);
          } else {
            wrapIn(kbArticleSchema.nodes.blockquote)(state, dispatch);
          }
        }
        break;
      case "setCodeBlock":
        {
          const codeBlock = kbArticleSchema.nodes.code_block;
          const para = kbArticleSchema.nodes.paragraph;
          if (codeBlock && para) {
            if (blockTypeActive(state, codeBlock)) {
              setBlockType(para)(state, dispatch);
            } else {
              setBlockType(codeBlock)(state, dispatch);
            }
          }
        }
        break;
      case "setParagraph":
        if (kbArticleSchema.nodes.paragraph)
          setBlockType(kbArticleSchema.nodes.paragraph)(state, dispatch);
        break;
      case "setHeading":
        if (kbArticleSchema.nodes.heading)
          setBlockType(kbArticleSchema.nodes.heading, {
            level: cmd.level,
          })(state, dispatch);
        break;
      case "insertImage":
        triggerImageUpload();
        break;
      case "attachFile":
        triggerFileAttach();
        break;
      case "insertTable":
        insertTable();
        break;
      case "insertHorizontalRule":
        insertHorizontalRule();
        break;
      case "undo":
        undo(state, dispatch);
        break;
      case "redo":
        redo(state, dispatch);
        break;
    }

    view.focus();
  }

  // ── Link insert/edit ──

  function openLinkSheet(): void {
    const view = editor.view;
    if (view === null) return;

    // Pre-fill from selection if link mark is active
    const { from, to, empty } = view.state.selection;
    const linkType = kbArticleSchema.marks.link;
    if (linkType === undefined) return;

    if (!empty) {
      linkText = view.state.doc.textBetween(from, to);
      // Check if the selection has a link mark
      const marks =
        view.state.storedMarks ?? view.state.selection.$from.marks();
      const existingLink = marks.find((mark) => mark.type === linkType);
      if (existingLink) {
        linkUrl =
          typeof existingLink.attrs.href === "string"
            ? existingLink.attrs.href
            : "";
      }
    } else {
      linkText = "";
      linkUrl = "";
    }

    linkSheetOpen = true;
  }

  function applyLink(): void {
    const view = editor.view;
    if (view === null || linkUrl.trim() === "") return;

    const linkType = kbArticleSchema.marks.link;
    if (linkType === undefined) return;

    const { from, to, empty } = view.state.selection;
    const tr = view.state.tr;

    if (empty && linkText.trim() !== "") {
      // Insert new text with link mark
      const mark = linkType.create({ href: linkUrl });
      const textNode = kbArticleSchema.text(linkText, [mark]);
      tr.replaceSelectionWith(textNode, false);
    } else if (!empty) {
      // Apply link mark to selection
      tr.addMark(from, to, linkType.create({ href: linkUrl }));
    }

    view.dispatch(tr);
    linkSheetOpen = false;
    linkUrl = "";
    linkText = "";
    view.focus();
  }

  const linkTextIsGeneric = $derived(isGenericLinkText(linkText));

  // ── Image upload ──

  let imageInputEl: HTMLInputElement | undefined;
  let fileInputEl: HTMLInputElement | undefined;

  function triggerImageUpload(): void {
    imageInputEl?.click();
  }

  function triggerFileAttach(): void {
    fileInputEl?.click();
  }

  function handleImageSelected(e: Event): void {
    if (!(e.target instanceof HTMLInputElement)) return;
    const input = e.target;
    const file = input.files?.[0];
    input.value = "";
    if (file == null) return;

    if (file.size > KB_ATTACHMENT_MAX_BYTES) {
      toastStore.show(m.library_file_too_large(), 3000);
      return;
    }

    const imageTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
    if (!imageTypes.includes(file.type)) {
      toastStore.show(m.library_file_type_not_allowed(), 3000);
      return;
    }

    // Prompt for alt text before uploading
    pendingImageFile = file;
    altText = "";
    altDecorative = false;
    altDialogOpen = true;
  }

  async function confirmImageInsert(): Promise<void> {
    altDialogOpen = false;
    const file = pendingImageFile;
    pendingImageFile = null;
    if (file == null || editor.view === null) return;

    const resolvedAlt = altDecorative ? "" : altText.trim();
    await uploadAndInsertImage(file, resolvedAlt);
  }

  async function uploadAndInsertImage(file: File, alt: string): Promise<void> {
    if (uploading || editor.view === null) return;
    uploading = true;

    try {
      const arrayBuf = await file.arrayBuffer();
      const plainBytes = new Uint8Array(arrayBuf);

      // Encrypt with org key
      const encrypted = await orgKeyManager.encrypt(plainBytes);
      const blob = uint8ArrayToBase64(encrypted);

      // We need an article ID for attachments. For new articles, we
      // need to save as draft first. For now, use a placeholder approach:
      // If editing an existing article, upload immediately.
      // If creating new, we need to save the article first, then upload.
      // For the MVP, images on new articles will be uploaded after the first save.
      const articleId = existingArticle?.id;
      if (articleId == null) {
        // For new articles: store image data for upload after article
        // creation. Insert a temporary blob URL for in-editor preview.
        const tempBlob = new Blob([plainBytes], { type: file.type });
        const tempUrl = URL.createObjectURL(tempBlob);
        pendingUploads.set(tempUrl, {
          plainBytes,
          contentType: file.type,
          filename: file.name,
        });
        insertImageNode(tempUrl, alt);
        uploading = false;
        return;
      }

      // Encrypt filename
      const filenameBytes = new TextEncoder().encode(file.name);
      const encryptedFilename = uint8ArrayToBase64(
        await orgKeyManager.encrypt(filenameBytes),
      );

      const result = await kbRouter.uploadAttachment.mutate({
        itemId: articleId,
        blob,
        sizeBytes: encrypted.length,
        encryptedFilename,
        contentType: isAllowedContentType(file.type) ? file.type : "image/png",
      });

      insertImageNode(`kb-attachment://${result.id}`, alt);
      haptic();
    } catch (err: unknown) {
      console.error("[ArticleEditor] Image upload failed", err);
      toastStore.show(m.library_image_upload_failed(), 3000);
    } finally {
      uploading = false;
    }
  }

  function insertImageNode(src: string, alt: string): void {
    const view = editor.view;
    if (view === null) return;

    const imageType = kbArticleSchema.nodes.image;
    if (imageType === undefined) return;

    const imageNode = imageType.create({ src, alt });
    const tr = view.state.tr.replaceSelectionWith(imageNode);
    view.dispatch(tr);
    view.focus();
  }

  // ── File attachment (non-image) ──

  async function handleFileSelected(e: Event): Promise<void> {
    if (!(e.target instanceof HTMLInputElement)) return;
    const input = e.target;
    const file = input.files?.[0];
    input.value = "";
    if (file == null) return;

    if (file.size > KB_ATTACHMENT_MAX_BYTES) {
      toastStore.show(m.library_file_too_large(), 3000);
      return;
    }

    if (!isAllowedContentType(file.type)) {
      toastStore.show(m.library_file_type_not_allowed(), 3000);
      return;
    }

    if (uploading) return;

    const articleId = existingArticle?.id;
    if (articleId == null) {
      toastStore.show(m.library_article_published(), 3000);
      return;
    }

    uploading = true;
    try {
      const arrayBuf = await file.arrayBuffer();
      const plainBytes = new Uint8Array(arrayBuf);
      const encrypted = await orgKeyManager.encrypt(plainBytes);
      const blob = uint8ArrayToBase64(encrypted);

      const filenameBytes = new TextEncoder().encode(file.name);
      const encryptedFilename = uint8ArrayToBase64(
        await orgKeyManager.encrypt(filenameBytes),
      );

      await kbRouter.uploadAttachment.mutate({
        itemId: articleId,
        blob,
        sizeBytes: encrypted.length,
        encryptedFilename,
        contentType: isAllowedContentType(file.type) ? file.type : "image/png",
      });

      haptic();
      toastStore.show(m.library_attachment_uploaded());
    } catch (err: unknown) {
      console.error("[ArticleEditor] File upload failed", err);
      toastStore.show(m.library_attachment_upload_failed(), 3000);
    } finally {
      uploading = false;
    }
  }

  // ── Insert table ──

  function insertTable(): void {
    const view = editor.view;
    if (view === null) return;

    const { table, table_row, table_header, table_cell, paragraph } =
      kbArticleSchema.nodes;
    if (!table || !table_row || !table_header || !table_cell || !paragraph)
      return;

    const emptyParagraph = paragraph.create();
    const headerCells = [
      table_header.create(null, emptyParagraph),
      table_header.create(null, emptyParagraph),
      table_header.create(null, emptyParagraph),
    ];
    const bodyCells = [
      table_cell.create(null, paragraph.create()),
      table_cell.create(null, paragraph.create()),
      table_cell.create(null, paragraph.create()),
    ];

    const headerRow = table_row.create(null, headerCells);
    const bodyRow = table_row.create(null, bodyCells);
    const tableNode = table.create(null, [headerRow, bodyRow]);

    const tr = view.state.tr.replaceSelectionWith(tableNode);
    view.dispatch(tr);
    view.focus();
  }

  // ── Insert horizontal rule ──

  function insertHorizontalRule(): void {
    const view = editor.view;
    if (view === null) return;

    const hrType = kbArticleSchema.nodes.horizontal_rule;
    if (hrType === undefined) return;

    const tr = view.state.tr.replaceSelectionWith(hrType.create());
    view.dispatch(tr);
    view.focus();
  }

  // ── Pending image upload (new articles) ──

  /**
   * Upload all images stored in pendingUploads to the server.
   * Returns a Map of blob URL -> kb-attachment:// URI for doc rewriting.
   */
  async function uploadPendingImages(
    articleId: string,
  ): Promise<SvelteMap<string, string>> {
    const urlMap = new SvelteMap<string, string>();

    for (const [blobUrl, pending] of pendingUploads) {
      try {
        const encrypted = await orgKeyManager.encrypt(pending.plainBytes);
        const blob = uint8ArrayToBase64(encrypted);
        const filenameBytes = new TextEncoder().encode(pending.filename);
        const encryptedFilename = uint8ArrayToBase64(
          await orgKeyManager.encrypt(filenameBytes),
        );

        const result = await kbRouter.uploadAttachment.mutate({
          itemId: articleId,
          blob,
          sizeBytes: encrypted.length,
          encryptedFilename,
          contentType: isAllowedContentType(pending.contentType)
            ? pending.contentType
            : "image/png",
        });

        urlMap.set(blobUrl, `kb-attachment://${result.id}`);
      } catch (err: unknown) {
        console.error("[ArticleEditor] Pending image upload failed", err);
        // Image will remain as dead blob: URL; non-fatal for article save
      }
    }

    pendingUploads.clear();
    return urlMap;
  }

  /** Shape of a ProseMirror JSON node (subset used for URL rewriting). */
  interface PMJsonNode {
    type: string;
    attrs?: Record<string, unknown>;
    content?: PMJsonNode[];
    [key: string]: unknown;
  }

  function isPMJsonNode(v: unknown): v is PMJsonNode {
    if (typeof v !== "object" || v === null || !("type" in v)) return false;
    const record = v as Record<string, unknown>;
    return typeof record.type === "string";
  }

  /**
   * Walk a ProseMirror doc and replace image src attributes that match
   * keys in urlMap. Returns a new doc (immutable transform).
   */
  function replaceBlobUrls(
    doc: PMNode,
    urlMap: SvelteMap<string, string>,
  ): PMNode {
    const json: unknown = doc.toJSON();
    if (!isPMJsonNode(json)) return doc;
    if (json.content) {
      json.content = replaceInContent(json.content, urlMap);
    }
    return PMNode.fromJSON(kbArticleSchema, json);
  }

  function replaceInContent(
    content: PMJsonNode[],
    urlMap: SvelteMap<string, string>,
  ): PMJsonNode[] {
    return content.map((node) => {
      const replaced: PMJsonNode = { ...node };
      if (
        replaced.type === "image" &&
        replaced.attrs != null &&
        typeof replaced.attrs.src === "string"
      ) {
        const src = replaced.attrs.src;
        const mapped = urlMap.get(src);
        if (mapped !== undefined) {
          replaced.attrs = { ...replaced.attrs, src: mapped };
        }
      }
      if (replaced.content) {
        replaced.content = replaceInContent(replaced.content, urlMap);
      }
      return replaced;
    });
  }

  // ── Save/Publish ──

  async function handleSave(): Promise<void> {
    if (saving || editor.state === null) return;

    if (title.trim() === "") {
      toastStore.show(m.library_title_required(), 3000);
      return;
    }
    if (selectedCategoryId === "") {
      toastStore.show(m.library_category_required(), 3000);
      return;
    }

    // Serialize body to JSON
    const bodyJson = JSON.stringify(editor.state.doc.toJSON());
    const bodyBytes = new TextEncoder().encode(bodyJson);

    if (bodyBytes.length > MAX_BODY_BYTES) {
      toastStore.show(m.library_body_too_large(), 3000);
      return;
    }

    saving = true;
    try {
      // Encrypt title
      const titleBytes = new TextEncoder().encode(title.trim());
      const encryptedTitle = uint8ArrayToBase64(
        await orgKeyManager.encrypt(titleBytes),
      );

      if (isEditMode && existingArticle !== undefined) {
        // Edit mode: body is final (images already uploaded with article ID)
        const encryptedBody = uint8ArrayToBase64(
          await orgKeyManager.encrypt(bodyBytes),
        );
        const excerptText = extractExcerpt(editor.state.doc);
        const excerptBytes = new TextEncoder().encode(excerptText);
        const encryptedExcerpt = uint8ArrayToBase64(
          await orgKeyManager.encrypt(excerptBytes),
        );

        await kbRouter.updateItem.mutate({
          itemId: existingArticle.id,
          categoryId: selectedCategoryId,
          encryptedTitle,
          encryptedBody,
          encryptedExcerpt,
        });
        haptic();
        toastStore.show(m.library_article_saved());
        announceToLiveRegion("polite", m.library_article_saved());
      } else {
        // Create mode: first create the article, then upload pending
        // images, then update the body with corrected attachment URIs.
        const encryptedBody = uint8ArrayToBase64(
          await orgKeyManager.encrypt(bodyBytes),
        );
        const excerptText = extractExcerpt(editor.state.doc);
        const excerptBytes = new TextEncoder().encode(excerptText);
        const encryptedExcerpt = uint8ArrayToBase64(
          await orgKeyManager.encrypt(excerptBytes),
        );

        const created = await kbRouter.createItem.mutate({
          categoryId: selectedCategoryId,
          encryptedTitle,
          encryptedBody,
          encryptedExcerpt,
        });

        // Upload pending images and replace blob: URLs in the doc
        if (pendingUploads.size > 0 && editor.view !== null) {
          const urlMap = await uploadPendingImages(created.id);
          if (urlMap.size > 0) {
            const correctedDoc = replaceBlobUrls(editor.state.doc, urlMap);
            const correctedJson = JSON.stringify(correctedDoc.toJSON());
            const correctedBytes = new TextEncoder().encode(correctedJson);
            const correctedExcerpt = extractExcerpt(correctedDoc);
            const correctedExcerptBytes = new TextEncoder().encode(
              correctedExcerpt,
            );

            await kbRouter.updateItem.mutate({
              itemId: created.id,
              encryptedBody: uint8ArrayToBase64(
                await orgKeyManager.encrypt(correctedBytes),
              ),
              encryptedExcerpt: uint8ArrayToBase64(
                await orgKeyManager.encrypt(correctedExcerptBytes),
              ),
            });
          }
        }

        haptic();
        toastStore.show(m.library_article_published());
        announceToLiveRegion("polite", m.library_article_published());
      }

      onsave();
    } catch (err: unknown) {
      console.error("[ArticleEditor] Save failed", err);
      toastStore.show(m.error_generic(), 3000);
    } finally {
      saving = false;
    }
  }

  // Accepted file types for inputs
  const IMAGE_ACCEPT = "image/png,image/jpeg,image/gif,image/webp";
  const FILE_ACCEPT = KB_ALLOWED_CONTENT_TYPES.join(",");

  const altCanInsert = $derived(altDecorative || altText.trim().length > 0);
</script>

<!-- Hidden file inputs (triggered programmatically from toolbar buttons).
     aria-label provides an accessible name even though the inputs are
     visually hidden and excluded from tab order. -->
<input
  bind:this={imageInputEl}
  type="file"
  accept={IMAGE_ACCEPT}
  class="sr-only"
  tabindex={-1}
  aria-label={m.library_editor_image()}
  onchange={(e) => handleImageSelected(e)}
/>
<input
  bind:this={fileInputEl}
  type="file"
  accept={FILE_ACCEPT}
  class="sr-only"
  tabindex={-1}
  aria-label={m.library_editor_attach_file()}
  onchange={(e) => void handleFileSelected(e)}
/>

<div class="article-editor">
  <!-- Category selector (tappable row + popover) -->
  <span bind:this={categoryAnchorEl}>
    <KList class="category-list">
      <ListItem
        title={m.library_category_select()}
        after={categories.find((c) => c.id === selectedCategoryId)?.name ??
          m.library_category_select_placeholder()}
        link
        onclick={() => {
          categorySelectorOpen = !categorySelectorOpen;
        }}
      />
    </KList>
  </span>

  <!-- Title input -->
  <input
    type="text"
    bind:value={title}
    class="editor-title"
    placeholder={m.library_article_title_placeholder()}
    aria-label={m.library_article_title_placeholder()}
  />

  <!-- Editor area (always mounted, decorations overlaid when a11y active) -->
  <div
    class="editor-area prose-quotes"
    bind:this={editorMountEl}
    role="textbox"
    aria-label={m.library_article_body_placeholder()}
    aria-multiline="true"
  ></div>

  {#if uploading}
    <div class="upload-indicator" role="status">
      <Preloader />
      <span>{m.library_image_uploading()}</span>
    </div>
  {/if}
</div>

<!-- Link insert/edit sheet -->
<ShellSheet
  opened={linkSheetOpen}
  ondismiss={() => {
    linkSheetOpen = false;
  }}
  title={linkUrl !== ""
    ? m.library_editor_link_edit_title()
    : m.library_editor_link_insert_title()}
>
  <div class="link-form">
    <ListInput
      label={m.library_editor_link_url()}
      type="url"
      value={linkUrl}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) linkUrl = e.target.value;
      }}
      placeholder={m.library_editor_url_placeholder()}
    />
    <ListInput
      label={m.library_editor_link_text()}
      type="text"
      value={linkText}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) linkText = e.target.value;
      }}
    />
    {#if linkTextIsGeneric}
      <Register kind="careful" role="alert">
        {m.library_editor_link_generic_warning({ text: linkText.trim() })}
      </Register>
    {/if}
    <div class="link-actions">
      <KButton
        clear
        onclick={() => {
          linkSheetOpen = false;
        }}
      >
        {m.common_cancel()}
      </KButton>
      <KButton disabled={linkUrl.trim() === ""} onclick={applyLink}>
        {m.library_editor_link_apply()}
      </KButton>
    </div>
  </div>
</ShellSheet>

<!-- Alt text sheet -->
<ShellSheet
  opened={altDialogOpen}
  ondismiss={() => {
    altDialogOpen = false;
    pendingImageFile = null;
  }}
  title={m.library_editor_alt_text_title()}
>
  <div class="alt-form">
    <ListInput
      label={m.library_editor_alt_text_placeholder()}
      type="textarea"
      value={altText}
      disabled={altDecorative}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLTextAreaElement) altText = e.target.value;
        else if (e.target instanceof HTMLInputElement) altText = e.target.value;
      }}
    />
    <label class="alt-decorative">
      <input type="checkbox" bind:checked={altDecorative} />
      {m.library_editor_decorative()}
    </label>
    <div class="alt-actions">
      <KButton
        clear
        onclick={() => {
          altDialogOpen = false;
          pendingImageFile = null;
        }}
      >
        {m.common_cancel()}
      </KButton>
      <KButton
        disabled={!altCanInsert}
        onclick={() => void confirmImageInsert()}
      >
        {m.library_editor_insert()}
      </KButton>
    </div>
  </div>
</ShellSheet>

<!-- Category selector popover -->
<ShellPopover
  opened={categorySelectorOpen}
  target={categoryAnchorEl}
  placement="bottom"
  ondismiss={() => {
    categorySelectorOpen = false;
  }}
>
  <KList nested>
    {#each categories as cat (cat.id)}
      <ListItem
        title={cat.name ?? "..."}
        onclick={() => {
          selectedCategoryId = cat.id;
          categorySelectorOpen = false;
        }}
      >
        {#snippet after()}
          {#if cat.id === selectedCategoryId}
            <Check size={16} class="text-brand-accent" aria-hidden="true" />
          {/if}
        {/snippet}
      </ListItem>
    {/each}
  </KList>
</ShellPopover>

<style>
  .article-editor {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-md) var(--page-pad-x);
  }

  :global(.category-list) {
    margin: 0 !important;
  }

  .editor-title {
    font-size: 1.5rem;
    font-family: var(--theme-font-display, var(--font-display));
    font-weight: 600;
    color: var(--ink);
    border: none;
    background: transparent;
    outline: none;
    padding: 0;
    width: 100%;
  }

  .editor-title::placeholder {
    color: var(--muted);
  }

  .editor-area {
    min-height: 200px;
    padding: 0;
    background: var(--paper);
  }

  /* When the keyboard is open, add bottom padding equal to the keyboard
     height plus the 2-row toolbar (~96px) so the last line of content
     can be scrolled above the keyboard toolbar into the visible area.
     --keyboard-height is set by keyboard-viewport.ts from the
     visualViewport API. */
  :global(html.keyboard-open) .editor-area {
    padding-bottom: calc(var(--keyboard-height, 0px) + 100px);
  }

  .editor-area :global(.ProseMirror) {
    outline: none;
    min-height: 150px;
  }

  .upload-indicator {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--text-sm);
    color: var(--muted);
    padding: var(--space-sm) 0;
  }

  /* Image NodeView styles */
  :global(.pm-image-view) {
    display: inline-block;
    position: relative;
    max-width: 100%;
  }

  :global(.pm-image-view__img) {
    max-width: 100%;
    height: auto;
    border-radius: var(--card-radius);
  }

  :global(.pm-image-view__alt-badge) {
    position: absolute;
    top: var(--space-sm);
    left: var(--space-sm);
    background: var(--brand-accent);
    color: white;
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 1px 4px;
    border-radius: 3px;
    pointer-events: none;
  }

  :global(.pm-image-view__loading) {
    width: 200px;
    height: 120px;
    background: var(--paper-deep, var(--surface-1));
    border-radius: var(--card-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.65;
  }

  /* The placeholder pulses only when motion is welcome. It stays visible
     either way, so nothing is lost when the animation is suppressed. */
  @media (prefers-reduced-motion: no-preference) {
    :global(.pm-image-view__loading) {
      opacity: 1;
      animation: pulse 1.5s ease-in-out infinite;
    }
  }

  :global(.pm-image-view__error) {
    padding: var(--space-md);
    font-size: var(--text-sm);
    color: var(--muted);
    font-style: italic;
    background: var(--paper-deep, var(--surface-1));
    border-radius: var(--card-radius);
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 0.8;
    }
  }

  /* ATAG inline decorations */
  .editor-area :global(.atag-issue-heading) {
    outline: 2px dashed var(--brand-accent);
    outline-offset: 2px;
    border-radius: 4px;
  }

  .editor-area :global(.atag-issue-image) {
    outline: 2px dashed var(--brand-accent);
    outline-offset: 2px;
  }

  .editor-area :global(.atag-generic-link),
  .editor-area :global(.atag-issue-link) {
    text-decoration: wavy underline var(--brand-accent);
    text-underline-offset: 3px;
  }

  /* A11y block annotation widget (after headings, images) */
  .editor-area :global(.atag-annotation) {
    font-size: var(--text-xs);
    color: var(--brand-accent);
    padding: 2px var(--space-xs);
    margin: 2px 0 var(--space-xs);
    user-select: none;
  }

  /* Prose typography: WYSIWYG editor matches the article detail page's
     .article-body rules so content looks the same while editing. */
  .editor-area :global(.ProseMirror) {
    font-size: var(--text-base);
    line-height: 1.65;
    color: var(--ink);
  }

  .editor-area :global(.ProseMirror h1),
  .editor-area :global(.ProseMirror h2),
  .editor-area :global(.ProseMirror h3),
  .editor-area :global(.ProseMirror h4) {
    font-family: var(--theme-font-display, var(--font-display));
    font-weight: 600;
    color: var(--ink);
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }

  .editor-area :global(.ProseMirror h1) {
    font-size: 1.5rem;
  }

  .editor-area :global(.ProseMirror h2) {
    font-size: 1.25rem;
  }

  .editor-area :global(.ProseMirror h3) {
    font-size: 1.0625rem;
  }

  .editor-area :global(.ProseMirror h4) {
    font-size: 0.9375rem;
  }

  .editor-area :global(.ProseMirror p) {
    margin-bottom: 0.75em;
  }

  .editor-area :global(.ProseMirror a) {
    color: var(--brand-text);
    text-decoration: underline;
  }

  .editor-area :global(.ProseMirror code) {
    background: var(--paper-deep, var(--surface-1));
    padding: 0.125em 0.25em;
    border-radius: 3px;
    font-size: 0.875em;
  }

  .editor-area :global(.ProseMirror pre) {
    background: var(--paper-deep, var(--surface-1));
    padding: var(--space-lg);
    border-radius: var(--card-radius);
    overflow-x: auto;
  }

  .editor-area :global(.ProseMirror ul) {
    list-style-type: disc;
    padding-left: 1.5em;
    margin-bottom: 0.75em;
  }

  .editor-area :global(.ProseMirror ol) {
    list-style-type: decimal;
    padding-left: 1.5em;
    margin-bottom: 0.75em;
  }

  .editor-area :global(.ProseMirror img) {
    max-width: 100%;
    height: auto;
    border-radius: var(--card-radius);
  }

  .editor-area :global(.ProseMirror table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0.75em;
  }

  .editor-area :global(.ProseMirror th),
  .editor-area :global(.ProseMirror td) {
    border: 1px solid var(--hair, var(--divider));
    padding: var(--space-sm) var(--space-md);
    text-align: left;
  }

  .editor-area :global(.ProseMirror th) {
    background: var(--paper-deep, var(--surface-1));
    font-weight: 600;
  }

  .editor-area :global(.ProseMirror hr) {
    border: none;
    border-top: 1px solid var(--hair, var(--divider));
    margin: 1.5em 0;
  }

  /* Link form */
  .link-form {
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .link-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
  }

  /* Alt text form */
  .alt-form {
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .alt-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
  }

  .alt-decorative {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--text-sm);
    color: var(--muted);
    cursor: pointer;
    padding: 0 var(--space-md);
  }

  .alt-decorative input[type="checkbox"] {
    accent-color: var(--brand-accent);
    width: 1.125rem;
    height: 1.125rem;
  }

  /* Screen-reader only (hidden file inputs) */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
