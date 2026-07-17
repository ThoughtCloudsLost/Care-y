/**
 * Instance surface TicketCompose exposes to hosts via bind:this.
 *
 * Lives in a plain module (same pattern as follow-up-timeline-types)
 * because type exports from .svelte files do not resolve under the
 * eslint TS project service. Keep in sync with the exported functions
 * in TicketCompose.svelte.
 */
export interface TicketComposeHandle {
  /** Expand into encrypted-reply mode. */
  activateReply: () => void;
  /** Expand into SMS mode. Hosts gate this behind their exposure hint. */
  activateSms: () => void;
  /** Collapse without touching the stored draft. */
  reset: () => void;
}
