/**
 * Pure toolbar state derivation from ProseMirror EditorState.
 *
 * No DOM dependency. The EditorToolbar component receives the derived
 * ToolbarState and an `oncommand` callback. ProseMirror command
 * dispatch stays in the parent editor component, keeping the toolbar
 * testable without a browser environment.
 */

import type { EditorState, Command } from "prosemirror-state";
import type { MarkType, NodeType, Schema } from "prosemirror-model";
import { toggleMark, setBlockType, wrapIn, lift } from "prosemirror-commands";
import { wrapInList, liftListItem } from "prosemirror-schema-list";
import { undo, redo } from "prosemirror-history";

// ---------------------------------------------------------------------------
// ToolbarState (read-only snapshot of editor formatting state)
// ---------------------------------------------------------------------------

export interface ToolbarState {
  readonly boldActive: boolean;
  readonly italicActive: boolean;
  readonly strikethroughActive: boolean;
  readonly codeActive: boolean;
  readonly linkActive: boolean;
  readonly blockquoteActive: boolean;
  readonly codeBlockActive: boolean;
  readonly bulletListActive: boolean;
  readonly orderedListActive: boolean;
  readonly headingLevel: number | null;
  readonly insideTable: boolean;
  readonly canBold: boolean;
  readonly canItalic: boolean;
  readonly canStrikethrough: boolean;
  readonly canCode: boolean;
  readonly canLink: boolean;
  readonly canBlockquote: boolean;
  readonly canCodeBlock: boolean;
  readonly canBulletList: boolean;
  readonly canOrderedList: boolean;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
}

// ---------------------------------------------------------------------------
// ToolbarCommand (discriminated union for type-safe command dispatch)
// ---------------------------------------------------------------------------

export type ToolbarCommand =
  | { kind: "toggleBold" }
  | { kind: "toggleItalic" }
  | { kind: "toggleStrikethrough" }
  | { kind: "toggleCode" }
  | { kind: "toggleLink" }
  | { kind: "wrapInBulletList" }
  | { kind: "wrapInOrderedList" }
  | { kind: "wrapInBlockquote" }
  | { kind: "setCodeBlock" }
  | { kind: "setParagraph" }
  | { kind: "setHeading"; level: number }
  | { kind: "insertImage" }
  | { kind: "insertTable" }
  | { kind: "insertHorizontalRule" }
  | { kind: "attachFile" }
  | { kind: "undo" }
  | { kind: "redo" };

// ---------------------------------------------------------------------------
// Query helpers (exported for unit testing)
// ---------------------------------------------------------------------------

/** Check if a mark is active in the current selection or at cursor. */
export function markActive(state: EditorState, type: MarkType): boolean {
  const { from, $from, to, empty } = state.selection;
  if (empty) {
    return type.isInSet(state.storedMarks ?? $from.marks()) !== undefined;
  }
  return state.doc.rangeHasMark(from, to, type);
}

/** Undefined-safe wrapper: returns false if the mark type doesn't exist in the schema. */
function markOn(state: EditorState, type: MarkType | undefined): boolean {
  return type !== undefined && markActive(state, type);
}

/** Check if the selection is inside a node of the given type. */
export function blockTypeActive(
  state: EditorState,
  type: NodeType,
  attrs?: Record<string, unknown>,
): boolean {
  const { $from } = state.selection;
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    if (node.type === type) {
      if (attrs === undefined) return true;
      const nodeAttrs = node.attrs;
      // eslint-disable-next-line security/detect-object-injection -- k is from Object.entries of a trusted attrs param
      return Object.entries(attrs).every(([k, v]) => nodeAttrs[k] === v);
    }
  }
  return false;
}

/** Undefined-safe wrapper: returns false if the node type doesn't exist in the schema. */
function blockOn(state: EditorState, type: NodeType | undefined): boolean {
  return type !== undefined && blockTypeActive(state, type);
}

/**
 * Get the heading level at the cursor position, or null if not inside
 * a heading. Checks the directly-containing block (depth walk from
 * selection to find the nearest block parent).
 */
