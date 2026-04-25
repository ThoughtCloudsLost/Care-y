/**
* | output |
* | --- |
* | "Note type deactivated" |
*
* @param {Note_Type_DeactivatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const note_type_deactivated: ((inputs?: Note_Type_DeactivatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Note_Type_DeactivatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Note_Type_DeactivatedInputs = {};
