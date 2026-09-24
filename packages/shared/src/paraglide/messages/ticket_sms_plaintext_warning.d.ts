/**
* | output |
* | --- |
* | "SMS messages are not encrypted." |
*
* @param {Ticket_Sms_Plaintext_WarningInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_sms_plaintext_warning: ((inputs?: Ticket_Sms_Plaintext_WarningInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Sms_Plaintext_WarningInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Sms_Plaintext_WarningInputs = {};
