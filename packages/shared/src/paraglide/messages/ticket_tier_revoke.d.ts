/**
* | output |
* | --- |
* | "Revoke link" |
*
* @param {Ticket_Tier_RevokeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_revoke: ((inputs?: Ticket_Tier_RevokeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_RevokeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_RevokeInputs = {};
