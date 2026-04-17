/**
* | output |
* | --- |
* | "Recorded greetings and hold music" |
*
* @param {Hub_Greetings_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_greetings_subtitle: ((inputs?: Hub_Greetings_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Greetings_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Greetings_SubtitleInputs = {};
