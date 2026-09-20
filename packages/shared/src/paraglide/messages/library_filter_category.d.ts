/**
* | output |
* | --- |
* | "Category" |
*
* @param {Library_Filter_CategoryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_filter_category: ((inputs?: Library_Filter_CategoryInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Filter_CategoryInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Filter_CategoryInputs = {};
