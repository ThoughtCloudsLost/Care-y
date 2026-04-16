/**
* | output |
* | --- |
* | "Insert" |
*
* @param {Library_Editor_InsertInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_insert: ((inputs?: Library_Editor_InsertInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_InsertInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_InsertInputs = {};
