/**
* | output |
* | --- |
* | "Copy link" |
*
* @param {Intake_Continuation_Copy_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_copy_button: ((inputs?: Intake_Continuation_Copy_ButtonInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Continuation_Copy_ButtonInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Continuation_Copy_ButtonInputs = {};
