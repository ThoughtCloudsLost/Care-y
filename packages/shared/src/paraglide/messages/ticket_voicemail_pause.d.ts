/**
* | output |
* | --- |
* | "Pause voicemail" |
*
* @param {Ticket_Voicemail_PauseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_voicemail_pause: ((inputs?: Ticket_Voicemail_PauseInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Voicemail_PauseInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Voicemail_PauseInputs = {};
