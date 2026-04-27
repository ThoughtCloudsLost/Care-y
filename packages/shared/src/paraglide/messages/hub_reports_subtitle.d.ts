/**
* | output |
* | --- |
* | "Usage statistics and activity reports" |
*
* @param {Hub_Reports_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_reports_subtitle: ((inputs?: Hub_Reports_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Reports_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Reports_SubtitleInputs = {};
