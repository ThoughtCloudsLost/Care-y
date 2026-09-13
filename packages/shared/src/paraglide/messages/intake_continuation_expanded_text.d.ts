/**
* | output |
* | --- |
* | "After you submit, you will receive a link. Open it any time to read replies or add more information. Anyone who has the link can read and add to this convers..." |
*
* @param {Intake_Continuation_Expanded_TextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_expanded_text: ((inputs?: Intake_Continuation_Expanded_TextInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Continuation_Expanded_TextInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Continuation_Expanded_TextInputs = {};
