/**
* | output |
* | --- |
* | "Search the handbook" |
*
* @param {Demo_Handbook_Search_OpenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_handbook_search_open: ((inputs?: Demo_Handbook_Search_OpenInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Handbook_Search_OpenInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Handbook_Search_OpenInputs = {};
