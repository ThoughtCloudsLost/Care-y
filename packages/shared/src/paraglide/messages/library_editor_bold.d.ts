/**
* | output |
* | --- |
* | "Bold" |
*
* @param {Library_Editor_BoldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_bold: ((inputs?: Library_Editor_BoldInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_BoldInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_BoldInputs = {};
