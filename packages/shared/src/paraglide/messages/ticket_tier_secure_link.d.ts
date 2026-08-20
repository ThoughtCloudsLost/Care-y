/**
* | output |
* | --- |
* | "Secure Link" |
*
* @param {Ticket_Tier_Secure_LinkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_secure_link: ((inputs?: Ticket_Tier_Secure_LinkInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_Secure_LinkInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_Secure_LinkInputs = {};
