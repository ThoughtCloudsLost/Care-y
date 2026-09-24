/**
* | output |
* | --- |
* | "Search this page" |
*
* @param {Search_Inline_TriggerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_inline_trigger: ((inputs?: Search_Inline_TriggerInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Inline_TriggerInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Inline_TriggerInputs = {};
