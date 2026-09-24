/**
* | output |
* | --- |
* | "No results found." |
*
* @param {Empty_No_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const empty_no_results: ((inputs?: Empty_No_ResultsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Empty_No_ResultsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Empty_No_ResultsInputs = {};
