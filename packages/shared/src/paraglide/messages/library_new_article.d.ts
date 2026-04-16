/**
* | output |
* | --- |
* | "New Article" |
*
* @param {Library_New_ArticleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_new_article: ((inputs?: Library_New_ArticleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_New_ArticleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_New_ArticleInputs = {};
