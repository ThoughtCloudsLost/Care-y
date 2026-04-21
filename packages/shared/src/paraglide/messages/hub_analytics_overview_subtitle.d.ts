/**
* | output |
* | --- |
* | "Key metrics and volume trends at a glance" |
*
* @param {Hub_Analytics_Overview_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_analytics_overview_subtitle: ((inputs?: Hub_Analytics_Overview_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Analytics_Overview_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Analytics_Overview_SubtitleInputs = {};
