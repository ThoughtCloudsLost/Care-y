/**
* | output |
* | --- |
* | "Normal text" |
*
* @param {Library_Editor_ParagraphInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_paragraph: ((inputs?: Library_Editor_ParagraphInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_ParagraphInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_ParagraphInputs = {};
