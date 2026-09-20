/**
* | output |
* | --- |
* | "Safety Concern" |
*
* @param {Note_Type_Safety_ConcernInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const note_type_safety_concern: ((inputs?: Note_Type_Safety_ConcernInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Note_Type_Safety_ConcernInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Note_Type_Safety_ConcernInputs = {};
