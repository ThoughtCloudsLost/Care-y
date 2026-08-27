<!--
  Rich-text editor for form meta fields (description, submit message,
  closed message) and text-block form fields. Uses the shared editor
  schema, plugins, and toolbar state so capabilities cannot drift from
  ArticleEditor.

  Handles locale switching by serializing the current doc into a
  per-locale map and loading the target locale's content. Undo history
  resets on locale switch (intentional per F-003 decision 6).
-->
<script lang="ts">
  import { Node as PMNode } from "prosemirror-model";
  import { EditorState } from "prosemirror-state";
  import { Button as KButton, Preloader, ListInput } from "konsta/svelte";
  import Register from "$lib/components/Register.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import {
    editorSchema,
    composeEditorPlugins,
  } from "$lib/editor/prosemirror-schema.js";
  import { useProseMirror } from "$lib/editor/use-prosemirror.svelte.js";
  import {
    deriveToolbarState,
    type ToolbarCommand,
    type ToolbarState,
  } from "$lib/editor/toolbar-state.js";
  import {
    dispatchToolbarCommand,
    type EditorAction,
  } from "$lib/editor/toolbar-commands.js";
  import { createFormAssetImageView } from "$lib/editor/node-views/form-asset-image-view.js";
  import { isGenericLinkText } from "$lib/editor/atag-checks.js";
  import { getOrgSlug } from "$lib/utils/org-slug.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import {
    KB_ATTACHMENT_MAX_BYTES,
    FORM_ASSET_CONTENT_TYPES,
    FORM_LOCALES,
    type FormLocale,
    type LocalizedRichText,
    type ProseMirrorDocJSON,
  } from "@care-y/shared";
  import { encryptClientBranding, encode } from "@care-y/crypto";
  import { untrack } from "svelte";

  // ---------------------------------------------------------------------------
  // Props
  // ---------------------------------------------------------------------------

  interface Props {
    /** Current per-locale rich text map. */
    value: LocalizedRichText | undefined;
    /** Active editing locale. */
    locale: FormLocale;
    /** Called with the updated full LocalizedRichText map on every change. */
    onchange: (updated: LocalizedRichText) => void;
    /** Visible label above the editor. */
    label: string;
    /** Optional helper text below the label. */
    hint?: string;
    /** Org public key for branding-tier image encryption. Null disables image upload. */
    orgPublicKey: Uint8Array | null;
  }

  let { value, locale, onchange, label, hint, orgPublicKey }: Props = $props();

  // ---------------------------------------------------------------------------
  // Per-locale document map
  // ---------------------------------------------------------------------------

  // Stores serialized doc JSON per locale. Initialized from the value prop.
  // Updated whenever the editor changes or the locale switches.
  let localeDocsJson: Partial<Record<FormLocale, ProseMirrorDocJSON>> = $state(
    buildInitialLocaleMap(untrack(() => value)),
  );

  function buildInitialLocaleMap(
    val: LocalizedRichText | undefined,
  ): Partial<Record<FormLocale, ProseMirrorDocJSON>> {
    const map: Partial<Record<FormLocale, ProseMirrorDocJSON>> = {};
    if (val === undefined) return map;

    for (const loc of FORM_LOCALES) {
      // eslint-disable-next-line security/detect-object-injection -- loc is from the FORM_LOCALES const tuple
      const content = val[loc];
      if (content === undefined) continue;

      if (typeof content === "string") {
        // Legacy plain string: wrap in a single paragraph doc
        if (content.trim().length > 0) {
          // eslint-disable-next-line security/detect-object-injection -- loc is from the FORM_LOCALES const tuple
          map[loc] = {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: content }],
              },
            ],
          };
        }
      } else {
        // ProseMirror doc JSON
        // eslint-disable-next-line security/detect-object-injection -- loc is from the FORM_LOCALES const tuple
        map[loc] = content;
      }
    }
    return map;
  }

  // ---------------------------------------------------------------------------
  // tRPC and org slug
  // ---------------------------------------------------------------------------

  /**
   * Safely extract ProseMirrorDocJSON from a PMNode.
   * PMNode.toJSON() returns `any` in ProseMirror's type defs.
   * Route through `unknown` and validate the structural shape.
   */
  function isUnknownArray(candidate: unknown): candidate is readonly unknown[] {
    return Array.isArray(candidate);
  }

  function docToJson(doc: PMNode): ProseMirrorDocJSON {
    const raw: unknown = doc.toJSON();
    if (
      typeof raw === "object" &&
      raw !== null &&
      "type" in raw &&
      raw.type === "doc" &&
      "content" in raw &&
      isUnknownArray(raw.content)
    ) {
      return { type: raw.type, content: [...raw.content] };
    }
    // Fallback: empty doc (should never happen for a valid PMNode)
    return { type: "doc", content: [] };
  }

  const intakeFormsRouter = requireRouter(trpc.intakeForms, "intakeForms");
  const orgSlug = getOrgSlug();

  // ---------------------------------------------------------------------------
  // Editor mount and plugin composition
  // ---------------------------------------------------------------------------

  let editorMountEl = $state<HTMLElement | null>(null);

  const allPlugins = composeEditorPlugins();

  function docForLocale(loc: FormLocale): PMNode | undefined {
    // eslint-disable-next-line security/detect-object-injection -- loc is from FormLocale enum
    const json = localeDocsJson[loc];
    if (json === undefined) return undefined;
    try {
      return PMNode.fromJSON(editorSchema, json);
    } catch {
      return undefined;
    }
  }

  const initialDoc = untrack(() => docForLocale(locale));

  const editor = useProseMirror(() => editorMountEl, {
    schema: editorSchema,
    plugins: [...allPlugins],
    doc: initialDoc,
    nodeViews: {
      image: createFormAssetImageView(orgSlug),
    },
    onTransaction: () => {
      // Serialize current doc into the locale map on every transaction
      if (editor.state === null) return;
      const json = docToJson(editor.state.doc);
      // eslint-disable-next-line security/detect-object-injection -- locale is from FormLocale enum
      localeDocsJson[locale] = json;

      // Build and emit the full LocalizedRichText map
      const updated: LocalizedRichText = {};
      for (const loc of FORM_LOCALES) {
        // eslint-disable-next-line security/detect-object-injection -- loc is from the FORM_LOCALES const tuple
        const docJson = localeDocsJson[loc];
        if (docJson !== undefined) {
          // eslint-disable-next-line security/detect-object-injection -- loc is from the FORM_LOCALES const tuple
          updated[loc] = docJson;
        }
      }
      onchange(updated);
    },
  });

  // ---------------------------------------------------------------------------
  // Locale switching
  // ---------------------------------------------------------------------------

  let previousLocale: FormLocale = $state(untrack(() => locale));

  $effect(() => {
    if (locale === previousLocale) return;

    const view = editor.view;
    if (view !== null && editor.state !== null) {
      // Serialize current doc before switching
      const currentJson = docToJson(editor.state.doc);
      // eslint-disable-next-line security/detect-object-injection -- previousLocale is from FormLocale enum
      localeDocsJson[previousLocale] = currentJson;
    }

    // Load the target locale's doc (or create an empty doc)
    const targetDoc = docForLocale(locale);
    const newState = EditorState.create({
      schema: editorSchema,
      doc: targetDoc,
      plugins: [...allPlugins],
    });

    if (editor.view !== null) {
      editor.view.updateState(newState);
    }

    previousLocale = locale;
  });

  // ---------------------------------------------------------------------------
  // Toolbar state
  // ---------------------------------------------------------------------------

  const toolbarState: ToolbarState | null = $derived(
    editor.state !== null ? deriveToolbarState(editor.state) : null,
  );

  // ---------------------------------------------------------------------------
  // Toolbar command dispatch
  // ---------------------------------------------------------------------------

  function handleEditorAction(action: EditorAction): void {
    switch (action.action) {
      case "toggleLink":
        openLinkSheet();
        break;
      case "insertImage":
        triggerImageUpload();
        break;
      case "insertHorizontalRule":
        insertHorizontalRule();
        break;
      case "insertTable":
      case "attachFile":
        // Not supported in form content editors
        break;
    }
  }

  function handleToolbarCommand(cmd: ToolbarCommand): void {
    const view = editor.view;
    if (view === null) return;
    dispatchToolbarCommand(view, cmd, handleEditorAction);
    view.focus();
  }

  // ---------------------------------------------------------------------------
  // Link sheet
  // ---------------------------------------------------------------------------

  let linkSheetOpen = $state(false);
  let linkUrl = $state("");
  let linkText = $state("");

  function openLinkSheet(): void {
    const view = editor.view;
    if (view === null) return;

    const { from, to, empty } = view.state.selection;
    const linkType = editorSchema.marks.link;
    if (linkType === undefined) return;

    if (!empty) {
      linkText = view.state.doc.textBetween(from, to);
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

    const linkType = editorSchema.marks.link;
    if (linkType === undefined) return;

    const { from, to, empty } = view.state.selection;
    const tr = view.state.tr;

    if (empty && linkText.trim() !== "") {
      const mark = linkType.create({ href: linkUrl });
      const textNode = editorSchema.text(linkText, [mark]);
      tr.replaceSelectionWith(textNode, false);
    } else if (!empty) {
      tr.addMark(from, to, linkType.create({ href: linkUrl }));
    }

    view.dispatch(tr);
    linkSheetOpen = false;
    linkUrl = "";
    linkText = "";
    view.focus();
  }

  const linkTextIsGeneric = $derived(isGenericLinkText(linkText));

  // ---------------------------------------------------------------------------
  // Image upload (branding-tier encryption, form-asset:// URIs)
  // ---------------------------------------------------------------------------

  let imageInputEl: HTMLInputElement | undefined;
  let uploading = $state(false);

  // Alt text dialog state
  let altDialogOpen = $state(false);
  let altText = $state("");
  let altDecorative = $state(false);
  let pendingImageFile: File | null = null;

  /** Type guard for form asset content types. */
  function isFormAssetType(
    type: string,
  ): type is (typeof FORM_ASSET_CONTENT_TYPES)[number] {
    return (FORM_ASSET_CONTENT_TYPES as readonly string[]).includes(type);
  }

  function triggerImageUpload(): void {
    if (orgPublicKey === null) {
      toastStore.show(m.form_content_editor_image_no_key(), 3000);
      return;
    }
    imageInputEl?.click();
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

    if (!isFormAssetType(file.type)) {
      toastStore.show(m.library_file_type_not_allowed(), 3000);
      return;
    }

    // Prompt for alt text before uploading (ATAG pattern)
    pendingImageFile = file;
    altText = "";
    altDecorative = false;
    altDialogOpen = true;
  }

  async function confirmImageInsert(): Promise<void> {
    altDialogOpen = false;
    const file = pendingImageFile;
    pendingImageFile = null;
    if (file == null || editor.view === null || orgPublicKey === null) return;

    const resolvedAlt = altDecorative ? "" : altText.trim();
    await uploadAndInsertImage(file, resolvedAlt);
  }

  async function uploadAndInsertImage(file: File, alt: string): Promise<void> {
    if (uploading || editor.view === null || orgPublicKey === null) return;
    uploading = true;

    try {
      const arrayBuf = await file.arrayBuffer();
      const plainBytes = new Uint8Array(arrayBuf);

      // Encrypt with branding key (public-key-derived, same as PWA icons)
      const encrypted = encryptClientBranding(plainBytes, orgPublicKey);
      const blob = encode(encrypted);

      const result = await intakeFormsRouter.uploadFormAsset.mutate({
        blob,
        sizeBytes: encrypted.length,
        contentType: isFormAssetType(file.type) ? file.type : "image/png",
      });

      insertImageNode(`form-asset://${result.blobId}`, alt);
      haptic();
    } catch (err: unknown) {
      console.error("[FormContentEditor] Image upload failed", err);
      toastStore.show(m.library_image_upload_failed(), 3000);
    } finally {
      uploading = false;
    }
  }

  function insertImageNode(src: string, alt: string): void {
    const view = editor.view;
    if (view === null) return;

    const imageType = editorSchema.nodes.image;
    if (imageType === undefined) return;

    const imageNode = imageType.create({ src, alt });
    const tr = view.state.tr.replaceSelectionWith(imageNode);
    view.dispatch(tr);
    view.focus();
  }

  // ---------------------------------------------------------------------------
  // Insert horizontal rule
  // ---------------------------------------------------------------------------

  function insertHorizontalRule(): void {
    const view = editor.view;
    if (view === null) return;

    const hrType = editorSchema.nodes.horizontal_rule;
    if (hrType === undefined) return;

    const tr = view.state.tr.replaceSelectionWith(hrType.create());
    view.dispatch(tr);
    view.focus();
  }

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------

  const altCanInsert = $derived(altDecorative || altText.trim().length > 0);

  const IMAGE_ACCEPT = FORM_ASSET_CONTENT_TYPES.join(",");
</script>

<!-- Hidden file input for image upload -->
<input
  bind:this={imageInputEl}
  type="file"
  accept={IMAGE_ACCEPT}
  class="sr-only"
  tabindex={-1}
  aria-label={m.library_editor_image()}
  onchange={(e) => handleImageSelected(e)}
/>

<div class="form-content-editor">
  <!-- Label and hint -->
  <div class="fce-label-row">
    <span class="fce-label" id="fce-label">{label}</span>
    {#if hint}
      <span class="fce-hint" id="fce-hint">{hint}</span>
    {/if}
  </div>

  <!-- Inline toolbar -->
  {#if toolbarState !== null}
    <div
      class="fce-toolbar"
      role="toolbar"
      aria-label={m.library_editor_toolbar()}
    >
      <button
        type="button"
        class="fce-btn"
        class:active={toolbarState.boldActive}
        disabled={!toolbarState.canBold}
        aria-label={m.library_editor_bold()}
        aria-pressed={toolbarState.boldActive}
        onclick={() => handleToolbarCommand({ kind: "toggleBold" })}>B</button
      >

      <button
        type="button"
        class="fce-btn fce-btn-italic"
        class:active={toolbarState.italicActive}
        disabled={!toolbarState.canItalic}
        aria-label={m.library_editor_italic()}
        aria-pressed={toolbarState.italicActive}
        onclick={() => handleToolbarCommand({ kind: "toggleItalic" })}
        ><em>I</em></button
      >

      <button
        type="button"
        class="fce-btn"
        class:active={toolbarState.strikethroughActive}
        disabled={!toolbarState.canStrikethrough}
        aria-label={m.library_editor_strikethrough()}
        aria-pressed={toolbarState.strikethroughActive}
        onclick={() => handleToolbarCommand({ kind: "toggleStrikethrough" })}
        ><s>S</s></button
      >

      <button
        type="button"
        class="fce-btn"
        class:active={toolbarState.codeActive}
        disabled={!toolbarState.canCode}
        aria-label={m.library_editor_code()}
        aria-pressed={toolbarState.codeActive}
        onclick={() => handleToolbarCommand({ kind: "toggleCode" })}
        >&lt;/&gt;</button
      >

      <span class="fce-sep" aria-hidden="true"></span>

      <button
        type="button"
        class="fce-btn"
        class:active={toolbarState.linkActive}
        disabled={!toolbarState.canLink}
        aria-label={m.library_editor_link()}
        aria-pressed={toolbarState.linkActive}
        onclick={() => handleToolbarCommand({ kind: "toggleLink" })}
        >&#128279;</button
      >

      <span class="fce-sep" aria-hidden="true"></span>

      <button
        type="button"
        class="fce-btn"
        class:active={toolbarState.bulletListActive}
        disabled={!toolbarState.canBulletList}
        aria-label={m.library_editor_bullet_list()}
        aria-pressed={toolbarState.bulletListActive}
        onclick={() => handleToolbarCommand({ kind: "wrapInBulletList" })}
        >&#8226;</button
      >

      <button
        type="button"
        class="fce-btn"
        class:active={toolbarState.orderedListActive}
        disabled={!toolbarState.canOrderedList}
        aria-label={m.library_editor_ordered_list()}
        aria-pressed={toolbarState.orderedListActive}
        onclick={() => handleToolbarCommand({ kind: "wrapInOrderedList" })}
        >{m.library_editor_ordered_list_symbol()}</button
      >

      <span class="fce-sep" aria-hidden="true"></span>

      <!-- Heading select -->
      <select
        class="fce-heading-select"
        aria-label={m.library_editor_heading()}
        value={toolbarState.headingLevel !== null
          ? String(toolbarState.headingLevel)
          : "p"}
        onchange={(e) => {
          if (!(e.target instanceof HTMLSelectElement)) return;
          const val = e.target.value;
          if (val === "p") {
            handleToolbarCommand({ kind: "setParagraph" });
          } else {
            handleToolbarCommand({ kind: "setHeading", level: Number(val) });
          }
        }}
      >
        <option value="p">{m.library_editor_paragraph()}</option>
        <option value="1"
          >{m.library_editor_heading_level({ level: "1" })}</option
        >
        <option value="2"
          >{m.library_editor_heading_level({ level: "2" })}</option
        >
        <option value="3"
          >{m.library_editor_heading_level({ level: "3" })}</option
        >
        <option value="4"
          >{m.library_editor_heading_level({ level: "4" })}</option
        >
      </select>

      <span class="fce-sep" aria-hidden="true"></span>

      <button
        type="button"
        class="fce-btn"
        class:active={toolbarState.blockquoteActive}
        disabled={!toolbarState.canBlockquote}
        aria-label={m.library_editor_blockquote()}
        aria-pressed={toolbarState.blockquoteActive}
        onclick={() => handleToolbarCommand({ kind: "wrapInBlockquote" })}
        >&#10077;</button
      >

      <button
        type="button"
        class="fce-btn"
        class:active={toolbarState.codeBlockActive}
        disabled={!toolbarState.canCodeBlock}
        aria-label={m.library_editor_code_block()}
        aria-pressed={toolbarState.codeBlockActive}
        onclick={() => handleToolbarCommand({ kind: "setCodeBlock" })}
        >{"{}"}</button
      >

      <button
        type="button"
        class="fce-btn"
        disabled={orgPublicKey === null}
        aria-label={m.library_editor_image()}
        onclick={() => handleToolbarCommand({ kind: "insertImage" })}
        >&#128247;</button
      >

      <button
        type="button"
        class="fce-btn"
        aria-label={m.library_editor_horizontal_rule()}
        onclick={() => handleToolbarCommand({ kind: "insertHorizontalRule" })}
        >&#8213;</button
      >

      <span class="fce-sep" aria-hidden="true"></span>

      <button
        type="button"
        class="fce-btn"
        disabled={!toolbarState.canUndo}
        aria-label={m.library_editor_undo()}
        onclick={() => handleToolbarCommand({ kind: "undo" })}>&#8617;</button
      >

      <button
        type="button"
        class="fce-btn"
        disabled={!toolbarState.canRedo}
        aria-label={m.library_editor_redo()}
        onclick={() => handleToolbarCommand({ kind: "redo" })}>&#8618;</button
      >
    </div>
  {/if}

  <!-- Editor area -->
  <div
    class="fce-editor-area"
    bind:this={editorMountEl}
    role="textbox"
    aria-labelledby="fce-label"
    aria-describedby={hint !== undefined && hint !== ""
      ? "fce-hint"
      : undefined}
    aria-multiline="true"
  ></div>

  {#if uploading}
    <div class="fce-upload-indicator" role="status">
      <Preloader />
      <span>{m.library_image_uploading()}</span>
    </div>
  {/if}
</div>

<!-- Link sheet (matches ArticleEditor pattern) -->
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

<!-- Alt text sheet (ATAG pattern matching ArticleEditor) -->
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

<style>
  .form-content-editor {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .fce-label-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 var(--space-md);
  }

  .fce-label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--ink);
  }

  .fce-hint {
    font-size: var(--text-xs);
    color: var(--muted);
  }

  /* Toolbar */
  .fce-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px;
    padding: var(--space-xs) var(--space-md);
    border: 1px solid var(--hair, var(--divider));
    border-bottom: none;
    border-radius: var(--card-radius) var(--card-radius) 0 0;
    background: var(--paper-deep, var(--surface-1));
  }

  .fce-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    min-height: 32px;
    padding: 2px 6px;
    border: 1px solid transparent;
    border-radius: 4px;
    background: transparent;
    color: var(--ink);
    font-size: var(--text-sm);
    cursor: pointer;
  }

  @media (prefers-reduced-motion: no-preference) {
    .fce-btn {
      transition: background 0.15s;
    }
  }

  .fce-btn:hover:not(:disabled) {
    background: var(--surface-2, rgba(0, 0, 0, 0.06));
  }

  .fce-btn:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .fce-btn.active {
    background: var(--brand-primary-20, rgba(0, 0, 0, 0.1));
    color: var(--brand-text, var(--ink));
  }

  .fce-btn-italic {
    font-style: italic;
  }

  .fce-sep {
    width: 1px;
    height: 20px;
    background: var(--hair, var(--divider));
    margin: 0 4px;
  }

  .fce-heading-select {
    height: 32px;
    padding: 0 var(--space-xs);
    border: 1px solid var(--hair, var(--divider));
    border-radius: 4px;
    background: transparent;
    color: var(--ink);
    font-size: var(--text-xs);
    cursor: pointer;
  }

  /* Editor area */
  .fce-editor-area {
    min-height: 120px;
    max-height: 400px;
    overflow-y: auto;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--hair, var(--divider));
    border-radius: 0 0 var(--card-radius) var(--card-radius);
    background: var(--paper);
  }

  .fce-editor-area :global(.ProseMirror) {
    outline: none;
    min-height: 100px;
    font-size: var(--text-base);
    line-height: 1.65;
    color: var(--ink);
  }

  .fce-editor-area :global(.ProseMirror p) {
    margin-bottom: 0.5em;
  }

  .fce-editor-area :global(.ProseMirror a) {
    color: var(--brand-text);
    text-decoration: underline;
  }

  .fce-editor-area :global(.ProseMirror ul) {
    list-style-type: disc;
    padding-left: 1.5em;
    margin-bottom: 0.5em;
  }

  .fce-editor-area :global(.ProseMirror ol) {
    list-style-type: decimal;
    padding-left: 1.5em;
    margin-bottom: 0.5em;
  }

  .fce-editor-area :global(.ProseMirror h1),
  .fce-editor-area :global(.ProseMirror h2),
  .fce-editor-area :global(.ProseMirror h3),
  .fce-editor-area :global(.ProseMirror h4) {
    font-family: var(--theme-font-display, var(--font-display));
    font-weight: 600;
    color: var(--ink);
    margin-top: 1em;
    margin-bottom: 0.4em;
  }

  .fce-editor-area :global(.ProseMirror h1) {
    font-size: 1.5rem;
  }
  .fce-editor-area :global(.ProseMirror h2) {
    font-size: 1.25rem;
  }
  .fce-editor-area :global(.ProseMirror h3) {
    font-size: 1.0625rem;
  }
  .fce-editor-area :global(.ProseMirror h4) {
    font-size: 0.9375rem;
  }

  .fce-editor-area :global(.ProseMirror blockquote) {
    border-left: 3px solid var(--hair, var(--divider));
    padding-left: var(--space-md);
    margin-bottom: 0.5em;
    color: var(--muted);
  }

  .fce-editor-area :global(.ProseMirror code) {
    background: var(--paper-deep, var(--surface-1));
    padding: 0.125em 0.25em;
    border-radius: 3px;
    font-size: 0.875em;
  }

  .fce-editor-area :global(.ProseMirror pre) {
    background: var(--paper-deep, var(--surface-1));
    padding: var(--space-md);
    border-radius: var(--card-radius);
    overflow-x: auto;
  }

  .fce-editor-area :global(.ProseMirror img) {
    max-width: 100%;
    height: auto;
    border-radius: var(--card-radius);
  }

  .fce-editor-area :global(.ProseMirror hr) {
    border: none;
    border-top: 1px solid var(--hair, var(--divider));
    margin: 1em 0;
  }

  /* Image NodeView styles */
  .fce-editor-area :global(.pm-form-image-view) {
    display: inline-block;
    position: relative;
    max-width: 100%;
  }

  .fce-editor-area :global(.pm-form-image-view__img) {
    max-width: 100%;
    height: auto;
    border-radius: var(--card-radius);
  }

  .fce-editor-area :global(.pm-form-image-view__alt-badge) {
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

  /* ATAG inline decorations */
  .fce-editor-area :global(.atag-issue-heading) {
    outline: 2px dashed var(--brand-accent);
    outline-offset: 2px;
    border-radius: 4px;
  }

  .fce-editor-area :global(.atag-issue-image) {
    outline: 2px dashed var(--brand-accent);
    outline-offset: 2px;
  }

  .fce-editor-area :global(.atag-generic-link),
  .fce-editor-area :global(.atag-issue-link) {
    text-decoration: wavy underline var(--brand-accent);
    text-underline-offset: 3px;
  }

  .fce-editor-area :global(.atag-annotation) {
    font-size: var(--text-xs);
    color: var(--brand-accent);
    padding: 2px var(--space-xs);
    margin: 2px 0 var(--space-xs);
    user-select: none;
  }

  /* Upload indicator */
  .fce-upload-indicator {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--text-sm);
    color: var(--muted);
    padding: var(--space-sm) var(--space-md);
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
