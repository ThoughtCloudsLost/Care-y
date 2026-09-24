/**
* | output |
* | --- |
* | "If you lose this link, there is no way to recover it. Save it somewhere safe." |
*
* @param {Intake_Continuation_Expanded_WarningInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_expanded_warning: ((inputs?: Intake_Continuation_Expanded_WarningInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Continuation_Expanded_WarningInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Continuation_Expanded_WarningInputs = {};
