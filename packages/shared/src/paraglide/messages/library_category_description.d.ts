/**
* | output |
* | --- |
* | "Description" |
*
* @param {Library_Category_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_category_description: ((inputs?: Library_Category_DescriptionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Category_DescriptionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Category_DescriptionInputs = {};
