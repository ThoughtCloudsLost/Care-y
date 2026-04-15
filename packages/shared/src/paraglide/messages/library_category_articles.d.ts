/**
* | output |
* | --- |
* | "{count} articles" |
*
* @param {Library_Category_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_category_articles: ((inputs: Library_Category_ArticlesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Category_ArticlesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Category_ArticlesInputs = {
    count: NonNullable<unknown>;
};
