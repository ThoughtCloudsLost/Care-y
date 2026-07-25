/**
 * Step captions and flow copy for the demo.
 *
 * Every user-visible string is a zero-arg closure wrapping a
 * paraglide message function, so the demo stays in sync with
 * the shared i18n catalog and locale switches work at runtime.
 */

import * as m from "$lib/paraglide/messages.js";

// -----------------------------------------------------------------------
// Ticket flow captions
// -----------------------------------------------------------------------

export const ticketsSkeleton: () => string = () => m.demo_tickets_skeleton();
export const ticketsDescramble: () => string = () =>
  m.demo_tickets_descramble();
export const ticketsViewList: () => string = () => m.demo_tickets_view_list();
export const ticketsViewCards: () => string = () => m.demo_tickets_view_cards();
export const ticketsViewGrid: () => string = () => m.demo_tickets_view_grid();
export const ticketsTapCard: () => string = () => m.demo_tickets_tap_card();

// -----------------------------------------------------------------------
// Conversation flow captions
// -----------------------------------------------------------------------

export const conversationHeader: () => string = () =>
  m.demo_conversation_header();
export const conversationReveal: () => string = () =>
  m.demo_conversation_reveal();
export const conversationError: () => string = () =>
  m.demo_conversation_error();
export const conversationRetry: () => string = () =>
  m.demo_conversation_retry();
export const conversationTyping: () => string = () =>
  m.demo_conversation_typing();
export const conversationSent: () => string = () => m.demo_conversation_sent();

// -----------------------------------------------------------------------
// Search flow captions
// -----------------------------------------------------------------------

export const searchTyping: () => string = () => m.demo_search_typing();
export const searchInstant: () => string = () => m.demo_search_instant();
export const searchCoverage: () => string = () => m.demo_search_coverage();
export const searchEscalation: () => string = () => m.demo_search_escalation();
export const searchDeepResults: () => string = () =>
  m.demo_search_deep_results();
