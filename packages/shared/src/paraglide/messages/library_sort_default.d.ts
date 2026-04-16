/**
* | output |
* | --- |
* | "Default order" |
*
* @param {Library_Sort_DefaultInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_sort_default: ((inputs?: Library_Sort_DefaultInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Sort_DefaultInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Sort_DefaultInputs = {};
