/**
* | output |
* | --- |
* | "Manage categories" |
*
* @param {Library_Manage_CategoriesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_manage_categories: ((inputs?: Library_Manage_CategoriesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Manage_CategoriesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Manage_CategoriesInputs = {};
