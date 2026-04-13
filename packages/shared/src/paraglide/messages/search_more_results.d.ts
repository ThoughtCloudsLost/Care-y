/**
* | output |
* | --- |
* | "{count} more" |
*
* @param {Search_More_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_more_results: ((inputs: Search_More_ResultsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_More_ResultsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_More_ResultsInputs = {
    count: NonNullable<unknown>;
};
