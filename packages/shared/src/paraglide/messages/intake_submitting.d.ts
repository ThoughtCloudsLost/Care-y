/**
* | output |
* | --- |
* | "Sending..." |
*
* @param {Intake_SubmittingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_submitting: ((inputs?: Intake_SubmittingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_SubmittingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_SubmittingInputs = {};
