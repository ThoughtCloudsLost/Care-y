/**
* | output |
* | --- |
* | "Set up Secure Link" |
*
* @param {Ticket_Tier_SetupInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_setup: ((inputs?: Ticket_Tier_SetupInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_SetupInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_SetupInputs = {};
