/**
* | output |
* | --- |
* | "The {client} will see an option to create a password-protected account on their portal page." |
*
* @param {Ticket_Tier_Offer_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_offer_hint: ((inputs: Ticket_Tier_Offer_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_Offer_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_Offer_HintInputs = {
    client: NonNullable<unknown>;
};
