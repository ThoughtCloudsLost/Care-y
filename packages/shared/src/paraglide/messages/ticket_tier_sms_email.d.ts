/**
* | output |
* | --- |
* | "SMS / Email" |
*
* @param {Ticket_Tier_Sms_EmailInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_sms_email: ((inputs?: Ticket_Tier_Sms_EmailInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_Sms_EmailInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_Sms_EmailInputs = {};
