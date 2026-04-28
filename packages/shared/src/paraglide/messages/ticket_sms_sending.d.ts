/**
* | output |
* | --- |
* | "Sending..." |
*
* @param {Ticket_Sms_SendingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_sms_sending: ((inputs?: Ticket_Sms_SendingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Sms_SendingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Sms_SendingInputs = {};
