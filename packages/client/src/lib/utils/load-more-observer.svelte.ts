import type { Attachment } from "svelte/attachments";

/**
 * Attachment factory for infinite-scroll sentinels. Observes the attached
 * element and calls `onloadmore` whenever it comes within 200px of the
 * viewport. The returned cleanup disconnects the observer, so removing the
 * sentinel (or a callback identity change re-running the attachment) never
 * leaks an observer.
 */
export function loadMoreObserver(
  onloadmore: () => void,
): Attachment<HTMLElement> {
  return (el) => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting === true) onloadmore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  };
}
