/**
* | output |
* | --- |
* | "Voicemails that could not be routed automatically" |
*
* @param {Hub_Quarantine_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_quarantine_subtitle: ((inputs?: Hub_Quarantine_SubtitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Quarantine_SubtitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Quarantine_SubtitleInputs = {};
