/**
* | output |
* | --- |
* | "Searched all {total} articles and their full text." |
*
* @param {Search_Coverage_Articles_DeepInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_coverage_articles_deep: ((inputs: Search_Coverage_Articles_DeepInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Coverage_Articles_DeepInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Coverage_Articles_DeepInputs = {
    total: NonNullable<unknown>;
};
