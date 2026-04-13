/**
* | output |
* | --- |
* | "Message sent" |
*
* @param {Ticket_Toast_Message_SentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_message_sent: ((inputs?: Ticket_Toast_Message_SentInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Toast_Message_SentInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Toast_Message_SentInputs = {};
