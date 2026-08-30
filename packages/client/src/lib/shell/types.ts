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
import type { SavedFilterRecord } from "@care-y/shared";
import type { ViewMode } from "$lib/stores/view-mode.svelte.js";
import type {
  PillDefinition,
  FilterToggleConfig,
} from "$lib/components/filters/filter-types.js";
import type { ScrollSection } from "$lib/components/useSectionScroll.svelte.js";
import type { Locale } from "$lib/paraglide/runtime.js";

// ── Tab identifiers ──────────────────────────────────────────────────

export const TAB_IDS = ["home", "tickets", "library"] as const;
export type TabId = (typeof TAB_IDS)[number];

// ── Area identifiers ─────────────────────────────────────────────────

export const AREA_IDS = [
  "admin",
  "admin-people",
  "admin-communications",
  "admin-organization",
  "admin-manager",
  "admin-volunteer",
  "settings",
  "schedule",
] as const;
export type AreaId = (typeof AREA_IDS)[number];

// ── Shell wrapper props ──────────────────────────────────────────────

export interface AppShellProps {
  /** Currently active tab ID, or null when the path is outside all tabs. */
  activeTab: TabId | null;
  /** Non-tab area the current path belongs to, or null on tab pages. */
  activeArea: AreaId | null;
  /** Org name shown in the navbar. */
  orgName?: string;
  /** Callback when a tab is tapped or arrow-keyed to. */
  ontabchange: (tabId: TabId) => void;
  /** Callback when the area indicator pill is tapped. */
  onareatap: (areaId: AreaId) => void;
  /** Optional callback fired when the search overlay opens or closes. */
  onsearchtoggle?: (open: boolean) => void;
  /** Page content rendered inside the shell. */
  children: Snippet;
}

export interface TabbarNavProps {
  /** Currently active tab ID, or null when the path is outside all tabs. */
  activeTab: TabId | null;
  /** Non-tab area the current path belongs to, or null on tab pages. */
  activeArea: AreaId | null;
  /** Callback when a tab is tapped. */
  ontabchange: (tabId: TabId) => void;
  /** Callback when the area indicator pill is tapped. */
  onareatap: (areaId: AreaId) => void;
}

export interface PageLayoutProps {
  /** Lock the page to viewport height (no body scroll). For chat views. */
  lockScroll?: boolean;
  /** Snippet rendered as a sticky bar at the bottom (Messagebar, action bar). */
  bottomBar?: Snippet;
  /**
   * Render the bottom bar as a glass overlay instead of a flex sibling.
   *
   * When true (requires lockScroll), the bar is position:absolute at the
   * bottom of the layout with a translucent glass backdrop. The scroll
   * region gets matching padding-bottom via a ResizeObserver-measured CSS
   * variable so content can scroll beneath the bar without being clipped.
   */
  overlayBottomBar?: boolean;
  /** CSS touch-action value for the scroll container. Default: 'auto'. */
  touchAction?: string;
  /**
   * Requires lockScroll. Applies the shared `.chrome-underlap` class to
   * the scroll region so a chat thread scrolls behind the navbar/subnavbar
   * glass.
   */
  underChrome?: boolean;
  /**
   * Bindable handle on the scroll region, when lockScroll owns the scroll.
   *
   * A chat page needs the scrolling element to anchor position on prepend
   * and to know whether the reader is at the bottom. The org thread owns
   * its own scroller and binds it directly; a page whose scroll lives here
   * has no other way to reach it, and a second scroller inside the content
   * would swallow this one.
   */
  scrollEl?: HTMLDivElement | undefined;
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
  /** Title rendered in a sticky header bar. When provided (with or without
   *  headerRight), the sheet splits into a pinned header + scrollable body. */
  title?: string;
  /** Snippet rendered in the top-right of the sticky header (save/action button). */
  headerRight?: Snippet;
  /** Show backdrop overlay behind the sheet. Default: true. */
  backdrop?: boolean;
  /** Trap focus inside the sheet. Disable when an external input (e.g.,
   *  Searchbar in the Navbar) should keep focus. Default: true. */
  trapFocus?: boolean;
  /** ARIA role for the content wrapper. Default: "dialog". */
  role?: "dialog" | "search" | "region";
  /** ARIA label (required when role is not "dialog" with a visible title). */
  ariaLabel?: string;
  /** Additional CSS class on the Konsta Sheet element. */
  class?: string;
}

export interface ShellPopupProps {
  /** Whether the popup is open. */
  opened: boolean;
  /** Callback when the popup is dismissed. */
  ondismiss: () => void;
  /** Title shown in the popup navbar. */
  title?: string;
  /** Accessible label for the dialog (falls back to title). */
  ariaLabel?: string;
  /** Snippet rendered in the navbar left slot. */
  left?: Snippet;
  /** Snippet rendered in the navbar right slot (replaces the default Close link). */
  right?: Snippet;
  /** Popup content. */
  children: Snippet;
}

