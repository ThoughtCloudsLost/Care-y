/**
* | output |
* | --- |
* | "Search inside full articles" |
*
* @param {Search_Fetch_More_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_fetch_more_articles: ((inputs?: Search_Fetch_More_ArticlesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Fetch_More_ArticlesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Fetch_More_ArticlesInputs = {};
