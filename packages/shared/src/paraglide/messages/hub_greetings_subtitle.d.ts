/**
* | output |
* | --- |
* | "Recorded greetings and hold music" |
*
* @param {Hub_Greetings_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_greetings_subtitle: ((inputs?: Hub_Greetings_SubtitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Greetings_SubtitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Greetings_SubtitleInputs = {};
