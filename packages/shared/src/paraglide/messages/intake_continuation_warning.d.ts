/**
* | output |
* | --- |
* | "This link is the only way back to your conversation. CARE-Y cannot recover it if lost. Anyone who has the link can read and add to this thread." |
*
* @param {Intake_Continuation_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_warning: ((inputs?: Intake_Continuation_WarningInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Continuation_WarningInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Continuation_WarningInputs = {};
