/**
 * Svelte 5 reactivity bridge for ProseMirror.
 *
 * Uses `createSubscriber` to make EditorView state reads reactive.
 * Every ProseMirror transaction triggers a Svelte re-render for any
 * component that reads `editor.view` or `editor.state`.
 *
 * Must be called during component initialization (top-level script).
 */

import { onMount } from "svelte";
import { createSubscriber } from "svelte/reactivity";
import { EditorView, type NodeViewConstructor } from "prosemirror-view";
import { EditorState, type Plugin, type Transaction } from "prosemirror-state";
import type { Node, Schema } from "prosemirror-model";

export interface ProseMirrorEditor {
  readonly view: EditorView | null;
  readonly state: EditorState | null;
}

export interface UseProseMirrorOptions {
  schema: Schema;
  plugins: readonly Plugin[];
  doc?: Node;
  nodeViews?: Record<string, NodeViewConstructor>;
  onTransaction?: (tr: Transaction) => void;
}

export function useProseMirror(
  getElement: () => HTMLElement | null,
  options: UseProseMirrorOptions,
): ProseMirrorEditor {
  let view: EditorView | null = null;
  let currentState: EditorState | null = null;

  // createSubscriber returns a function that registers a reactive
  // dependency when called. The `start` callback receives `update`,
  // which we store and invoke from dispatchTransaction to invalidate
  // any Svelte effects/templates reading the editor state.
  let notifySvelte: (() => void) | null = null;

  const subscribe = createSubscriber((update) => {
    notifySvelte = update;
    return () => {
      notifySvelte = null;
    };
  });

  onMount(() => {
    const el = getElement();
    if (el === null) return;

    const state = EditorState.create({
      schema: options.schema,
      doc: options.doc,
      plugins: [...options.plugins],
    });

    const editorView = new EditorView(el, {
      state,
      nodeViews: options.nodeViews,
      dispatchTransaction(tr: Transaction): void {
        const newState = editorView.state.apply(tr);
        editorView.updateState(newState);
        currentState = newState;
        options.onTransaction?.(tr);
        notifySvelte?.();
      },
    });

    view = editorView;
    currentState = state;
    notifySvelte?.();

    return (): void => {
      editorView.destroy();
      view = null;
      currentState = null;
      notifySvelte?.();
    };
  });

  return {
    get view(): EditorView | null {
      subscribe();
      return view;
    },
    get state(): EditorState | null {
      subscribe();
      return currentState;
    },
  };
}
