/**
* | output |
* | --- |
* | "Blockquote" |
*
* @param {Library_Editor_BlockquoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_blockquote: ((inputs?: Library_Editor_BlockquoteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_BlockquoteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_BlockquoteInputs = {};
