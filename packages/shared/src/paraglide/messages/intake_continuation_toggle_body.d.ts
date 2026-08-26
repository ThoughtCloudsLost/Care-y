/**
* | output |
* | --- |
* | "Get a link you can reopen to add information or read replies." |
*
* @param {Intake_Continuation_Toggle_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_toggle_body: ((inputs?: Intake_Continuation_Toggle_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Continuation_Toggle_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Continuation_Toggle_BodyInputs = {};
