// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { EditorView } from "prosemirror-view";
import { EditorState } from "prosemirror-state";
import { undo, redo, history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { Node as PMNode } from "prosemirror-model";
import { kbArticleSchema } from "./prosemirror-schema.js";

/**
 * These tests verify ProseMirror's EditorView lifecycle and transaction
 * dispatch in jsdom, which is the foundation the useProseMirror bridge
 * builds on. The Svelte-specific reactivity (createSubscriber + $state)
 * is tested through component E2E tests.
 *
 * Testing useProseMirror() directly would require Svelte component
 * initialization context for onMount. The function's behavior is:
 *   1. Create EditorState + EditorView in onMount (tested here via
 *      direct EditorView instantiation)
 *   2. Proxy state updates through dispatchTransaction (tested here)
 *   3. Cleanup via view.destroy() (tested here)
 */

let container: HTMLDivElement | undefined;

afterEach(() => {
  container?.remove();
  container = undefined;
});

function createContainer(): HTMLDivElement {
  container = document.createElement("div");
  document.body.appendChild(container);
  return container;
}

function createEditorState(docJson?: Record<string, unknown>): EditorState {
  return EditorState.create({
    schema: kbArticleSchema,
    doc: docJson ? PMNode.fromJSON(kbArticleSchema, docJson) : undefined,
    plugins: [
      keymap({ "Mod-z": undo, "Mod-Shift-z": redo, "Mod-y": redo }),
      keymap(baseKeymap),
      history(),
    ],
  });
}

describe("EditorView lifecycle (useProseMirror foundation)", () => {
  it("mounts into a container element", () => {
    const el = createContainer();
    const state = createEditorState();
    const view = new EditorView(el, { state });

    expect(view.dom.parentNode).toBe(el);
    expect(view.state.doc.type.name).toBe("doc");

    view.destroy();
  });

  it("updates state via dispatchTransaction", () => {
    const el = createContainer();
    const state = createEditorState();
    const transactions: number[] = [];

    const view = new EditorView(el, {
      state,
      dispatchTransaction(tr) {
        transactions.push(tr.steps.length);
        const newState = view.state.apply(tr);
        view.updateState(newState);
      },
    });

    // Insert text
    const tr = view.state.tr.insertText("hello", 1);
    view.dispatch(tr);

    expect(view.state.doc.textContent).toBe("hello");
    expect(transactions.length).toBeGreaterThanOrEqual(1);

    view.destroy();
  });

  it("loads from existing ProseMirror JSON document", () => {
    const el = createContainer();
    const docJson = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Existing Article" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Body text here." }],
        },
      ],
    };
    const state = createEditorState(docJson);
    const view = new EditorView(el, { state });

    expect(view.state.doc.textContent).toBe("Existing ArticleBody text here.");
    expect(view.state.doc.firstChild!.type.name).toBe("heading");
    expect(view.state.doc.firstChild!.attrs.level).toBe(1);

    view.destroy();
  });

  it("supports undo/redo via the history plugin", () => {
    const el = createContainer();
    const state = createEditorState();
    const view = new EditorView(el, {
      state,
      dispatchTransaction(tr) {
        const newState = view.state.apply(tr);
        view.updateState(newState);
      },
    });

    // Insert text
    view.dispatch(view.state.tr.insertText("test", 1));
    expect(view.state.doc.textContent).toBe("test");

    // Undo
    const undid = undo(view.state, (tr) => {
      view.dispatch(tr);
    });
    expect(undid).toBe(true);
    expect(view.state.doc.textContent).toBe("");

    // Redo
    const redid = redo(view.state, (tr) => {
      view.dispatch(tr);
    });
    expect(redid).toBe(true);
    expect(view.state.doc.textContent).toBe("test");

    view.destroy();
  });

  it("cleans up DOM on destroy", () => {
    const el = createContainer();
    const state = createEditorState();
    const view = new EditorView(el, { state });

    const editorDom = view.dom;
    expect(el.contains(editorDom)).toBe(true);

    view.destroy();
    expect(el.contains(editorDom)).toBe(false);
  });

  it("calls onTransaction callback for each dispatched transaction", () => {
    const el = createContainer();
    const state = createEditorState();
    let callCount = 0;

    const view = new EditorView(el, {
      state,
      dispatchTransaction(tr) {
        const newState = view.state.apply(tr);
        view.updateState(newState);
        callCount++;
      },
    });

    view.dispatch(view.state.tr.insertText("a", 1));
    view.dispatch(view.state.tr.insertText("b", 2));

    expect(callCount).toBe(2);

    view.destroy();
  });
});
