/**
* | output |
* | --- |
* | "Normal text" |
*
* @param {Library_Editor_ParagraphInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_paragraph: ((inputs?: Library_Editor_ParagraphInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_ParagraphInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_ParagraphInputs = {};
