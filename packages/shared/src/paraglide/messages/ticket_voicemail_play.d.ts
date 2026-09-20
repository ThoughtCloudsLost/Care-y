/**
* | output |
* | --- |
* | "Play voicemail" |
*
* @param {Ticket_Voicemail_PlayInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_voicemail_play: ((inputs?: Ticket_Voicemail_PlayInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Voicemail_PlayInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Voicemail_PlayInputs = {};
