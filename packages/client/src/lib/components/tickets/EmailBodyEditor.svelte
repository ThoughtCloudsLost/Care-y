<!--
  ProseMirror body editor and reduced toolbar for the email compose sheet.

  Split out of EmailComposeSheet so the editor mounts with its own element
  present. ShellSheet defers rendering its children until the overlay opens,
  and useProseMirror creates the EditorView in onMount, reading the element
  once. A component that owns both the element and the composable therefore
  has to live inside the deferred subtree, or the editor is created against
  a null element and never retried.

  The parent keeps the subject field and the send button, so this component
  reports the document upward on every change rather than owning the send.
-->
<script lang="ts">
  import {
    Bold,
    Italic,
    Link,
    List as ListIcon,
    ListOrdered,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { emailSchema } from "$lib/editor/email-schema.js";
  import { useProseMirror } from "$lib/editor/use-prosemirror.svelte.js";
  import {
    blockTypeActive,
    deriveToolbarState,
  } from "$lib/editor/toolbar-state.js";
  import { baseKeymap, toggleMark } from "prosemirror-commands";
  import {
    liftListItem,
    sinkListItem,
    splitListItem,
    wrapInList,
  } from "prosemirror-schema-list";
  import { history, redo, undo } from "prosemirror-history";
  import { keymap } from "prosemirror-keymap";

  /** Subset of ToolbarCommand that the email body editor handles. */
  type EmailCommand =
    | { kind: "toggleBold" }
    | { kind: "toggleItalic" }
    | { kind: "toggleLink" }
    | { kind: "wrapInBulletList" }
    | { kind: "wrapInOrderedList" };

  interface EmailBodyEditorProps {
    /**
     * Reports the current document and whether it holds any text. Fires on
     * every editor change and once for the empty initial state, so the
     * parent can gate its send button without reaching into the editor.
     */
    onchange: (doc: unknown, hasContent: boolean) => void;
  }

  let { onchange }: EmailBodyEditorProps = $props();

  let editorEl = $state<HTMLElement | null>(null);

  const listItemType = emailSchema.nodes.list_item;
  const listKeybindings: Record<string, ReturnType<typeof splitListItem>> = {
    Enter: splitListItem(listItemType),
    Tab: sinkListItem(listItemType),
    "Shift-Tab": liftListItem(listItemType),
  };

  const emailPlugins = [
    keymap(listKeybindings),
    keymap({
      "Mod-z": undo,
      "Mod-Shift-z": redo,
      "Mod-y": redo,
    }),
    keymap(baseKeymap),
    history(),
  ] as const;

  const editor = useProseMirror(() => editorEl, {
    schema: emailSchema,
    plugins: [...emailPlugins],
  });

  const toolbarState = $derived(
    editor.state !== null ? deriveToolbarState(editor.state) : null,
  );

  $effect(() => {
    const state = editor.state;
    if (state === null) return;
    // ProseMirror types toJSON() as any; the parent validates with Zod.
    const doc: unknown = state.doc.toJSON();
    onchange(doc, state.doc.textContent.trim().length > 0);
  });

  function dispatchEmailCommand(cmd: EmailCommand): void {
    const view = editor.view;
    if (view === null) return;
    const { state, dispatch } = view;

    switch (cmd.kind) {
      case "toggleBold":
        toggleMark(emailSchema.marks.strong)(state, dispatch);
        break;
      case "toggleItalic":
        toggleMark(emailSchema.marks.em)(state, dispatch);
        break;
      case "toggleLink":
        toggleMark(emailSchema.marks.link)(state, dispatch);
        break;
      case "wrapInBulletList":
        if (blockTypeActive(state, emailSchema.nodes.bullet_list)) {
          liftListItem(emailSchema.nodes.list_item)(state, dispatch);
        } else {
          wrapInList(emailSchema.nodes.bullet_list)(state, dispatch);
        }
        break;
      case "wrapInOrderedList":
        if (blockTypeActive(state, emailSchema.nodes.ordered_list)) {
          liftListItem(emailSchema.nodes.list_item)(state, dispatch);
        } else {
          wrapInList(emailSchema.nodes.ordered_list)(state, dispatch);
        }
        break;
    }

    view.focus();
  }

  interface ToolbarBtn {
    label: string;
    icon: typeof Bold;
    command: EmailCommand;
    active: boolean;
    disabled: boolean;
  }

  const toolbarButtons = $derived.by((): ToolbarBtn[] => {
    if (toolbarState === null) return [];
    return [
      {
        label: m.library_editor_bold(),
        icon: Bold,
        command: { kind: "toggleBold" },
        active: toolbarState.boldActive,
        disabled: !toolbarState.canBold,
      },
      {
        label: m.library_editor_italic(),
        icon: Italic,
        command: { kind: "toggleItalic" },
        active: toolbarState.italicActive,
        disabled: !toolbarState.canItalic,
      },
      {
        label: m.library_editor_link(),
        icon: Link,
        command: { kind: "toggleLink" },
        active: toolbarState.linkActive,
        disabled: !toolbarState.canLink,
      },
      {
        label: m.library_editor_bullet_list(),
        icon: ListIcon,
        command: { kind: "wrapInBulletList" },
        active: toolbarState.bulletListActive,
        disabled: !toolbarState.canBulletList,
      },
      {
        label: m.library_editor_ordered_list(),
        icon: ListOrdered,
        command: { kind: "wrapInOrderedList" },
        active: toolbarState.orderedListActive,
        disabled: !toolbarState.canOrderedList,
      },
    ];
  });
</script>

{#if toolbarButtons.length > 0}
  <div class="email-toolbar-scroll">
    <div
      role="toolbar"
      aria-label={m.library_editor_toolbar()}
      class="email-toolbar"
    >
      <div class="ed-toolbar-row">
        <div
          class="ed-toolbar-group glass"
          role="group"
          aria-label={m.library_editor_bold()}
        >
          {#each toolbarButtons as btn (btn.command.kind)}
            {@const Icon = btn.icon}
            <button
              type="button"
              aria-label={btn.label}
              aria-pressed={btn.active}
              aria-disabled={btn.disabled}
              class="ed-toolbar-btn {btn.disabled ? 'ed-toolbar-btn--off' : ''}"
              onclick={() => dispatchEmailCommand(btn.command)}
            >
              <Icon size={18} aria-hidden="true" />
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}

<div
  class="email-editor-area"
  bind:this={editorEl}
  role="textbox"
  aria-multiline="true"
  aria-label={m.ticket_email_body_placeholder()}
></div>

<style>
  .email-toolbar-scroll {
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .email-toolbar-scroll::-webkit-scrollbar {
    display: none;
  }

  :global(.email-toolbar) {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) 0;
    width: max-content;
    min-width: 100%;
  }

  .email-editor-area {
    min-height: 10rem;
    border: 1px solid var(--hair);
    border-radius: var(--card-radius, 0.75rem);
    padding: 10px 14px;
    font-size: var(--text-md);
    line-height: 1.5;
    color: var(--ink);
    overflow-y: auto;
  }

  .email-editor-area :global(.ProseMirror) {
    outline: none;
    min-height: 8rem;
  }

  .email-editor-area :global(.ProseMirror p) {
    margin: 0 0 0.5em;
  }

  .email-editor-area :global(.ProseMirror ul),
  .email-editor-area :global(.ProseMirror ol) {
    margin: 0.25em 0;
    padding-left: 1.5em;
  }
</style>
