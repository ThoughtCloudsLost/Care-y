/**
* | output |
* | --- |
* | "Blocked numbers" |
*
* @param {Hub_Blocklist_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_blocklist_subtitle: ((inputs?: Hub_Blocklist_SubtitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Blocklist_SubtitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Blocklist_SubtitleInputs = {};
