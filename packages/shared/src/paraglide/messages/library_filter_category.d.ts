/**
* | output |
* | --- |
* | "Category" |
*
* @param {Library_Filter_CategoryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_filter_category: ((inputs?: Library_Filter_CategoryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Filter_CategoryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Filter_CategoryInputs = {};
