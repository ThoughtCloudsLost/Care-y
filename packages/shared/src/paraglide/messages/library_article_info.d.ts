/**
* | output |
* | --- |
* | "Article information" |
*
* @param {Library_Article_InfoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_article_info: ((inputs?: Library_Article_InfoInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Article_InfoInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Article_InfoInputs = {};
