/**
* | output |
* | --- |
* | "This message arrived by email. Email is the easiest channel to fake. Check anything important in it before acting on it." |
*
* @param {Ticket_Email_Inbound_CautionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_email_inbound_caution: ((inputs?: Ticket_Email_Inbound_CautionInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Email_Inbound_CautionInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Email_Inbound_CautionInputs = {};
