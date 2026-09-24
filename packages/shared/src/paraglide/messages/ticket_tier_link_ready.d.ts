/**
* | output |
* | --- |
* | "Link ready. Send it now or copy it." |
*
* @param {Ticket_Tier_Link_ReadyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_link_ready: ((inputs?: Ticket_Tier_Link_ReadyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_Link_ReadyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_Link_ReadyInputs = {};
