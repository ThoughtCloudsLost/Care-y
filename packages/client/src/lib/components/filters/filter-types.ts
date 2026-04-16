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
