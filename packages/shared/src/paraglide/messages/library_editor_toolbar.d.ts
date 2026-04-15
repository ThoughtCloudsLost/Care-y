/**
* | output |
* | --- |
* | "Editor toolbar" |
*
* @param {Library_Editor_ToolbarInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_toolbar: ((inputs?: Library_Editor_ToolbarInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_ToolbarInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_ToolbarInputs = {};
