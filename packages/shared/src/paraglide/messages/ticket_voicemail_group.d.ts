/**
* | output |
* | --- |
* | "Voicemail, {duration}" |
*
* @param {Ticket_Voicemail_GroupInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_voicemail_group: ((inputs: Ticket_Voicemail_GroupInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Voicemail_GroupInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Voicemail_GroupInputs = {
    duration: NonNullable<unknown>;
};
