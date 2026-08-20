/**
* | output |
* | --- |
* | "Showing deep search results" |
*
* @param {Demo_Search_Deep_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_search_deep_results: ((inputs?: Demo_Search_Deep_ResultsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Search_Deep_ResultsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Search_Deep_ResultsInputs = {};
