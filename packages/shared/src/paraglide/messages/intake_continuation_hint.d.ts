/**
* | output |
* | --- |
* | "The link above carries the key that unlocks your conversation. Save it before leaving this page." |
*
* @param {Intake_Continuation_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_hint: ((inputs?: Intake_Continuation_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Continuation_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Continuation_HintInputs = {};
