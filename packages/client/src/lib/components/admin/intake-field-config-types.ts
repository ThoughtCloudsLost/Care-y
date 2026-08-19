/**
 * Shared types for the intake field configuration sheet and its consumers.
 * Lives in a plain module (not the .svelte module script) so .ts files can
 * import them; mirrors the collapsible-section-types.ts precedent.
 */

import type { IntakeFieldConfig, IntakeFieldRole } from "@care-y/shared";

export interface FieldConfigState {
  readonly label: string;
  readonly isRequired: boolean;
  readonly config: IntakeFieldConfig;
  readonly role: IntakeFieldRole | null;
  readonly routingQueueIds: string[] | null;
  readonly escalationRecipientIds: string[] | null;
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
