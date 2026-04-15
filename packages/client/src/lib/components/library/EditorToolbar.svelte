<script lang="ts">
  import { Toolbar } from "bits-ui";
  // care-y-ignore-next-line no-mixed-konsta-bits -- Bits UI Toolbar for ARIA + Konsta Button for styling (Design Decision: Toolbar implementation)
  import { List as KList, ListItem } from "konsta/svelte";
  import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading,
    List,
    ListOrdered,
    Quote,
    SquareCode,
    Link,
    Image,
    Paperclip,
    Table,
    Minus,
    Undo2,
    Redo2,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import ShellPopover from "$lib/shell/ShellPopover.svelte";
  import type {
    ToolbarState,
    ToolbarCommand,
  } from "$lib/editor/toolbar-state.js";

  interface Props {
    toolbarState: ToolbarState;
    oncommand: (command: ToolbarCommand) => void;
  }

  let { toolbarState, oncommand }: Props = $props();

  let headingPopoverOpen = $state(false);
  let headingAnchorEl = $state<HTMLElement | undefined>(undefined);

  // ---------------------------------------------------------------------------
  // Button config (data-driven to avoid 16 near-identical template blocks)
  // ---------------------------------------------------------------------------

  interface MarkDef {
    value: string;
    active: boolean;
    disabled: boolean;
    label: string;
    icon: typeof Bold;
    command: ToolbarCommand;
  }

  interface ButtonDef {
    label: string;
    icon: typeof Bold;
    command: ToolbarCommand;
    pressed?: boolean;
    disabled?: boolean;
  }

  let marks: MarkDef[] = $derived([
    {
      value: "bold",
      active: toolbarState.boldActive,
      disabled: !toolbarState.canBold,
      label: m.library_editor_bold(),
      icon: Bold,
      command: { kind: "toggleBold" },
    },
    {
      value: "italic",
      active: toolbarState.italicActive,
      disabled: !toolbarState.canItalic,
      label: m.library_editor_italic(),
      icon: Italic,
      command: { kind: "toggleItalic" },
    },
    {
      value: "strikethrough",
      active: toolbarState.strikethroughActive,
      disabled: !toolbarState.canStrikethrough,
      label: m.library_editor_strikethrough(),
      icon: Strikethrough,
      command: { kind: "toggleStrikethrough" },
    },
    {
      value: "code",
      active: toolbarState.codeActive,
      disabled: !toolbarState.canCode,
      label: m.library_editor_code(),
      icon: Code,
      command: { kind: "toggleCode" },
    },
  ]);

  let markValues = $derived(marks.filter((b) => b.active).map((b) => b.value));

  // No-op setter: ProseMirror owns mark state, not the Toolbar.Group.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  function markValueNoop(): void {}

  let blockButtons: ButtonDef[] = $derived([
    {
      label: m.library_editor_bullet_list(),
      icon: List,
      command: { kind: "wrapInBulletList" },
      pressed: toolbarState.bulletListActive,
      disabled: !toolbarState.canBulletList,
    },
    {
      label: m.library_editor_ordered_list(),
      icon: ListOrdered,
      command: { kind: "wrapInOrderedList" },
      pressed: toolbarState.orderedListActive,
      disabled: !toolbarState.canOrderedList,
    },
    {
      label: m.library_editor_blockquote(),
      icon: Quote,
      command: { kind: "wrapInBlockquote" },
      pressed: toolbarState.blockquoteActive,
      disabled: !toolbarState.canBlockquote,
    },
    {
      label: m.library_editor_code_block(),
      icon: SquareCode,
      command: { kind: "setCodeBlock" },
      pressed: toolbarState.codeBlockActive,
      disabled: !toolbarState.canCodeBlock,
    },
  ]);

  let insertButtons: ButtonDef[] = $derived([
    {
      label: m.library_editor_link(),
      icon: Link,
      command: { kind: "toggleLink" },
      pressed: toolbarState.linkActive,
      disabled: !toolbarState.canLink,
    },
    {
      label: m.library_editor_image(),
      icon: Image,
      command: { kind: "insertImage" },
    },
    {
      label: m.library_editor_attach_file(),
      icon: Paperclip,
      command: { kind: "attachFile" },
    },
    {
      label: m.library_editor_table(),
      icon: Table,
      command: { kind: "insertTable" },
    },
    {
      label: m.library_editor_horizontal_rule(),
      icon: Minus,
      command: { kind: "insertHorizontalRule" },
    },
  ]);

  let historyButtons: ButtonDef[] = $derived([
    {
      label: m.library_editor_undo(),
      icon: Undo2,
      command: { kind: "undo" },
      disabled: !toolbarState.canUndo,
    },
    {
      label: m.library_editor_redo(),
      icon: Redo2,
      command: { kind: "redo" },
      disabled: !toolbarState.canRedo,
    },
  ]);

  const HEADING_OPTIONS: readonly {
    level: number | null;
    label: () => string;
  }[] = [
    { level: null, label: () => m.library_editor_paragraph() },
    ...[1, 2, 3, 4].map((level) => ({
      level,
      label: () => m.library_editor_heading_level({ level: String(level) }),
    })),
  ];

  function handleHeadingSelect(level: number | null): void {
    if (level === null) {
      oncommand({ kind: "setParagraph" });
    } else {
      oncommand({ kind: "setHeading", level });
    }
    headingPopoverOpen = false;
  }
