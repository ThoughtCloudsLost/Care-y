/**
* | output |
* | --- |
* | "Call and voicemail records will appear here as they are logged." |
*
* @param {Logs_Calls_Empty_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_calls_empty_subtitle: ((inputs?: Logs_Calls_Empty_SubtitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Calls_Empty_SubtitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Calls_Empty_SubtitleInputs = {};