export interface ShellActionSheetProps {
  /** Whether the action sheet is open. */
  opened: boolean;
  /** Callback when the action sheet is dismissed. */
  ondismiss: () => void;
  /** Accessible label for the dialog. */
  ariaLabel?: string;
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
  /** Accessible label for the dialog. */
  ariaLabel?: string;
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

export type ComposeMode = "reply" | "note" | "sms";

export interface ShellMessagebarProps {
  /** Compose text (two-way bindable). Defaults to empty string. */
  value?: string;
  /** Current compose mode (two-way bindable). Defaults to "reply". */
  mode?: ComposeMode;
  /** Called when the send/save button is tapped. */
  onsend: () => void;
  /** Called when the + compose actions button is tapped. Receives the
   *  button element for popover anchoring. */
  onplus: (anchorEl: HTMLElement) => void;
  /** Forwarded from the textarea's native input event. Used by @mention autocomplete to read cursor position. */
  oninput?: (e: Event) => void;
  /** Whether the send button is visually disabled. */
  sendDisabled?: boolean;
  /** When true, renders inline (position: relative) instead of fixed, and
   *  skips the ResizeObserver that publishes --messagebar-height. Used inside
   *  sheets where the messagebar sits within the sheet's flow, not viewport-pinned. */
  inline?: boolean;
  /** When true, hides the Messagebar and renders only the + button. The
   *  anchor div remains for ResizeObserver height publication. */
  collapsed?: boolean;
  /** Snippet rendered above the Messagebar inside the anchor div. Used by
   *  consumers for mode indicators, warnings, etc. */
  header?: Snippet;
  /** Snippet rendered below the Messagebar inside the anchor div. Used by
   *  consumers for character counters, hints, etc. */
  footer?: Snippet;
  /** Snippet rendered inside the anchor div regardless of collapsed state.
   *  Used for absolutely positioned floating content (e.g., the
   *  jump-to-latest pill) that needs the anchor as its positioned ancestor. */
  floating?: Snippet;
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
  /** Snippet rendered in the right slot (action icons). Prefer `actions` for
   *  structured data that adapts to desktop (icon+label) vs mobile (icon-only). */
  readonly right?: Snippet;
  /** Structured actions for the navbar right slot. The shell renders icon-only
   *  on mobile and icon+label on desktop. Routes provide data, not snippets. */
  readonly actions?: readonly NavbarAction[];
  /** Snippet rendered below the Navbar as a collapsible subnavbar region. */
  readonly subnavbar?: Snippet;
  /** Reactive getter: returns true when the subnavbar should be hidden. */
  readonly subnavbarHidden?: () => boolean;
  /** When true, the search icon in the navbar right slot is hidden. */
  readonly searchHidden?: boolean;
}

// ── Tabbar override ─────────────────────────────────────────────────
// Any route can temporarily replace the tab bar with custom snippet
// content (left/middle/right slots), matching the NavbarOverride
// pattern. The shell renders each slot in its own ToolbarPane with
// tabbar={false} (no Material highlight bar). Content components
// build snippets; the shell handles Toolbar structure, iOS blur,
// and safe-area handling.

export interface TabbarOverride {
  /** Snippet rendered in the left slot. */
  readonly left?: Snippet;
  /** Snippet rendered in the center slot. */
  readonly middle?: Snippet;
  /** Snippet rendered in the right slot. */
  readonly right?: Snippet;
  /** Accessible label for the toolbar element. */
  readonly ariaLabel: string;
}

// ── SubNavbar filter layout config ─────────────────────────────────
// Grouped config types for SubNavbarFilterLayout. Routes build these
// objects and pass them as props. Grouping enforces structural contracts:
// adding a field to a config type produces compile errors at every
// call site that doesn't satisfy it.

export interface SortOption {
  readonly field: string;
  readonly label: string;
}

export interface ViewToggleConfig {
  readonly mode: ViewMode;
  readonly onchange: (mode: ViewMode) => void;
  readonly label?: string;
}

export interface SortConfig {
  readonly label: string;
  readonly options: readonly SortOption[];
  readonly currentField: string;
  readonly currentDirection: "asc" | "desc";
  readonly onchange: (field: string, direction: "asc" | "desc") => void;
  /** Optional on/off item rendered under the field options. Field options
   *  are server sort params with direction semantics; this is a client-side
   *  presentation sort that composes with whichever field is active. */
  readonly toggle?: FilterToggleConfig;
}

export interface SavedFiltersConfig {
  readonly filters: SavedFilterRecord[];
  readonly count: number;
  readonly onapply: (record: SavedFilterRecord) => void;
  readonly ondelete: (id: string) => void;
  readonly ontoggleshare: (id: string) => void;
}

export interface ManageConfig {
  /** Accessible label for the manage button (e.g., "Manage categories"). */
  readonly label: string;
  /** Called when the manage gear button is tapped. */
  readonly onclick: () => void;
  /** Icon component for the manage button. Defaults to Settings (cog). */
  readonly icon?: Component;
}

export interface ShellPanelProps {
  /** Whether the panel is open. */
  readonly opened: boolean;
  /** Callback when the panel is dismissed (backdrop click or Escape). */
  readonly ondismiss: () => void;
  /** Which side the panel opens from. Default: "left". */
  readonly side?: "left" | "right";
  /** Accessible label for the panel dialog. */
  readonly ariaLabel: string;
  /** Panel content. */
  readonly children: Snippet;
}

export interface FilterPillsConfig {
  readonly pills: PillDefinition[];
  readonly activeCount: number;
  readonly filterLabel?: string;
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly dateActive?: boolean;
  readonly dateLabel?: string;
  readonly ontoggle: (pillId: string, value: string) => void;
  readonly onselect: (pillId: string, value: string | null) => void;
  readonly ondatechange: (from: Date | null, to: Date | null) => void;
  readonly onclearall: () => void;
  readonly oncreateshortcut?: () => void;
}

// ── Desktop responsive ──────────────────────────────────────────────

export interface NavbarAction {
  readonly icon: Component;
  readonly label: string;
  readonly onclick: (e: MouseEvent) => void;
}

export interface SidebarSubItem {
  readonly id: string;
  readonly label: string;
  readonly count?: number;
  readonly icon?: "queue" | "filter";
  readonly ontap: () => void;
}

export interface SidebarSection {
  readonly tabId: TabId | "admin";
  readonly items: readonly SidebarSubItem[];
}

export interface DesktopSidebarProps {
  readonly activeTab: TabId | null;
  readonly activeArea: AreaId | null;
  readonly ontabchange: (tabId: TabId) => void;
  readonly expanded: boolean;
  readonly subItems: readonly SidebarSection[];
  readonly orgName?: string;
  readonly userName: string;
  readonly userInitials: string;
  readonly onAdmin: () => void;
  readonly onSettings: () => void;
  readonly onLogout: () => void;
  /** Current user's role ID. Drives the footer role badge stamp. */
  readonly roleId: string;
  /** Called with the role's admin hub path when the role badge is activated. */
  readonly onNavigate: (path: `/${string}`) => void;
  /** Hover-reveal: called when the mouse enters a tab/admin button that
   *  has sections in the registry. Returns sections to display in the
   *  hover rail, or undefined to suppress the rail. */
  readonly getHoverSections?: (route: string) => HoverRevealData | undefined;
  /** Called when the user clicks a section in the hover rail. */
  readonly onHoverNavigate?: (route: string, sectionId: string) => void;
}

export interface HoverRevealData {
  readonly sections: readonly ScrollSection[];
  readonly pageLabel: string;
}

// ── Shared navbar chrome ─────────────────────────────────────────────
// ShellNavbar owns the Konsta Navbar, its glass layers, and the row that
// can sit below it. Both shells compose it, so identity, the language
// picker, and a subnavbar land in the same slot on each surface.

export interface ShellNavbarIdentity {
  /** Org logo URL, or null when the org has set none. */
  readonly logoUrl: string | null;
  /** Org name, rendered in the navbar center beside the language picker. */
  readonly orgName: string;
  /** Accessible name for the identity control. */
  readonly label: string;
  /** Opens whatever this shell puts behind identity: a panel or a drawer. */
  readonly onIdentityTap: () => void;
}

export interface ShellNavbarProps {
  readonly identity: ShellNavbarIdentity;
  /** Rendered inside the identity avatar when the org has set no logo. */
  readonly identityFallback: Snippet;
  /** Drops the identity control while keeping the org name in the center.
   *  The org app sets it on desktop, where the sidebar carries identity. */
  readonly identityHidden?: boolean;
  /** True while the org name is still being fetched. The center holds a
   *  skeleton in its place, never a stand-in name. */
  readonly orgNamePending?: boolean;
  readonly locale: Locale;
  readonly onlocalechange: (locale: Locale) => void;
  /** Measured Navbar height. The chrome mask extends the glass by it. */
  readonly navbarHeight?: number;
  /** Replaces the identity control in the left slot. */
  readonly leading?: Snippet;
  /** Replaces the org name and language picker in the center. */
  readonly title?: string | Snippet;
  /** Fades the org name group out, as when a search overlay covers it. */
  readonly titleHidden?: boolean;
  /** Right slot content. */
  readonly actions?: Snippet;
  /** Overlay rendered inside the Navbar, above its slots. */
  readonly children?: Snippet;
  /** Row below the Navbar. The navbar glass extends over it. */
  readonly subnavbar?: Snippet;
  /** Reactive getter: true while the subnavbar row should be collapsed. */
  readonly subnavbarHidden?: () => boolean;
  /** Reports the measured subnavbar height back to the shell. */
  readonly onsubnavbarheight?: (height: number) => void;
  /** Second subnavbar pane pinned to the trailing edge, for split view. */
  readonly subnavbarTrailing?: Snippet;
  /** CSS width reserved at the trailing edge of the subnavbar row. Set it
   *  whenever a detail pane overlaps the row, with or without a pane of
   *  its own to render there. */
  readonly trailingWidth?: string;
  /** Reports the measured trailing pane height back to the shell. */
  readonly ontrailingheight?: (height: number) => void;
}
