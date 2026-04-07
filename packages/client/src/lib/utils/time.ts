/**
 * Time utilities for the ticket detail chat view.
 *
 * formatRelativeTime lives in format-time.ts (dashboard).
 * This module adds chat-specific helpers.
 */

import * as m from "$lib/paraglide/messages.js";

/**
 * Returns a date separator label for the chat timeline.
 * Uses Paraglide i18n for "Today" and "Yesterday", browser locale for
 * month names. Shows "Month Day" or "Month Day, Year" if the year
 * differs from the current year.
 */
export function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return m.ticket_date_today();
  if (diffDays === 1) return m.ticket_date_yesterday();

  const sameYear = date.getFullYear() === now.getFullYear();
  const options: Intl.DateTimeFormatOptions = sameYear
    ? { month: "long", day: "numeric" }
    : { month: "long", day: "numeric", year: "numeric" };

  return date.toLocaleDateString(undefined, options);
}

/**
 * Returns true if two follow-ups should have a date separator between them.
 * Compares calendar dates (not timestamps).
 */
export function needsDateSeparator(
  currentDateStr: string,
  previousDateStr: string | undefined,
): boolean {
  if (previousDateStr === undefined) return true;

  const current = new Date(currentDateStr);
  const previous = new Date(previousDateStr);

  return (
    current.getFullYear() !== previous.getFullYear() ||
    current.getMonth() !== previous.getMonth() ||
    current.getDate() !== previous.getDate()
  );
}
