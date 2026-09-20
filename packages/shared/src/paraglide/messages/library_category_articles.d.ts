/**
* | output |
* | --- |
* | "{count} articles" |
*
* @param {Library_Category_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_category_articles: ((inputs: Library_Category_ArticlesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Category_ArticlesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Category_ArticlesInputs = {
    count: NonNullable<unknown>;
};
