/**
* | output |
* | --- |
* | "Analytics" |
*
* @param {Panel_Group_AnalyticsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_group_analytics: ((inputs?: Panel_Group_AnalyticsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_Group_AnalyticsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_Group_AnalyticsInputs = {};
