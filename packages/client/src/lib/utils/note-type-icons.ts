import {
  MessageSquareDashed,
  ClipboardCheck,
  LifeBuoy,
  HeartHandshake,
  StickyNote,
  TriangleAlert,
  ShieldAlert,
  Flag,
  Bookmark,
  Star,
  Info,
  CircleQuestionMark,
  FileText,
  Users,
  CircleCheckBig,
  Bell,
  MessagesSquare,
  ArrowLeftRight,
  UserCheck,
  ChevronsUp,
  CirclePause,
  Replace,
  Play,
  Image as ImageIcon,
  Paperclip,
  Phone,
  type LucideIcon,
} from "@lucide/svelte";
import type { Component } from "svelte";

export interface IconEntry {
  readonly id: string;
  readonly component: Component;
}

const iconMap = new Map<string, LucideIcon>([
  ["message-square-dashed", MessageSquareDashed],
  ["clipboard-check", ClipboardCheck],
  ["life-buoy", LifeBuoy],
  ["heart-handshake", HeartHandshake],
  ["sticky-note", StickyNote],
  ["triangle-alert", TriangleAlert],
  ["shield-alert", ShieldAlert],
  ["flag", Flag],
  ["bookmark", Bookmark],
  ["star", Star],
  ["info", Info],
  ["circle-question-mark", CircleQuestionMark],
  ["file-text", FileText],
  ["users", Users],
  ["circle-check-big", CircleCheckBig],
  ["bell", Bell],
]);

export const ICON_PICKER_ENTRIES: readonly IconEntry[] = [...iconMap].map(
  ([id, component]) => ({ id, component }),
);

export function resolveNoteTypeIcon(name: string | null): LucideIcon {
  if (name === null) return StickyNote;
  return iconMap.get(name) ?? StickyNote;
}

const followUpTypeIcons = new Map<string, LucideIcon>([
  ["message", MessagesSquare],
  ["status_opened", ArrowLeftRight],
  ["status_closed", ArrowLeftRight],
  ["volunteer_assigned", UserCheck],
  ["volunteer_unassigned", UserCheck],
  ["priority_changed", ChevronsUp],
  ["hold_placed", CirclePause],
  ["hold_removed", CirclePause],
  ["merge_note", Replace],
  ["internal_note", StickyNote],
  ["phone_call", Phone],
  ["sms_outbound", MessagesSquare],
]);

const mediaIcons = new Map<string, LucideIcon>([
  ["recording", Play],
  ["image", ImageIcon],
  ["file", Paperclip],
]);

export function resolveFollowUpTypeIcon(
  type: string,
  mediaHint?: "recording" | "image" | "file",
): LucideIcon {
  if (mediaHint !== undefined) {
    return mediaIcons.get(mediaHint) ?? MessagesSquare;
  }
  return followUpTypeIcons.get(type) ?? MessagesSquare;
}
