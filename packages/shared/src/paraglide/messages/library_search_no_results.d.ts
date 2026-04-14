/**
* | output |
* | --- |
* | "No articles match \"{query}\"" |
*
* @param {Library_Search_No_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_search_no_results: ((inputs: Library_Search_No_ResultsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Search_No_ResultsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Search_No_ResultsInputs = {
    query: NonNullable<unknown>;
};
