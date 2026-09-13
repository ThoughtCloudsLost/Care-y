/**
* | output |
* | --- |
* | "Could not copy the link. Select it manually and copy." |
*
* @param {Intake_Continuation_Copy_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_copy_error: ((inputs?: Intake_Continuation_Copy_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Continuation_Copy_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Continuation_Copy_ErrorInputs = {};
