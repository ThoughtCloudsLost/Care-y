<script lang="ts">
  import { Toolbar } from "bits-ui";
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
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type {
    ToolbarState,
    ToolbarCommand,
  } from "$lib/editor/toolbar-state.js";

  interface Props {
    toolbarState: ToolbarState;
    oncommand: (command: ToolbarCommand) => void;
  }

  let { toolbarState, oncommand }: Props = $props();

  /** Heading levels to cycle through. null = paragraph. */
  const HEADING_CYCLE: readonly (number | null)[] = [null, 1, 2, 3, 4];

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

  /** Cycle to the next heading level (paragraph -> h1 -> h2 -> h3 -> h4 -> paragraph). */
  function cycleHeading(): void {
    const currentIdx = HEADING_CYCLE.indexOf(toolbarState.headingLevel);
    const nextLevel =
      HEADING_CYCLE[(currentIdx + 1) % HEADING_CYCLE.length] ?? null;
    if (nextLevel === null) {
      oncommand({ kind: "setParagraph" });
    } else {
      oncommand({ kind: "setHeading", level: nextLevel });
    }
  }
</script>

<!-- Scrollable 2-row toolbar. The outer div scrolls horizontally when
     the rows overflow (e.g. on iPhone SE). Each row is a non-wrapping
     flex container. This layout works identically in the subnavbar
     (desktop) and the keyboard-docked toolbar (mobile). -->
<div class="ed-toolbar-scroll">
  <Toolbar.Root aria-label={m.library_editor_toolbar()} class="ed-toolbar">
    <!-- Row 1: Marks, Heading + Block types -->
    <div class="ed-toolbar-row">
      <div
        class="ed-toolbar-group glass"
        role="group"
        aria-label={m.library_editor_bold()}
      >
        <Toolbar.Group
          type="multiple"
          bind:value={() => markValues, markValueNoop}
        >
          {#each marks as btn (btn.value)}
            {@const Icon = btn.icon}
            <Toolbar.GroupItem
              value={btn.value}
              aria-pressed={btn.active}
              aria-label={btn.label}
              aria-disabled={btn.disabled}
              class="ed-toolbar-btn {btn.disabled ? 'ed-toolbar-btn--off' : ''}"
              onclick={() => oncommand(btn.command)}
            >
              <Icon size={18} aria-hidden="true" />
            </Toolbar.GroupItem>
          {/each}
        </Toolbar.Group>
      </div>

      <div
        class="ed-toolbar-group glass"
        role="group"
        aria-label={m.library_editor_heading()}
      >
        <Toolbar.Button
          aria-label={m.library_editor_heading()}
          class="ed-toolbar-btn ed-toolbar-heading"
          onclick={cycleHeading}
        >
          <Heading size={18} aria-hidden="true" />
          {#if toolbarState.headingLevel !== null}
            <span class="heading-level" aria-hidden="true"
              >{toolbarState.headingLevel}</span
            >
          {/if}
        </Toolbar.Button>

        {#each blockButtons as btn (btn.command.kind)}
          {@const Icon = btn.icon}
          <Toolbar.Button
            aria-label={btn.label}
            aria-pressed={btn.pressed}
            aria-disabled={btn.disabled === true}
            class="ed-toolbar-btn {btn.disabled === true
              ? 'ed-toolbar-btn--off'
              : ''}"
            onclick={() => oncommand(btn.command)}
          >
            <Icon size={18} aria-hidden="true" />
          </Toolbar.Button>
        {/each}
      </div>
    </div>

    <!-- Row 2: Insert -->
    <div class="ed-toolbar-row">
      <div
        class="ed-toolbar-group glass"
        role="group"
        aria-label={m.library_editor_link()}
      >
        {#each insertButtons as btn (btn.command.kind)}
          {@const Icon = btn.icon}
          <Toolbar.Button
            aria-label={btn.label}
            aria-pressed={btn.pressed}
            aria-disabled={btn.disabled === true}
            class="ed-toolbar-btn {btn.disabled === true
              ? 'ed-toolbar-btn--off'
              : ''}"
            onclick={() => oncommand(btn.command)}
          >
            <Icon size={18} aria-hidden="true" />
          </Toolbar.Button>
        {/each}
      </div>
    </div>
  </Toolbar.Root>
</div>

<style>
  /* Scroll container: handles horizontal overflow when rows are wider
     than the viewport (e.g. iPhone SE). Hidden scrollbar for clean look. */
  .ed-toolbar-scroll {
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .ed-toolbar-scroll::-webkit-scrollbar {
    display: none;
  }

  /* Toolbar root: vertical stack of exactly 2 rows. width:max-content
     prevents rows from wrapping; the scroll container handles overflow. */
  :global(.ed-toolbar) {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--page-pad-x);
    width: max-content;
    min-width: 100%;
  }

  /* Each row is a non-wrapping horizontal strip of groups. */
  .ed-toolbar-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  /* Group pill: platform-adaptive surface. */
  .ed-toolbar-group {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    border-radius: var(--card-radius, 0.75rem);
    padding: 3px;
    flex-shrink: 0;
    transition: opacity 0.15s ease;
  }

  /* iOS: handled by .glass utility (shared.css) */

  /* Material: solid tonal surface. */
  :global(.k-material) .ed-toolbar-group {
    background: var(--surface-1);
  }

  :global(.ed-toolbar-btn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2.25rem;
    min-height: 2.25rem;
    border: none;
    border-radius: calc(var(--card-radius, 0.75rem) - 3px);
    background: transparent;
    color: var(--glass-text, var(--ink));
    cursor: pointer;
    flex-shrink: 0;
    transition:
      background-color 0.15s ease,
      color 0.15s ease;
  }

  :global(.ed-toolbar-btn:hover:not(:disabled)) {
    background: color-mix(
      in srgb,
      var(--glass-text, var(--ink)) 8%,
      transparent
    );
  }

  :global(.ed-toolbar-btn:active:not(:disabled)) {
    background: color-mix(
      in srgb,
      var(--glass-text, var(--ink)) 12%,
      transparent
    );
  }

  :global(.ed-toolbar-btn[aria-pressed="true"]) {
    background: color-mix(in srgb, var(--brand-accent) 20%, transparent);
    color: var(--brand-text);
  }

  :global(.ed-toolbar-btn:disabled),
  :global(.ed-toolbar-btn--off) {
    opacity: 0.3;
    cursor: default;
  }

  :global(.ed-toolbar-heading) {
    gap: 2px;
    position: relative;
  }

  .heading-level {
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--brand-text);
    line-height: 1;
  }

  /* High contrast: drop glass effects, use system canvas colors */
  @media (prefers-contrast: more) {
    .ed-toolbar-group {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      background: Canvas;
      border: 1px solid CanvasText;
    }
  }
</style>
