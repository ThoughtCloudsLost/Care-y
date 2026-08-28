/**
 * DOM id convention for portal thread messages.
 *
 * The search overlay scrolls to a match by element id, so the thread that
 * renders the element and the page that drives the overlay have to agree on
 * one string. Kept in a plain module rather than the component so both sides
 * import the same function.
 */

export function portalMessageElementId(messageId: string): string {
  return `pm-${messageId}`;
}
