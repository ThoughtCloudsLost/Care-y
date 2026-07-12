/**
* | output |
* | --- |
* | "Searched titles and summaries of {searched} of {total} articles." |
*
* @param {Search_Coverage_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_coverage_articles: ((inputs: Search_Coverage_ArticlesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Coverage_ArticlesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Coverage_ArticlesInputs = {
    searched: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
