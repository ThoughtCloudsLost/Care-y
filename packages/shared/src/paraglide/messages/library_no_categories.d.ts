/**
* | output |
* | --- |
* | "No categories yet" |
*
* @param {Library_No_CategoriesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_no_categories: ((inputs?: Library_No_CategoriesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_No_CategoriesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_No_CategoriesInputs = {};
