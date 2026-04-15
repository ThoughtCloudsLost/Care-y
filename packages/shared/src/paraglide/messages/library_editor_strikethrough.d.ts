/**
* | output |
* | --- |
* | "Strikethrough" |
*
* @param {Library_Editor_StrikethroughInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_strikethrough: ((inputs?: Library_Editor_StrikethroughInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_StrikethroughInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_StrikethroughInputs = {};
