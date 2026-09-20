/**
* | output |
* | --- |
* | "Nothing here yet" |
*
* @param {Library_Empty_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_empty_articles: ((inputs?: Library_Empty_ArticlesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Empty_ArticlesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Empty_ArticlesInputs = {};
