/**
* | output |
* | --- |
* | "Past conversations will become visible in the client's new secure link." |
*
* @param {Ticket_Tier_Reseed_ExplainInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_reseed_explain: ((inputs?: Ticket_Tier_Reseed_ExplainInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_Reseed_ExplainInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_Reseed_ExplainInputs = {};
