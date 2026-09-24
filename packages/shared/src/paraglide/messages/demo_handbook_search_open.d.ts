/**
* | output |
* | --- |
* | "Search the handbook" |
*
* @param {Demo_Handbook_Search_OpenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_handbook_search_open: ((inputs?: Demo_Handbook_Search_OpenInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Handbook_Search_OpenInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Handbook_Search_OpenInputs = {};
