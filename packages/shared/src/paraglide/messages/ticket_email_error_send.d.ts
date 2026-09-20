/**
* | output |
* | --- |
* | "Email failed to send. Tap to retry." |
*
* @param {Ticket_Email_Error_SendInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_email_error_send: ((inputs?: Ticket_Email_Error_SendInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Email_Error_SendInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Email_Error_SendInputs = {};
