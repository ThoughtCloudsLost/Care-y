/**
* | output |
* | --- |
* | "Manage Categories" |
*
* @param {Library_Category_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_category_sheet_title: ((inputs?: Library_Category_Sheet_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Category_Sheet_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Category_Sheet_TitleInputs = {};
