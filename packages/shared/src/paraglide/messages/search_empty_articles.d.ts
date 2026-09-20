/**
* | output |
* | --- |
* | "No articles match \"{query}\"." |
*
* @param {Search_Empty_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_empty_articles: ((inputs: Search_Empty_ArticlesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Empty_ArticlesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Empty_ArticlesInputs = {
    query: NonNullable<unknown>;
};
