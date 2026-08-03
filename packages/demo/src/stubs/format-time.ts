/**
 * Stub for $lib/utils/format-time.
 *
 * In record mode, formatRelativeTime computes deltas against a frozen
 * reference timestamp captured once at module evaluation (FROZEN_NOW),
 * so the same seed data produces the same "5m ago" / "3h ago" strings
 * across re-recordings. Outside record mode the stub delegates to the
 * real implementation unchanged.
 */

import { isRecordMode, FROZEN_NOW } from "$demo/record-mode.js";
import * as m from "$lib/paraglide/messages.js";
import { formatRelativeTime as realFormatRelativeTime } from "../../../client/src/lib/utils/format-time.js";

export function formatRelativeTime(date: Date): string {
  if (!isRecordMode()) return realFormatRelativeTime(date);

  // Same bucket logic as the real implementation, but reads FROZEN_NOW
  // instead of Date.now().
  const seconds = Math.floor((FROZEN_NOW - date.getTime()) / 1000);
  if (seconds < 60) return m.dashboard_time_just_now();
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return m.dashboard_time_minutes_ago({ count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return m.dashboard_time_hours_ago({ count: hours });
  const days = Math.floor(hours / 24);
  return m.dashboard_time_days_ago({ count: days });
}
