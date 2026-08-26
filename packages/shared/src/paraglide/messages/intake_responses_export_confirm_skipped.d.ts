/**
* | output |
* | --- |
* | "{skippedCount} responses could not be decrypted and will not be included." |
*
* @param {Intake_Responses_Export_Confirm_SkippedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_export_confirm_skipped: ((inputs: Intake_Responses_Export_Confirm_SkippedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Responses_Export_Confirm_SkippedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Responses_Export_Confirm_SkippedInputs = {
    skippedCount: NonNullable<unknown>;
};
