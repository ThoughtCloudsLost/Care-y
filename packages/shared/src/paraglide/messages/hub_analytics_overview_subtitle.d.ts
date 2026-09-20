/**
* | output |
* | --- |
* | "Key metrics and volume trends at a glance" |
*
* @param {Hub_Analytics_Overview_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_analytics_overview_subtitle: ((inputs?: Hub_Analytics_Overview_SubtitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Analytics_Overview_SubtitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Analytics_Overview_SubtitleInputs = {};
