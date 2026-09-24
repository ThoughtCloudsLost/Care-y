/**
* | output |
* | --- |
* | "Coverage of decrypted tickets" |
*
* @param {Demo_Search_CoverageInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_search_coverage: ((inputs?: Demo_Search_CoverageInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Search_CoverageInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Search_CoverageInputs = {};
