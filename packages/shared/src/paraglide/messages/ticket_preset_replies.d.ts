/**
* | output |
* | --- |
* | "Preset replies" |
*
* @param {Ticket_Preset_RepliesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_preset_replies: ((inputs?: Ticket_Preset_RepliesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Preset_RepliesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Preset_RepliesInputs = {};
