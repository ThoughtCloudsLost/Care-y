/**
* | output |
* | --- |
* | "Mark handled" |
*
* @param {Contact_Correction_Mark_HandledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const contact_correction_mark_handled: ((inputs?: Contact_Correction_Mark_HandledInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Contact_Correction_Mark_HandledInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Contact_Correction_Mark_HandledInputs = {};
