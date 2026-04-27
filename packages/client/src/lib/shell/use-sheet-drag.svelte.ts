/**
 * Swipe-to-dismiss gesture for bottom sheets.
 *
 * Thin wrapper around useDragDismiss configured for Y-axis, positive
 * direction (drag down to dismiss).
 */

import {
  useDragDismiss,
  type DragDismissReturn,
} from "./use-drag-dismiss.svelte";

export interface SheetDragConfig {
  readonly ondismiss: () => void;
  readonly opened: boolean;
  readonly handleEl: HTMLElement | undefined;
}

export type SheetDragReturn = DragDismissReturn;

export function useSheetDrag(config: SheetDragConfig): SheetDragReturn {
  return useDragDismiss({
    get ondismiss() {
      return config.ondismiss;
    },
    get opened() {
      return config.opened;
    },
    get handleEl() {
      return config.handleEl;
    },
    axis: "y",
    direction: 1,
  });
}
