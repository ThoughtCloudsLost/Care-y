/**
* | output |
* | --- |
* | "Decorative (no description needed)" |
*
* @param {Library_Editor_DecorativeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_decorative: ((inputs?: Library_Editor_DecorativeInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_DecorativeInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_DecorativeInputs = {};
