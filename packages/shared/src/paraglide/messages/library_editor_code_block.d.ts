/**
* | output |
* | --- |
* | "Code block" |
*
* @param {Library_Editor_Code_BlockInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_code_block: ((inputs?: Library_Editor_Code_BlockInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_Code_BlockInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_Code_BlockInputs = {};
