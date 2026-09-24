/**
* | output |
* | --- |
* | "Search everything not yet unlocked" |
*
* @param {Search_Panel_TriggerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_panel_trigger: ((inputs?: Search_Panel_TriggerInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Panel_TriggerInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Panel_TriggerInputs = {};
