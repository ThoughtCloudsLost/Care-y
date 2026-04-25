/**
* | output |
* | --- |
* | "Resolution" |
*
* @param {Note_Type_ResolutionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const note_type_resolution: ((inputs?: Note_Type_ResolutionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Note_Type_ResolutionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Note_Type_ResolutionInputs = {};
