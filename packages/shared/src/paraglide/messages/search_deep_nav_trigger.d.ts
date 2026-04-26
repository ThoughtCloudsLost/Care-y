/**
* | output |
* | --- |
* | "Search encrypted" |
*
* @param {Search_Deep_Nav_TriggerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_deep_nav_trigger: ((inputs?: Search_Deep_Nav_TriggerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Deep_Nav_TriggerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Deep_Nav_TriggerInputs = {};
