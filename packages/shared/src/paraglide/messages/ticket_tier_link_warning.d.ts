/**
* | output |
* | --- |
* | "This link will not be shown again. Copy it or send it before closing." |
*
* @param {Ticket_Tier_Link_WarningInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_link_warning: ((inputs?: Ticket_Tier_Link_WarningInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_Link_WarningInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_Link_WarningInputs = {};
