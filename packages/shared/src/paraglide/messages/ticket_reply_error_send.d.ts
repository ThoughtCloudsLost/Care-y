/**
* | output |
* | --- |
* | "Reply failed to send. Tap to retry." |
*
* @param {Ticket_Reply_Error_SendInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_error_send: ((inputs?: Ticket_Reply_Error_SendInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Reply_Error_SendInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Reply_Error_SendInputs = {};
