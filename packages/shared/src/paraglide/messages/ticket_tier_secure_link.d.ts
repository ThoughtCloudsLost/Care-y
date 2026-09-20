/**
* | output |
* | --- |
* | "Secure Link" |
*
* @param {Ticket_Tier_Secure_LinkInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_secure_link: ((inputs?: Ticket_Tier_Secure_LinkInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_Secure_LinkInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_Secure_LinkInputs = {};
