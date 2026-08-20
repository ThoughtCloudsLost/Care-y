/**
* | output |
* | --- |
* | "Offer account upgrade" |
*
* @param {Ticket_Tier_Offer_ToggleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_offer_toggle: ((inputs?: Ticket_Tier_Offer_ToggleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_Offer_ToggleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_Offer_ToggleInputs = {};
