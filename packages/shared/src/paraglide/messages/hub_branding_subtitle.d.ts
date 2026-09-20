/**
* | output |
* | --- |
* | "Organization name, colors, and theme" |
*
* @param {Hub_Branding_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_branding_subtitle: ((inputs?: Hub_Branding_SubtitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Branding_SubtitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Branding_SubtitleInputs = {};
