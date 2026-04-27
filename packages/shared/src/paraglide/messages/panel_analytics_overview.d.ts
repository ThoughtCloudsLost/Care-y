/**
* | output |
* | --- |
* | "Overview" |
*
* @param {Panel_Analytics_OverviewInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_analytics_overview: ((inputs?: Panel_Analytics_OverviewInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_Analytics_OverviewInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_Analytics_OverviewInputs = {};
