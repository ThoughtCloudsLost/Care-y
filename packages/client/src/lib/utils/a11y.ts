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
