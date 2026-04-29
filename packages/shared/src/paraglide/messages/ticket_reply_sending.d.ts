/**
* | output |
* | --- |
* | "Sending..." |
*
* @param {Ticket_Reply_SendingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_sending: ((inputs?: Ticket_Reply_SendingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Reply_SendingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Reply_SendingInputs = {};
