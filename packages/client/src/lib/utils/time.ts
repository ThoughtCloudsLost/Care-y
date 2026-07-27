/**
 * Time and formatting utilities for the ticket detail chat view.
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
 * Formats an ISO timestamp as a short calendar date (e.g., Jan 15, 2026).
 * Used for record metadata such as created dates on list rows.
 *
 * The formatter is constructed once at module scope. Intl.DateTimeFormat is
 * expensive to build, and list surfaces call this once per rendered row.
 */
const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function formatShortDate(iso: string): string {
  return shortDateFormatter.format(new Date(iso));
}

/**
 * Formats a duration in seconds as M:SS (e.g., 0:47, 2:15).
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins)}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Formats a byte count as a human-readable file size.
 * Uses binary units (KB, MB, GB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)}B`;
  if (bytes < 1024 * 1024) return `${String(Math.round(bytes / 1024))}KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
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
