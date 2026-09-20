/**
* | output |
* | --- |
* | "Phone numbers and call routing" |
*
* @param {Hub_Telephony_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_telephony_subtitle: ((inputs?: Hub_Telephony_SubtitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Telephony_SubtitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Telephony_SubtitleInputs = {};
