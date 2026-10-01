/** Shared types for the disbursement sheet and the overlay state that opens it. */

import type { DisbursementNoteEnvelope } from "@care-y/shared";

/** The disbursement note being corrected. */
export interface DisbursementEdit {
  readonly followUpId: string;
  readonly envelope: DisbursementNoteEnvelope;
}
