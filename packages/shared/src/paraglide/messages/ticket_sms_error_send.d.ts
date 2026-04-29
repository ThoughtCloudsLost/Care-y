/**
* | output |
* | --- |
* | "SMS failed to send. Tap to retry." |
*
* @param {Ticket_Sms_Error_SendInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_sms_error_send: ((inputs?: Ticket_Sms_Error_SendInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Sms_Error_SendInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Sms_Error_SendInputs = {};
