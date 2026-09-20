/**
* | output |
* | --- |
* | "Follow-up not found." |
*
* @param {Error_Followup_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_followup_not_found: ((inputs?: Error_Followup_Not_FoundInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Followup_Not_FoundInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Followup_Not_FoundInputs = {};
