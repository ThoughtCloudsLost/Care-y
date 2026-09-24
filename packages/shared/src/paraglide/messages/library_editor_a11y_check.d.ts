/**
* | output |
* | --- |
* | "Check accessibility" |
*
* @param {Library_Editor_A11y_CheckInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_a11y_check: ((inputs?: Library_Editor_A11y_CheckInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_A11y_CheckInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_A11y_CheckInputs = {};
