/**
* | output |
* | --- |
* | "Check accessibility" |
*
* @param {Library_Editor_A11y_CheckInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_a11y_check: ((inputs?: Library_Editor_A11y_CheckInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_A11y_CheckInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_A11y_CheckInputs = {};
