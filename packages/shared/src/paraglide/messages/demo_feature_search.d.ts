/**
* | output |
* | --- |
* | "Search" |
*
* @param {Demo_Feature_SearchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_feature_search: ((inputs?: Demo_Feature_SearchInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Feature_SearchInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Feature_SearchInputs = {};
