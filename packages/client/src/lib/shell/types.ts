/**
 * Shell typed interface: neutral contract for web (Konsta) and future native (Capacitor).
 *
 * Content components import these types only. Shell wrappers in this directory
 * implement them using Konsta. If Capacitor is adopted, a shell-native/ directory
 * provides alternative implementations against the same interfaces.
 *
 * This file is append-only. All downstream view modules depend on it.
 */

import type { Component, Snippet } from "svelte";

// ── Tab identifiers ──────────────────────────────────────────────────

export const TAB_IDS = ["home", "tickets", "calendar"] as const;
export type TabId = (typeof TAB_IDS)[number];

// ── Shell wrapper props ──────────────────────────────────────────────

export interface AppShellProps {
  /** Currently active tab ID. */
  activeTab: TabId;
  /** Org name shown in the navbar. */
  orgName?: string;
  /** Callback when a tab is tapped or arrow-keyed to. */
  ontabchange: (tabId: TabId) => void;
  /** Page content rendered inside the shell. */
  children: Snippet;
}

export interface ShellNavbarProps {
  /** Page title shown in the center (iOS) or left-aligned (Material). */
  title?: string;
  /** Show a back arrow that calls onback. */
  backLink?: boolean;
  /** Callback when the back arrow is tapped. */
  onback?: () => void;
  /** Snippet rendered in the left slot (after back arrow if present). */
  left?: Snippet;
  /** Snippet rendered in the right slot. */
  right?: Snippet;
}

export interface PageLayoutProps {
  /** Lock the page to viewport height (no body scroll). For chat views. */
  lockScroll?: boolean;
  /** Snippet rendered as a sticky bar at the bottom (Messagebar, action bar). */
  bottomBar?: Snippet;
  /** CSS touch-action value for the scroll container. Default: 'auto'. */
  touchAction?: string;
  /** Page content. */
  children: Snippet;
}

export interface ShellSheetProps {
  /** Whether the sheet is open. */
  opened: boolean;
  /** Callback when the sheet is dismissed (backdrop click or Escape). */
  ondismiss: () => void;
  /** Sheet content. */
  children: Snippet;
}

export interface ShellPopupProps {
  /** Whether the popup is open. */
  opened: boolean;
  /** Callback when the popup is dismissed. */
  ondismiss: () => void;
  /** Title shown in the popup navbar. */
  title?: string;
  /** Popup content. */
  children: Snippet;
}

export interface ShellActionSheetProps {
  /** Whether the action sheet is open. */
  opened: boolean;
  /** Callback when the action sheet is dismissed. */
  ondismiss: () => void;
  /** Action sheet content (typically ActionsGroup + ActionsButton). */
  children: Snippet;
}

export interface ShellPopoverProps {
  /** Whether the popover is open. */
  opened: boolean;
  /** Callback when the popover is dismissed (backdrop click or Escape). */
  ondismiss: () => void;
  /** Anchor element the popover positions itself relative to. */
  target?: HTMLElement;
  /** Whether to show the pointing arrow toward the target. */
  angle?: boolean;
  /** Force vertical placement. Skips auto-detection. */
  placement?: "top" | "bottom";
  /** Popover content. */
  children: Snippet;
}

export interface ShellDialogProps {
  /** Whether the dialog is open. */
  opened: boolean;
  /** Callback when the dialog is dismissed. */
  ondismiss: () => void;
  /** Dialog title. */
  title?: string;
  /** Dialog content (text or rich content). */
  content: Snippet;
  /** Dialog buttons. */
  buttons: Snippet;
}

export interface ShellToastProps {
  /** Whether the toast is visible. */
  opened: boolean;
  /** Position on wider screens. */
  position?: "left" | "center" | "right";
  /** Optional dismiss button snippet. */
  button?: Snippet;
  /** Toast content. */
  children: Snippet;
}

export interface ShellNotificationProps {
  /** Whether the notification is visible. */
  opened: boolean;
  /** Callback when the notification is closed. */
  onclose: () => void;
  /** Notification title. */
  title: string;
  /** Subtitle (e.g., sender name). */
  subtitle?: string;
  /** Body text. */
  text?: string;
  /** Right-aligned text (e.g., timestamp). */
  titleRightText?: string;
}

// ── Compose mode ────────────────────────────────────────────────────

export type ComposeMode = "reply" | "note";

export interface ShellMessagebarProps {
  /** Compose text (two-way bindable). Defaults to empty string. */
  value?: string;
  /** Current compose mode (two-way bindable). Defaults to "reply". */
  mode?: ComposeMode;
  /** Called when the send/save button is tapped. */
  onsend: () => void;
  /** Called when the attach button is tapped. */
  onattach: () => void;
  /** Called when the preset reply button is tapped. */
  onpreset: () => void;
  /** Whether the send button is visually disabled. */
  sendDisabled?: boolean;
}

// ── Navbar override ─────────────────────────────────────────────────
// Any route can temporarily override AppShell's Navbar left/title/right
// by setting a NavbarOverride via context. AppShell reads the override
// reactively and renders the provided snippets.

export interface NavbarOverride {
  /** Snippet rendered in the left slot (back button). */
  readonly left?: Snippet;
  /** Title string or snippet. */
  readonly title?: string | Snippet;
  /** Snippet rendered in the right slot (action icons). */
  readonly right?: Snippet;
}

// ── Tabbar override ─────────────────────────────────────────────────
// Any route can temporarily replace the tab bar with custom actions.
// The shell renders Link items (not TabbarLink, which drives the
// Material highlight bar). Content components build this descriptor;
// the shell handles rendering. For native migration, only the shell
// renderer changes.

export interface TabbarOverrideAction {
  readonly id: string;
  readonly label: string;
  readonly icon: Component;
  readonly onclick: () => void;
}

export interface TabbarOverride {
  /** Actions rendered as Link items in the main ToolbarPane. */
  readonly actions: readonly TabbarOverrideAction[];
  /** Text label shown in the toolbar (e.g., "3 selected"). */
  readonly label: string;
  /** Accessible label for the toolbar element. */
  readonly ariaLabel: string;
  /** Dismiss action (icon-only Link in its own ToolbarPane, like the "..." button). */
  readonly dismiss: {
    readonly icon: Component;
    readonly ariaLabel: string;
    readonly onclick: () => void;
  };
}
