/**
 * Svelte action that portals an element to a target container.
 *
 * Moves the element out of its current DOM position into the target
 * on mount, and returns it to its original position on destroy. This
 * lets overlays (popovers, action sheets, sheets, dialogs) escape
 * stacking contexts created by positioned ancestors.
 *
 * Usage: <div use:portal={document.body}>...</div>
 *        <div use:portal={'.k-page'}>...</div>
 */
export function portal(
  node: HTMLElement,
  target?: HTMLElement | string,
): { destroy: () => void } {
  const resolvedTarget =
    typeof target === "string"
      ? document.querySelector<HTMLElement>(target)
      : (target ?? document.body);

  if (resolvedTarget == null || resolvedTarget === node.parentElement) {
    return {
      destroy() {
        // No-op: target not found or already the parent.
      },
    };
  }

  // Preserve original position for cleanup.
  const originalParent = node.parentElement;
  const anchor = document.createComment("portal");
  originalParent?.insertBefore(anchor, node);

  resolvedTarget.appendChild(node);

  return {
    destroy() {
      // Move back to original position if the anchor is still in the DOM.
      if (anchor.parentNode != null) {
        anchor.parentNode.insertBefore(node, anchor);
        anchor.remove();
      } else {
        node.remove();
      }
    },
  };
}
