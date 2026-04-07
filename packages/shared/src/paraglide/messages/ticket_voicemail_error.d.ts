/**
* | output |
* | --- |
* | "Could not load voicemail." |
*
* @param {Ticket_Voicemail_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_voicemail_error: ((inputs?: Ticket_Voicemail_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Voicemail_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Voicemail_ErrorInputs = {};
