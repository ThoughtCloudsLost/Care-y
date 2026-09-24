/**
* | output |
* | --- |
* | "Recover message history for this client" |
*
* @param {Ticket_Tier_Reseed_ToggleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_reseed_toggle: ((inputs?: Ticket_Tier_Reseed_ToggleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_Reseed_ToggleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_Reseed_ToggleInputs = {};
