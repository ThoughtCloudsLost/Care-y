/**
* | output |
* | --- |
* | "Personal identifying information retention and lifecycle" |
*
* @param {Hub_Retention_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_retention_subtitle: ((inputs?: Hub_Retention_SubtitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Retention_SubtitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Retention_SubtitleInputs = {};
