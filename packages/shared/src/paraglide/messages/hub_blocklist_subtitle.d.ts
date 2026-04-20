/**
* | output |
* | --- |
* | "Blocked numbers" |
*
* @param {Hub_Blocklist_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_blocklist_subtitle: ((inputs?: Hub_Blocklist_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Blocklist_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Blocklist_SubtitleInputs = {};
