/**
* | output |
* | --- |
* | "This follow-up cannot be edited." |
*
* @param {Error_Followup_Not_EditableInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_followup_not_editable: ((inputs?: Error_Followup_Not_EditableInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Followup_Not_EditableInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Followup_Not_EditableInputs = {};
