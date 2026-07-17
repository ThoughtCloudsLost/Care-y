/**
 * Shared color and icon vocabularies for the ColorPicker and IconPicker
 * input components.
 *
 * Saved filters and queues both select from these sets. Note types keep
 * their own registry in $lib/utils/note-type-icons.ts because their icon
 * vocabulary carries note-specific semantics. Domain code passes its
 * option set to the picker components as props, so domains that need a
 * different vocabulary supply their own arrays with these shapes.
 *
 * The color IDs are the same seven tokens as the saved-filter color enum
 * in @care-y/shared. Saved filters store the token plaintext (server
 * validates against the enum); queues store it org-key encrypted, so for
 * queues the vocabulary is enforced client-side only.
 */

import {
  Phone,
  MessageSquare,
  Clock,
  TriangleAlert,
  User,
  Users,
  Folder,
  Tag,
  Star,
  Pin,
  Heart,
  Shield,
  House,
  Briefcase,
  CircleQuestionMark,
} from "@lucide/svelte";
import type { Component } from "svelte";
import type { SavedFilterColor } from "@care-y/shared";

/** Canonical ID type for picker colors (shared with the saved-filter enum). */
export type PickerColorId = SavedFilterColor;

export interface PickerColorOption {
  readonly id: PickerColorId;
  readonly hex: string;
}

export interface PickerIconOption {
  readonly id: string;
  readonly component: Component;
}

export const PICKER_COLORS: readonly PickerColorOption[] = [
  { id: "grey", hex: "var(--muted, #8e8e93)" },
  { id: "blue", hex: "#007aff" },
  { id: "green", hex: "#34c759" },
  { id: "orange", hex: "#ff9500" },
  { id: "red", hex: "#ff3b30" },
  { id: "pink", hex: "#ff2d55" },
  { id: "purple", hex: "#af52de" },
] as const;

export const PICKER_ICONS: readonly PickerIconOption[] = [
  { id: "phone", component: Phone },
  { id: "message-square", component: MessageSquare },
  { id: "clock", component: Clock },
  { id: "triangle-alert", component: TriangleAlert },
  { id: "user", component: User },
  { id: "users", component: Users },
  { id: "folder", component: Folder },
  { id: "tag", component: Tag },
  { id: "star", component: Star },
  { id: "pin", component: Pin },
  { id: "heart", component: Heart },
  { id: "shield", component: Shield },
  { id: "house", component: House },
  { id: "briefcase", component: Briefcase },
  { id: "circle-question-mark", component: CircleQuestionMark },
] as const;

/** Lookup map for rendering an icon by ID. Falls back per domain. */
export const ICON_BY_ID: Readonly<Record<string, Component>> =
  Object.fromEntries(PICKER_ICONS.map((i) => [i.id, i.component]));

/** Lookup map for rendering a color hex by ID. */
export const COLOR_HEX_BY_ID: Readonly<Record<string, string>> =
  Object.fromEntries(PICKER_COLORS.map((c) => [c.id, c.hex]));

/** Default fallback icon when a record references an unknown icon ID. */
export const DEFAULT_ICON = Tag;

/** Default fallback color hex. */
export const DEFAULT_COLOR_HEX = "var(--muted, #8e8e93)";
