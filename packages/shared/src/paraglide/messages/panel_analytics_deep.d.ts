/**
* | output |
* | --- |
* | "Research" |
*
* @param {Panel_Analytics_DeepInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_analytics_deep: ((inputs?: Panel_Analytics_DeepInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_Analytics_DeepInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_Analytics_DeepInputs = {};
