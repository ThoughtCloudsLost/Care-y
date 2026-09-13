/**
* | output |
* | --- |
* | "Failed to distribute key wraps for some submissions." |
*
* @param {Intake_Responses_Backfill_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_backfill_failed: ((inputs?: Intake_Responses_Backfill_FailedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Responses_Backfill_FailedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Responses_Backfill_FailedInputs = {};
