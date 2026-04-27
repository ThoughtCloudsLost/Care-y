/**
* | output |
* | --- |
* | "Personal identifying information retention and lifecycle" |
*
* @param {Hub_Retention_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_retention_subtitle: ((inputs?: Hub_Retention_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Retention_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Retention_SubtitleInputs = {};
