/**
* | output |
* | --- |
* | "Searched titles and summaries of {searched} of {total} articles." |
*
* @param {Search_Coverage_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_coverage_articles: ((inputs: Search_Coverage_ArticlesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Coverage_ArticlesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Coverage_ArticlesInputs = {
    searched: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
