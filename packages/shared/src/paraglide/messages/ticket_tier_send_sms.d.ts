/**
* | output |
* | --- |
* | "Send by SMS" |
*
* @param {Ticket_Tier_Send_SmsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_send_sms: ((inputs?: Ticket_Tier_Send_SmsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_Send_SmsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_Send_SmsInputs = {};
