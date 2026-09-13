/**
 * Returns a keydown handler that activates on Enter or Space,
 * matching native button activation behavior for role="button" divs.
 *
 * Space is preventDefault'd to avoid page scrolling. Enter is not,
 * since browsers don't scroll on Enter and some contexts (links,
 * forms) rely on its default behavior propagating.
 */
export function onKeyActivate(handler: () => void): (e: KeyboardEvent) => void {
  return (e: KeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") {
      if (e.key === " ") e.preventDefault();
      handler();
    }
  };
}

/**
 * Svelte action that finds the checkbox input inside a Konsta Toggle
 * wrapper and sets its aria-label. Konsta Toggle renders an
 * `<input type="checkbox">` without an accessible label; this action
 * bridges the gap when the Toggle sits inside a ListItem.
 */
export function labelToggleInput(node: HTMLElement, label: string): void {
  const input = node.querySelector<HTMLInputElement>('input[type="checkbox"]');
  if (input) input.setAttribute("aria-label", label);
}
