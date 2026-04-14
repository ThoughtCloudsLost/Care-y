/**
 * Shared icon and color constants for saved filters.
 *
 * Used by CreateSavedFilter (picker) and SavedFilterList (display).
 * Both components import from here to keep icon/color sets in sync.
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

export interface SavedFilterColorOption {
  readonly id: SavedFilterColor;
  readonly hex: string;
}

export interface SavedFilterIconOption {
  readonly id: string;
  readonly component: Component;
}

export const SAVED_FILTER_COLORS: readonly SavedFilterColorOption[] = [
  { id: "grey", hex: "var(--muted, #8e8e93)" },
  { id: "blue", hex: "#007aff" },
  { id: "green", hex: "#34c759" },
  { id: "orange", hex: "#ff9500" },
  { id: "red", hex: "#ff3b30" },
  { id: "pink", hex: "#ff2d55" },
  { id: "purple", hex: "#af52de" },
] as const;

export const SAVED_FILTER_ICONS: readonly SavedFilterIconOption[] = [
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

/** Lookup map for rendering a saved filter's icon by ID. Falls back to Tag. */
export const ICON_BY_ID: Readonly<Record<string, Component>> =
  Object.fromEntries(SAVED_FILTER_ICONS.map((i) => [i.id, i.component]));

/** Lookup map for rendering a saved filter's color hex by ID. */
export const COLOR_HEX_BY_ID: Readonly<Record<string, string>> =
  Object.fromEntries(SAVED_FILTER_COLORS.map((c) => [c.id, c.hex]));

/** Default fallback icon when a saved filter references an unknown icon ID. */
export const DEFAULT_ICON = Tag;

/** Default fallback color hex. */
export const DEFAULT_COLOR_HEX = "var(--muted, #8e8e93)";