</script>

<div class="ed-toolbar-scroll">
  <Toolbar.Root aria-label={m.library_editor_toolbar()} class="ed-toolbar">
    <!-- Mark toggles: bold, italic, strikethrough, inline code -->
    <Toolbar.Group type="multiple" bind:value={() => markValues, markValueNoop}>
      {#each marks as btn (btn.value)}
        {@const Icon = btn.icon}
        <Toolbar.GroupItem
          value={btn.value}
          aria-pressed={btn.active}
          aria-label={btn.label}
          disabled={btn.disabled}
          class="ed-toolbar-btn"
          onclick={() => oncommand(btn.command)}
        >
          <Icon size={18} aria-hidden="true" />
        </Toolbar.GroupItem>
      {/each}
    </Toolbar.Group>

    <div class="ed-toolbar-sep" aria-hidden="true"></div>

    <!-- Heading dropdown (unique structure, not data-driven) -->
    <span class="heading-anchor" bind:this={headingAnchorEl}>
      <Toolbar.Button
        aria-label={m.library_editor_heading()}
        aria-haspopup="listbox"
        aria-expanded={headingPopoverOpen}
        class="ed-toolbar-btn ed-toolbar-heading"
        onclick={() => {
          headingPopoverOpen = !headingPopoverOpen;
        }}
      >
        <Heading size={18} aria-hidden="true" />
        {#if toolbarState.headingLevel !== null}
          <span class="heading-level" aria-hidden="true"
            >{toolbarState.headingLevel}</span
          >
        {/if}
      </Toolbar.Button>
    </span>

    <!-- Block type buttons -->
    {#each blockButtons as btn (btn.command.kind)}
      {@const Icon = btn.icon}
      <Toolbar.Button
        aria-label={btn.label}
        aria-pressed={btn.pressed}
        disabled={btn.disabled}
        class="ed-toolbar-btn"
        onclick={() => oncommand(btn.command)}
      >
        <Icon size={18} aria-hidden="true" />
      </Toolbar.Button>
    {/each}

    <div class="ed-toolbar-sep" aria-hidden="true"></div>

    <!-- Insert buttons -->
    {#each insertButtons as btn (btn.command.kind)}
      {@const Icon = btn.icon}
      <Toolbar.Button
        aria-label={btn.label}
        aria-pressed={btn.pressed}
        disabled={btn.disabled}
        class="ed-toolbar-btn"
        onclick={() => oncommand(btn.command)}
      >
        <Icon size={18} aria-hidden="true" />
      </Toolbar.Button>
    {/each}

    <div class="ed-toolbar-sep" aria-hidden="true"></div>

    <!-- Undo/Redo -->
    {#each historyButtons as btn (btn.command.kind)}
      {@const Icon = btn.icon}
      <Toolbar.Button
        aria-label={btn.label}
        disabled={btn.disabled}
        class="ed-toolbar-btn"
        onclick={() => oncommand(btn.command)}
      >
        <Icon size={18} aria-hidden="true" />
      </Toolbar.Button>
    {/each}
  </Toolbar.Root>
</div>

<ShellPopover
  opened={headingPopoverOpen}
  target={headingAnchorEl}
  placement="bottom"
  ondismiss={() => {
    headingPopoverOpen = false;
  }}
>
  <KList nested role="listbox" aria-label={m.library_editor_heading()}>
    {#each HEADING_OPTIONS as opt (opt.level)}
      {@const isSelected =
        opt.level === null
          ? toolbarState.headingLevel === null
          : toolbarState.headingLevel === opt.level}
      <ListItem
        title={opt.label()}
        role="option"
        aria-selected={isSelected}
        onclick={() => handleHeadingSelect(opt.level)}
      />
    {/each}
  </KList>
</ShellPopover>

<style>
  .ed-toolbar-scroll {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .ed-toolbar-scroll::-webkit-scrollbar {
    display: none;
  }

  :global(.ed-toolbar) {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-wrap: nowrap;
    white-space: nowrap;
    padding: 0.25rem var(--page-pad-x);
  }

  :global(.ed-toolbar-btn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2.75rem;
    min-height: 2.75rem;
    border: none;
    border-radius: 0.5rem;
    background: transparent;
    color: var(--ink);
    cursor: pointer;
    flex-shrink: 0;
    transition: background-color 0.15s ease;
  }

  :global(.ed-toolbar-btn:hover:not(:disabled)) {
    background: var(--surface-1);
  }

  :global(.ed-toolbar-btn:active:not(:disabled)) {
    background: var(--surface-1);
    opacity: 0.8;
  }

  :global(.ed-toolbar-btn[aria-pressed="true"]) {
    background: color-mix(in srgb, var(--brand-accent) 15%, transparent);
    color: var(--brand-text);
  }

  :global(.ed-toolbar-btn:disabled) {
    opacity: 0.3;
    cursor: default;
  }

  :global(.ed-toolbar-heading) {
    gap: 2px;
    position: relative;
  }

  .heading-anchor {
    display: inline-flex;
    flex-shrink: 0;
  }

  .heading-level {
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--brand-text);
    line-height: 1;
  }

  .ed-toolbar-sep {
    width: 1px;
    height: 1.25rem;
    background: var(--divider);
    flex-shrink: 0;
    margin: 0 0.25rem;
  }
</style>
