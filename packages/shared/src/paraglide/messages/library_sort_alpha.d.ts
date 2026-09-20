/**
* | output |
* | --- |
* | "A-Z" |
*
* @param {Library_Sort_AlphaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_sort_alpha: ((inputs?: Library_Sort_AlphaInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Sort_AlphaInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Sort_AlphaInputs = {};
