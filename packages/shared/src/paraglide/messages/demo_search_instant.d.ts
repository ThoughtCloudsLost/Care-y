/**
* | output |
* | --- |
* | "Showing instant results" |
*
* @param {Demo_Search_InstantInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_search_instant: ((inputs?: Demo_Search_InstantInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Search_InstantInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Search_InstantInputs = {};
