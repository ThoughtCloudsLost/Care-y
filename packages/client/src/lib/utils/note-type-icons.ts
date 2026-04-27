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
  type LucideIcon,
} from "@lucide/svelte";

export interface IconEntry {
  readonly slug: string;
  readonly component: LucideIcon;
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
  ([slug, component]) => ({ slug, component }),
);

export function resolveNoteTypeIcon(name: string | null): LucideIcon {
  if (name === null) return StickyNote;
  return iconMap.get(name) ?? StickyNote;
}

const followUpTypeIcons = new Map<string, LucideIcon>([
  ["message", MessagesSquare],
  ["status_change", ArrowLeftRight],
  ["assignment_change", UserCheck],
  ["priority_change", ChevronsUp],
  ["hold_change", CirclePause],
  ["merge_note", Replace],
  ["internal_note", StickyNote],
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
