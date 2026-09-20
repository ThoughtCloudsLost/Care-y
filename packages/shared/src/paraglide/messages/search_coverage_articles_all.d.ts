/**
* | output |
* | --- |
* | "Searched titles and summaries of all {total} articles." |
*
* @param {Search_Coverage_Articles_AllInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_coverage_articles_all: ((inputs: Search_Coverage_Articles_AllInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Coverage_Articles_AllInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Coverage_Articles_AllInputs = {
    total: NonNullable<unknown>;
};
