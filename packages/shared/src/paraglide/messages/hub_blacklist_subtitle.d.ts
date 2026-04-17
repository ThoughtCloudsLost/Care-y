/**
* | output |
* | --- |
* | "Blocked numbers" |
*
* @param {Hub_Blacklist_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_blacklist_subtitle: ((inputs?: Hub_Blacklist_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Blacklist_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Blacklist_SubtitleInputs = {};
