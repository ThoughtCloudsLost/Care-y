/**
 * Reactive bridge between route pages and ArticleEditor.
 *
 * Route pages own the shell (navbar, subnavbar). ArticleEditor owns
 * the ProseMirror state. The bridge lets ArticleEditor populate
 * toolbar state and save callbacks that the route page reads to
 * render the toolbar in the subnavbar and the save button in the navbar.
 *
 * Same reactive-shared-object pattern as usePTR().
 */

import type { ToolbarState, ToolbarCommand } from "./toolbar-state.js";

export interface EditorBridge {
  /** Current toolbar button states (active, disabled, etc.). */
  toolbarState: ToolbarState | null;
  /** Dispatch a toolbar command to the ProseMirror editor. */
  dispatchCommand: ((cmd: ToolbarCommand) => void) | null;
  /** Trigger save/publish. Returns when mutation settles. */
  save: (() => Promise<void>) | null;
  /** Whether a save/publish mutation is in flight. */
  saving: boolean;
  /** Whether the article has enough content to publish. */
  canPublish: boolean;
  /** Whether inline a11y decorations are visible. */
  a11yVisible: boolean;
  /** Toggle a11y decoration visibility. */
  setA11yVisible: ((visible: boolean) => void) | null;
  /** Live count of a11y issues (always updated, even when decorations hidden). */
  a11yIssueCount: number;
  /** True while the editor contenteditable area has focus. */
  editorFocused: boolean;
  /** True when editor content differs from the initial loaded state. */
  dirty: boolean;
}

export function createEditorBridge(): EditorBridge {
  const bridge: EditorBridge = $state({
    toolbarState: null,
    dispatchCommand: null,
    save: null,
    saving: false,
    canPublish: false,
    a11yVisible: false,
    setA11yVisible: null,
    a11yIssueCount: 0,
    editorFocused: false,
    dirty: false,
  });
  return bridge;
}
