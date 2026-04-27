/**
* | output |
* | --- |
* | "Note type not found." |
*
* @param {Error_Note_Type_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_note_type_not_found: ((inputs?: Error_Note_Type_Not_FoundInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Note_Type_Not_FoundInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Note_Type_Not_FoundInputs = {};
