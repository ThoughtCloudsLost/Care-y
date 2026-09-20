/**
* | output |
* | --- |
* | "Blockquote" |
*
* @param {Library_Editor_BlockquoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_blockquote: ((inputs?: Library_Editor_BlockquoteInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_BlockquoteInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_BlockquoteInputs = {};
