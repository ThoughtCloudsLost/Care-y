/**
* | output |
* | --- |
* | "Staffing, workload, and scheduling insights" |
*
* @param {Hub_Analytics_Operations_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_analytics_operations_subtitle: ((inputs?: Hub_Analytics_Operations_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Analytics_Operations_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Analytics_Operations_SubtitleInputs = {};
