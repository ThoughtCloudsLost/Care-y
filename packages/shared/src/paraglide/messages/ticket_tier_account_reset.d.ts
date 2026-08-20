/**
* | output |
* | --- |
* | "Reset account" |
*
* @param {Ticket_Tier_Account_ResetInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_account_reset: ((inputs?: Ticket_Tier_Account_ResetInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_Account_ResetInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_Account_ResetInputs = {};
