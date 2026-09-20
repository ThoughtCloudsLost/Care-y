/**
* | output |
* | --- |
* | "{count} more" |
*
* @param {Search_More_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_more_results: ((inputs: Search_More_ResultsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_More_ResultsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_More_ResultsInputs = {
    count: NonNullable<unknown>;
};
