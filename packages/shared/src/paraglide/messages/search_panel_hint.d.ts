/**
* | output |
* | --- |
* | "Results so far come from what this device has already unlocked." |
*
* @param {Search_Panel_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_panel_hint: ((inputs?: Search_Panel_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Panel_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Panel_HintInputs = {};
