/**
* | output |
* | --- |
* | "Organization name, language, and country code" |
*
* @param {Hub_General_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_general_subtitle: ((inputs?: Hub_General_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_General_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_General_SubtitleInputs = {};
