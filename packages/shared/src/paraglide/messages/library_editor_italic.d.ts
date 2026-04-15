/**
* | output |
* | --- |
* | "Italic" |
*
* @param {Library_Editor_ItalicInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_italic: ((inputs?: Library_Editor_ItalicInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_ItalicInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_ItalicInputs = {};