function activeHeadingLevel(state: EditorState): number | null {
  const { $from } = state.selection;
  const headingType = state.schema.nodes.heading;
  if (headingType === undefined) return null;

  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    if (node.type === headingType) {
      const level: unknown = node.attrs.level;
      return typeof level === "number" ? level : null;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Per-schema command cache (avoids 14 closure allocations per keystroke)
// ---------------------------------------------------------------------------

interface CachedCommands {
  toggleBold?: Command;
  toggleItalic?: Command;
  toggleStrikethrough?: Command;
  toggleCode?: Command;
  toggleLink?: Command;
  wrapBlockquote?: Command;
  liftBlockquote: Command;
  setCodeBlock?: Command;
  setParagraph?: Command;
  wrapBulletList?: Command;
  wrapOrderedList?: Command;
  liftListItem?: Command;
}

const commandCache = new WeakMap<Schema, CachedCommands>();

function getCommands(schema: Schema): CachedCommands {
  let cmds = commandCache.get(schema);
  if (cmds !== undefined) return cmds;

  cmds = {
    toggleBold: schema.marks.strong
      ? toggleMark(schema.marks.strong)
      : undefined,
    toggleItalic: schema.marks.em ? toggleMark(schema.marks.em) : undefined,
    toggleStrikethrough: schema.marks.strikethrough
      ? toggleMark(schema.marks.strikethrough)
      : undefined,
    toggleCode: schema.marks.code ? toggleMark(schema.marks.code) : undefined,
    toggleLink: schema.marks.link ? toggleMark(schema.marks.link) : undefined,
    wrapBlockquote: schema.nodes.blockquote
      ? wrapIn(schema.nodes.blockquote)
      : undefined,
    liftBlockquote: lift,
    setCodeBlock: schema.nodes.code_block
      ? setBlockType(schema.nodes.code_block)
      : undefined,
    setParagraph: schema.nodes.paragraph
      ? setBlockType(schema.nodes.paragraph)
      : undefined,
    wrapBulletList: schema.nodes.bullet_list
      ? wrapInList(schema.nodes.bullet_list)
      : undefined,
    wrapOrderedList: schema.nodes.ordered_list
      ? wrapInList(schema.nodes.ordered_list)
      : undefined,
    liftListItem: schema.nodes.list_item
      ? liftListItem(schema.nodes.list_item)
      : undefined,
  };
  commandCache.set(schema, cmds);
  return cmds;
}

/** Dry-run a command to check if it can execute. */
function canRun(state: EditorState, command: Command | undefined): boolean {
  if (command === undefined) return false;
  return command(state);
}

// ---------------------------------------------------------------------------
// Derive toolbar state from EditorState
// ---------------------------------------------------------------------------

export function deriveToolbarState(state: EditorState): ToolbarState {
  const { schema } = state;
  const cmds = getCommands(schema);

  const bqActive = blockOn(state, schema.nodes.blockquote);
  const cbActive = blockOn(state, schema.nodes.code_block);
  const blActive = blockOn(state, schema.nodes.bullet_list);
  const olActive = blockOn(state, schema.nodes.ordered_list);

  return {
    boldActive: markOn(state, schema.marks.strong),
    italicActive: markOn(state, schema.marks.em),
    strikethroughActive: markOn(state, schema.marks.strikethrough),
    codeActive: markOn(state, schema.marks.code),
    linkActive: markOn(state, schema.marks.link),
    blockquoteActive: bqActive,
    codeBlockActive: cbActive,
    bulletListActive: blActive,
    orderedListActive: olActive,
    headingLevel: activeHeadingLevel(state),
    insideTable: blockOn(state, schema.nodes.table),

    canBold: canRun(state, cmds.toggleBold),
    canItalic: canRun(state, cmds.toggleItalic),
    canStrikethrough: canRun(state, cmds.toggleStrikethrough),
    canCode: canRun(state, cmds.toggleCode),
    canLink: canRun(state, cmds.toggleLink),
    // When already inside, the button toggles off (lift/unwrap), so it stays enabled.
    canBlockquote: bqActive || canRun(state, cmds.wrapBlockquote),
    canCodeBlock: cbActive || canRun(state, cmds.setCodeBlock),
    canBulletList: blActive || canRun(state, cmds.wrapBulletList),
    canOrderedList: olActive || canRun(state, cmds.wrapOrderedList),
    canUndo: canRun(state, undo),
    canRedo: canRun(state, redo),
  };
}
