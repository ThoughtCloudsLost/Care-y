/**
* | output |
* | --- |
* | "No results found." |
*
* @param {Empty_No_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const empty_no_results: ((inputs?: Empty_No_ResultsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Empty_No_ResultsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Empty_No_ResultsInputs = {};
