/**
* | output |
* | --- |
* | "No results for \"{query}\"" |
*
* @param {Search_No_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_no_results: ((inputs: Search_No_ResultsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_No_ResultsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_No_ResultsInputs = {
    query: NonNullable<unknown>;
};
