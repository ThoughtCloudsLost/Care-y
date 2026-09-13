/**
* | output |
* | --- |
* | "Link copied." |
*
* @param {Intake_Continuation_CopiedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_continuation_copied: ((inputs?: Intake_Continuation_CopiedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Continuation_CopiedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Continuation_CopiedInputs = {};
