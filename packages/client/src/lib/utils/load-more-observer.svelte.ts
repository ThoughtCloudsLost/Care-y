import type { Attachment } from "svelte/attachments";

/**
 * Attachment factory for infinite-scroll sentinels. Observes the attached
 * element and calls `onloadmore` whenever it comes within 200px of the
 * root: the viewport by default, or `root` when given (a list inside its
 * own scroller, where the viewport would see the sentinel as soon as the
 * scroller itself is on screen). The returned cleanup disconnects the
 * observer, so removing the sentinel (or a callback identity change
 * re-running the attachment) never leaks an observer.
 */
export function loadMoreObserver(
  onloadmore: () => void,
  root?: Element,
): Attachment<HTMLElement> {
  return (el) => {
    const options: IntersectionObserverInit =
      root === undefined
        ? { rootMargin: "200px" }
        : { root, rootMargin: "200px" };
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting === true) onloadmore();
    }, options);
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  };
}
