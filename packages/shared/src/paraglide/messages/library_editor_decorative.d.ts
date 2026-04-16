/**
* | output |
* | --- |
* | "Decorative (no description needed)" |
*
* @param {Library_Editor_DecorativeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_decorative: ((inputs?: Library_Editor_DecorativeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_DecorativeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_DecorativeInputs = {};
