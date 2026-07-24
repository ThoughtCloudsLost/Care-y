/**
* | output |
* | --- |
* | "Searched titles and summaries of all {total} articles." |
*
* @param {Search_Coverage_Articles_AllInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_coverage_articles_all: ((inputs: Search_Coverage_Articles_AllInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Coverage_Articles_AllInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Coverage_Articles_AllInputs = {
    total: NonNullable<unknown>;
};
