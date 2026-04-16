/**
* | output |
* | --- |
* | "Redo" |
*
* @param {Library_Editor_RedoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_redo: ((inputs?: Library_Editor_RedoInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_RedoInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_RedoInputs = {};
