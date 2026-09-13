/**
* | output |
* | --- |
* | "Save a link to add more later (optional)" |
*
* @param {Intake_Continuation_Toggle_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_toggle_title: ((inputs?: Intake_Continuation_Toggle_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Continuation_Toggle_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Continuation_Toggle_TitleInputs = {};
