/**
* | output |
* | --- |
* | "Slower, heavier reports drawn from decrypted conversations, to understand what your community needs" |
*
* @param {Hub_Analytics_Deep_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_analytics_deep_subtitle: ((inputs?: Hub_Analytics_Deep_SubtitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Analytics_Deep_SubtitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Analytics_Deep_SubtitleInputs = {};
