/**
* | output |
* | --- |
* | "Note categories, escalation routing, and system event types" |
*
* @param {Hub_Note_Types_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_note_types_subtitle: ((inputs?: Hub_Note_Types_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Note_Types_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Note_Types_SubtitleInputs = {};
