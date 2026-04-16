/**
* | output |
* | --- |
* | "Category name is required" |
*
* @param {Library_Category_Name_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_category_name_required: ((inputs?: Library_Category_Name_RequiredInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Category_Name_RequiredInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Category_Name_RequiredInputs = {};
