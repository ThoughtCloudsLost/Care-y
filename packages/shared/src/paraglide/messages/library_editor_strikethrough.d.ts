/**
* | output |
* | --- |
* | "Strikethrough" |
*
* @param {Library_Editor_StrikethroughInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_strikethrough: ((inputs?: Library_Editor_StrikethroughInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_StrikethroughInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_StrikethroughInputs = {};
