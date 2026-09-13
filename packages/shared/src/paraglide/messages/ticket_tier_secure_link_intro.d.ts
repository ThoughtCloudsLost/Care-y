/**
* | output |
* | --- |
* | "Creates a private page where they can read and send messages." |
*
* @param {Ticket_Tier_Secure_Link_IntroInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_secure_link_intro: ((inputs?: Ticket_Tier_Secure_Link_IntroInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_Secure_Link_IntroInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_Secure_Link_IntroInputs = {};
