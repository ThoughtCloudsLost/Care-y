/**
* | output |
* | --- |
* | "Manage categories" |
*
* @param {Library_Manage_CategoriesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_manage_categories: ((inputs?: Library_Manage_CategoriesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Manage_CategoriesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Manage_CategoriesInputs = {};
