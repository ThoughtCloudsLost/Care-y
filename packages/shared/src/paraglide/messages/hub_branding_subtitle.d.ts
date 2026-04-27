/**
* | output |
* | --- |
* | "Organization name, colors, and theme" |
*
* @param {Hub_Branding_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_branding_subtitle: ((inputs?: Hub_Branding_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Branding_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Branding_SubtitleInputs = {};
