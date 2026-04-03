/**
 * Relative time formatting for dashboard timestamps.
 *
 * Converts a Date to a human-readable relative string ("just now", "5m ago",
 * "3h ago", "2d ago") using i18n message functions.
 */

import * as m from "$lib/paraglide/messages.js";

export function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return m.dashboard_time_just_now();
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return m.dashboard_time_minutes_ago({ count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return m.dashboard_time_hours_ago({ count: hours });
  const days = Math.floor(hours / 24);
  return m.dashboard_time_days_ago({ count: days });
}
