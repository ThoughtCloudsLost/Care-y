/**
* | output |
* | --- |
* | "Select category" |
*
* @param {Library_Category_Select_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_category_select_placeholder: ((inputs?: Library_Category_Select_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Category_Select_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Category_Select_PlaceholderInputs = {};
