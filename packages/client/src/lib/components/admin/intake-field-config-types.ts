/**
 * Shared types for the intake field configuration sheet and its consumers.
 * Lives in a plain module (not the .svelte module script) so .ts files can
 * import them; mirrors the collapsible-section-types.ts precedent.
 */

import type {
  IntakeFieldConfig,
  IntakeFieldRole,
  IntakeFieldType,
  LocalizedText,
  VisibleWhen,
} from "@care-y/shared";

export interface FieldConfigState {
  readonly fieldType: IntakeFieldType;
  readonly label: LocalizedText;
  readonly helpText: LocalizedText;
  readonly isRequired: boolean;
  readonly config: IntakeFieldConfig;
  readonly role: IntakeFieldRole | null;
  readonly routingQueueIds: string[] | null;
  readonly escalationRecipientIds: string[] | null;
  readonly visibleWhen?: VisibleWhen;
}

/** Input shape for the sheet (routingQueueIds is derived on output, not read on input). */
export type FieldConfigInitial = Omit<FieldConfigState, "routingQueueIds">;

export interface QueueOption {
  readonly id: string;
  readonly name: string;
}

export interface VolunteerOption {
  readonly id: string;
  readonly name: string;
}

/**
 * An earlier field eligible for conditional visibility rules.
 * Passed to the config sheet so it can list available condition targets.
 */
export interface EarlierFieldOption {
  readonly fieldKey: string;
  readonly label: string;
  readonly fieldType: IntakeFieldType;
  readonly options?: readonly { key: string; label: string }[];
}
