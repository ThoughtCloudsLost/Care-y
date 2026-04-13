/**
* | output |
* | --- |
* | "This follow-up cannot be deleted." |
*
* @param {Error_Followup_Not_DeletableInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_followup_not_deletable: ((inputs?: Error_Followup_Not_DeletableInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Followup_Not_DeletableInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Followup_Not_DeletableInputs = {};
