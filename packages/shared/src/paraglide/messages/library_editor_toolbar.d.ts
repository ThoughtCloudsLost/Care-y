/**
* | output |
* | --- |
* | "Editor toolbar" |
*
* @param {Library_Editor_ToolbarInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_toolbar: ((inputs?: Library_Editor_ToolbarInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_ToolbarInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_ToolbarInputs = {};
