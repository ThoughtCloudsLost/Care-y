/**
 * Distance in px from the top of `scroller`'s scrollable content to the
 * top of `el`. Stays the same wherever the scroller is currently scrolled,
 * so a list inside a scroller can turn the scroller's `scrollTop` into
 * its own scroll position by subtracting it.
 */
export function offsetWithinScroller(
  el: Element,
  scroller: HTMLElement,
): number {
  return (
    el.getBoundingClientRect().top -
    scroller.getBoundingClientRect().top +
    scroller.scrollTop
  );
}
