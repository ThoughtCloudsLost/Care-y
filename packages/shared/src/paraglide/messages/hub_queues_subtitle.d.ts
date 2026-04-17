/**
* | output |
* | --- |
* | "Create and assign ticket queues" |
*
* @param {Hub_Queues_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_queues_subtitle: ((inputs?: Hub_Queues_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Queues_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Queues_SubtitleInputs = {};
