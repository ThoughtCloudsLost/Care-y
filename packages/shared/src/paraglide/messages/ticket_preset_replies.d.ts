/**
* | output |
* | --- |
* | "Preset replies" |
*
* @param {Ticket_Preset_RepliesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_preset_replies: ((inputs?: Ticket_Preset_RepliesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Preset_RepliesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Preset_RepliesInputs = {};
