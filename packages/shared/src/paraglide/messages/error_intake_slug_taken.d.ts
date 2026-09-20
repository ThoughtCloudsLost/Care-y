/**
* | output |
* | --- |
* | "That link name is already in use by another form." |
*
* @param {Error_Intake_Slug_TakenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_intake_slug_taken: ((inputs?: Error_Intake_Slug_TakenInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Intake_Slug_TakenInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Intake_Slug_TakenInputs = {};
