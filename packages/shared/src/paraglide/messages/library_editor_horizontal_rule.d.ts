/**
* | output |
* | --- |
* | "Horizontal rule" |
*
* @param {Library_Editor_Horizontal_RuleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_horizontal_rule: ((inputs?: Library_Editor_Horizontal_RuleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_Horizontal_RuleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_Horizontal_RuleInputs = {};
