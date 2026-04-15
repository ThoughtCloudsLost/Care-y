/**
* | output |
* | --- |
* | "Delete Category" |
*
* @param {Library_Category_DeleteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_category_delete: ((inputs?: Library_Category_DeleteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Category_DeleteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Category_DeleteInputs = {};
