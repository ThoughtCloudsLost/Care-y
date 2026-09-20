/**
* | output |
* | --- |
* | "Note type updated" |
*
* @param {Note_Type_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const note_type_updated: ((inputs?: Note_Type_UpdatedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Note_Type_UpdatedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Note_Type_UpdatedInputs = {};
