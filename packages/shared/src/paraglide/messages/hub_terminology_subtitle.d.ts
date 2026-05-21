/**
* | output |
* | --- |
* | "Customize role and item names across the app" |
*
* @param {Hub_Terminology_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_terminology_subtitle: ((inputs?: Hub_Terminology_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Terminology_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Terminology_SubtitleInputs = {};
