/**
 * Shared toolbar command dispatch for ProseMirror editors.
 *
 * Both ArticleEditor and FormContentEditor use the same set of
 * formatting commands (bold, italic, lists, headings, etc).
 * Editor-specific commands (image upload, file attach, table insert)
 * are handled via the onEditorAction callback.
 */

import type { EditorView } from "prosemirror-view";
import { setBlockType, toggleMark, wrapIn, lift } from "prosemirror-commands";
import { wrapInList, liftListItem } from "prosemirror-schema-list";
import { undo, redo } from "prosemirror-history";
import { editorSchema } from "./prosemirror-schema.js";
import { blockTypeActive, type ToolbarCommand } from "./toolbar-state.js";

/**
 * Commands that are editor-specific and cannot be handled generically.
 * The hosting editor provides its own handler for these.
 */
export type EditorAction =
  | { action: "insertImage" }
  | { action: "insertTable" }
  | { action: "insertHorizontalRule" }
  | { action: "attachFile" }
  | { action: "toggleLink" };

/**
 * Dispatch a toolbar command against the given EditorView.
 *
 * Formatting commands (bold, italic, lists, headings, undo, redo) are
 * executed directly. Commands that require editor-specific logic (image
 * upload, link sheet, table insert) are forwarded to onEditorAction.
 *
 * Callers must call view.focus() after this returns if desired.
 */
export function dispatchToolbarCommand(
  view: EditorView,
  cmd: ToolbarCommand,
  onEditorAction: (action: EditorAction) => void,
): void {
  const { state, dispatch } = view;

  switch (cmd.kind) {
    case "toggleBold":
      if (editorSchema.marks.strong)
        toggleMark(editorSchema.marks.strong)(state, dispatch);
      break;
    case "toggleItalic":
      if (editorSchema.marks.em)
        toggleMark(editorSchema.marks.em)(state, dispatch);
      break;
    case "toggleStrikethrough":
      if (editorSchema.marks.strikethrough)
        toggleMark(editorSchema.marks.strikethrough)(state, dispatch);
      break;
    case "toggleCode":
      if (editorSchema.marks.code)
        toggleMark(editorSchema.marks.code)(state, dispatch);
      break;
    case "toggleLink":
      onEditorAction({ action: "toggleLink" });
      break;
    case "wrapInBulletList":
      if (editorSchema.nodes.bullet_list) {
        if (
          blockTypeActive(state, editorSchema.nodes.bullet_list) &&
          editorSchema.nodes.list_item
        ) {
          liftListItem(editorSchema.nodes.list_item)(state, dispatch);
        } else {
          wrapInList(editorSchema.nodes.bullet_list)(state, dispatch);
        }
      }
      break;
    case "wrapInOrderedList":
      if (editorSchema.nodes.ordered_list) {
        if (
          blockTypeActive(state, editorSchema.nodes.ordered_list) &&
          editorSchema.nodes.list_item
        ) {
          liftListItem(editorSchema.nodes.list_item)(state, dispatch);
        } else {
          wrapInList(editorSchema.nodes.ordered_list)(state, dispatch);
        }
      }
      break;
    case "wrapInBlockquote":
      if (editorSchema.nodes.blockquote) {
        if (blockTypeActive(state, editorSchema.nodes.blockquote)) {
          lift(state, dispatch);
        } else {
          wrapIn(editorSchema.nodes.blockquote)(state, dispatch);
        }
      }
      break;
    case "setCodeBlock": {
      const codeBlock = editorSchema.nodes.code_block;
      const para = editorSchema.nodes.paragraph;
      if (codeBlock && para) {
        if (blockTypeActive(state, codeBlock)) {
          setBlockType(para)(state, dispatch);
        } else {
          setBlockType(codeBlock)(state, dispatch);
        }
      }
      break;
    }
    case "setParagraph":
      if (editorSchema.nodes.paragraph)
        setBlockType(editorSchema.nodes.paragraph)(state, dispatch);
      break;
    case "setHeading":
      if (editorSchema.nodes.heading)
        setBlockType(editorSchema.nodes.heading, {
          level: cmd.level,
        })(state, dispatch);
      break;
    case "insertImage":
      onEditorAction({ action: "insertImage" });
      break;
    case "insertTable":
      onEditorAction({ action: "insertTable" });
      break;
    case "insertHorizontalRule":
      onEditorAction({ action: "insertHorizontalRule" });
      break;
    case "attachFile":
      onEditorAction({ action: "attachFile" });
      break;
    case "undo":
      undo(state, dispatch);
      break;
    case "redo":
      redo(state, dispatch);
      break;
  }
}
