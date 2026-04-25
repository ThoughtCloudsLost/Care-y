/**
* | output |
* | --- |
* | "Note type created" |
*
* @param {Note_Type_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const note_type_created: ((inputs?: Note_Type_CreatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Note_Type_CreatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Note_Type_CreatedInputs = {};
