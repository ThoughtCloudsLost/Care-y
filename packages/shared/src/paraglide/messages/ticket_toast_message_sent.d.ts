/**
* | output |
* | --- |
* | "Message sent" |
*
* @param {Ticket_Toast_Message_SentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_message_sent: ((inputs?: Ticket_Toast_Message_SentInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Toast_Message_SentInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Toast_Message_SentInputs = {};
