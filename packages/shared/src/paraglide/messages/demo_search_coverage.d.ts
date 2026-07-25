/**
* | output |
* | --- |
* | "Coverage of decrypted tickets" |
*
* @param {Demo_Search_CoverageInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_search_coverage: ((inputs?: Demo_Search_CoverageInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Search_CoverageInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Search_CoverageInputs = {};
