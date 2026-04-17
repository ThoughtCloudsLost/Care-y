/**
* | output |
* | --- |
* | "Automated SMS message templates" |
*
* @param {Hub_Sms_Templates_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_sms_templates_subtitle: ((inputs?: Hub_Sms_Templates_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Sms_Templates_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Sms_Templates_SubtitleInputs = {};
