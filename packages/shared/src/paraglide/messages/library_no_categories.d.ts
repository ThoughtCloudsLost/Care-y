/**
* | output |
* | --- |
* | "No categories yet" |
*
* @param {Library_No_CategoriesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_no_categories: ((inputs?: Library_No_CategoriesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_No_CategoriesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_No_CategoriesInputs = {};
