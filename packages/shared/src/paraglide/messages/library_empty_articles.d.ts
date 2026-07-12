/**
* | output |
* | --- |
* | "Nothing here yet" |
*
* @param {Library_Empty_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_empty_articles: ((inputs?: Library_Empty_ArticlesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Empty_ArticlesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Empty_ArticlesInputs = {};
