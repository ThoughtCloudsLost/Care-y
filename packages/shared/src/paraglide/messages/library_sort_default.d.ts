/**
* | output |
* | --- |
* | "Default order" |
*
* @param {Library_Sort_DefaultInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_sort_default: ((inputs?: Library_Sort_DefaultInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Sort_DefaultInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Sort_DefaultInputs = {};
