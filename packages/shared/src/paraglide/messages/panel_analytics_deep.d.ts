/**
* | output |
* | --- |
* | "Research" |
*
* @param {Panel_Analytics_DeepInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_analytics_deep: ((inputs?: Panel_Analytics_DeepInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_Analytics_DeepInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_Analytics_DeepInputs = {};
