/**
* | output |
* | --- |
* | "Search everything not yet unlocked" |
*
* @param {Search_Deep_Nav_TriggerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_deep_nav_trigger: ((inputs?: Search_Deep_Nav_TriggerInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Deep_Nav_TriggerInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Deep_Nav_TriggerInputs = {};
