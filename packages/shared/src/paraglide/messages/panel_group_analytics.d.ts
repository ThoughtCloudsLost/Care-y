/**
* | output |
* | --- |
* | "Analytics" |
*
* @param {Panel_Group_AnalyticsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_group_analytics: ((inputs?: Panel_Group_AnalyticsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_Group_AnalyticsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_Group_AnalyticsInputs = {};
