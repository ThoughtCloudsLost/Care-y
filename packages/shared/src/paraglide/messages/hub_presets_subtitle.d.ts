/**
* | output |
* | --- |
* | "Reusable reply templates for composing messages" |
*
* @param {Hub_Presets_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_presets_subtitle: ((inputs?: Hub_Presets_SubtitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Presets_SubtitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Presets_SubtitleInputs = {};
