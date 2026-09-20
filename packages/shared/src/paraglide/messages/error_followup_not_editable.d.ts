/**
* | output |
* | --- |
* | "This follow-up cannot be edited." |
*
* @param {Error_Followup_Not_EditableInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_followup_not_editable: ((inputs?: Error_Followup_Not_EditableInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Followup_Not_EditableInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Followup_Not_EditableInputs = {};
