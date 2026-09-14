/**
 * Option shape for RichSelect.
 *
 * Lives outside the component so callers can type their own option
 * builders and snippet parameters against it.
 */
export interface RichSelectOption {
  readonly value: string;
  readonly label: string;
}
