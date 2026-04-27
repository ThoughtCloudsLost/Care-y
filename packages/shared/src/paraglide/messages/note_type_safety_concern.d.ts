/**
* | output |
* | --- |
* | "Safety Concern" |
*
* @param {Note_Type_Safety_ConcernInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const note_type_safety_concern: ((inputs?: Note_Type_Safety_ConcernInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Note_Type_Safety_ConcernInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Note_Type_Safety_ConcernInputs = {};
