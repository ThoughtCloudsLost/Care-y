<!--
  Email compose sheet for the ticket detail page.

  Subject input + ProseMirror body (emailSchema, reduced toolbar:
  bold, italic, link, bullet list, ordered list). Send fires the
  email relay then writes the encrypted follow-up.
-->
<script lang="ts">
  import { List, ListInput, Preloader } from "konsta/svelte";
  import {
    Bold,
    Italic,
    Link,
    List as ListIcon,
    ListOrdered,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { emailSchema } from "$lib/editor/email-schema.js";
  import { emailDocToHtml, emailDocToText } from "$lib/editor/email-schema.js";
  import { useProseMirror } from "$lib/editor/use-prosemirror.svelte.js";
  import { deriveToolbarState } from "$lib/editor/toolbar-state.js";
  import { toggleMark } from "prosemirror-commands";
  import { wrapInList, liftListItem } from "prosemirror-schema-list";
  import { history, undo, redo } from "prosemirror-history";
  import { keymap } from "prosemirror-keymap";
  import { baseKeymap } from "prosemirror-commands";
  import { splitListItem, sinkListItem } from "prosemirror-schema-list";
  import { blockTypeActive } from "$lib/editor/toolbar-state.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import Register from "$lib/components/Register.svelte";
  import {
    proseMirrorDocSchema,
    type ProseMirrorDocJSON,
  } from "@care-y/shared";

  /** Subset of ToolbarCommand that the email compose sheet handles. */
  type EmailCommand =
    | { kind: "toggleBold" }
    | { kind: "toggleItalic" }
    | { kind: "toggleLink" }
    | { kind: "wrapInBulletList" }
    | { kind: "wrapInOrderedList" };

  interface EmailComposeSheetProps {
    opened: boolean;
    ondismiss: () => void;
    sending: boolean;
    onsend: (
      subject: string,
      html: string,
      text: string,
      doc: ProseMirrorDocJSON,
    ) => void;
  }

  let { opened, ondismiss, sending, onsend }: EmailComposeSheetProps = $props();

  let subject = $state("");
  let editorEl = $state<HTMLElement | null>(null);
  let wasOpen = $state(false);

  // Build email-specific plugins (no heading hierarchy, no ATAG plugins).
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

  const hasContent = $derived.by((): boolean => {
    if (editor.state === null) return false;
    const { doc } = editor.state;
    return doc.textContent.trim().length > 0;
  });

  const canSend = $derived(subject.trim().length > 0 && hasContent && !sending);

  // Reset subject when the sheet opens.
  $effect(() => {
    if (opened && !wasOpen) {
      subject = "";
    }
    wasOpen = opened;
  });

  function handleSend(): void {
    if (!canSend || editor.state === null) return;
    const raw: unknown = editor.state.doc.toJSON();
    const parsed = proseMirrorDocSchema.safeParse(raw);
    if (!parsed.success) return;
    const doc: ProseMirrorDocJSON = parsed.data;
    const html = emailDocToHtml(doc);
    const text = emailDocToText(doc);
    onsend(subject.trim(), html, text, doc);
  }

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

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={m.ticket_email_title({ client: "" })}
  title={m.ticket_email_title({ client: "" })}
>
  {#snippet headerRight()}
    <SoftButton onclick={handleSend} disabled={!canSend}>
      {#if sending}
        <Preloader class="w-4 h-4" />
        {m.ticket_email_sending()}
      {:else}
        {m.ticket_email_send()}
      {/if}
    </SoftButton>
  {/snippet}

  <div class="email-compose-body">
    <Register kind="note">
      <p class="email-plaintext-warning">
        {m.ticket_email_plaintext_warning()}
      </p>
    </Register>

    <List nested class="email-subject-list">
      <ListInput
        label={m.ticket_email_subject_placeholder()}
        type="text"
        value={subject}
        onInput={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLInputElement) {
            subject = target.value;
          }
        }}
        disabled={sending}
        inputClass="email-subject-input"
      />
    </List>

    {#if toolbarButtons.length > 0}
      <div class="email-toolbar-scroll">
        <div
          role="toolbar"
          aria-label={m.library_editor_toolbar()}
          class="email-toolbar"
        >
          <div class="email-toolbar-row">
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
                  class="ed-toolbar-btn {btn.disabled
                    ? 'ed-toolbar-btn--off'
                    : ''}"
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
  </div>
</ShellSheet>

<style>
  .email-compose-body {
    padding: var(--space-md) var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .email-plaintext-warning {
    margin: 0;
    font-size: 0.75rem;
    color: var(--muted);
  }

  :global(.email-subject-list) {
    margin: 0 !important;
  }

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

  .email-toolbar-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
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
