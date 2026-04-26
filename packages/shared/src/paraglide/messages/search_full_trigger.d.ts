/**
* | output |
* | --- |
* | "Search everything" |
*
* @param {Search_Full_TriggerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_full_trigger: ((inputs?: Search_Full_TriggerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Full_TriggerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Full_TriggerInputs = {};
