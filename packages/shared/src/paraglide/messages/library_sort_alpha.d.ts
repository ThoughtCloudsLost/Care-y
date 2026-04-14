/**
* | output |
* | --- |
* | "A-Z" |
*
* @param {Library_Sort_AlphaInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_sort_alpha: ((inputs?: Library_Sort_AlphaInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Sort_AlphaInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Sort_AlphaInputs = {};
