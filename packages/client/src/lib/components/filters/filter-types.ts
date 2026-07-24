/** Shared types for the generic filter pill system. */

export interface FilterOption {
  readonly value: string;
  readonly label: string;
}

export interface PillDefinition {
  readonly id: string;
  readonly label: string;
  readonly mode: "multi" | "single" | "date";
  readonly options: FilterOption[];
  readonly selected: ReadonlySet<string> | string | null;
  /** Show a loading skeleton in the option list for this pill */
  readonly loading?: boolean;
}

/**
 * A plain on/off pill with no option popover, rendered ahead of the
 * dropdown pills (e.g. the client-side "New replies first" sort and
 * the "Unread" membership filter on the tickets list).
 */
export interface FilterToggleConfig {
  readonly label: string;
  readonly active: boolean;
  readonly ontoggle: () => void;
}
