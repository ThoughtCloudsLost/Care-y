/**
* | output |
* | --- |
* | "Search handbook..." |
*
* @param {Demo_Handbook_Search_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_handbook_search_placeholder: ((inputs?: Demo_Handbook_Search_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Handbook_Search_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Handbook_Search_PlaceholderInputs = {};
