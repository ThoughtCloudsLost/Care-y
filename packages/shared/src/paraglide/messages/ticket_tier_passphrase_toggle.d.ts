/**
* | output |
* | --- |
* | "Add a passphrase" |
*
* @param {Ticket_Tier_Passphrase_ToggleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_passphrase_toggle: ((inputs?: Ticket_Tier_Passphrase_ToggleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_Passphrase_ToggleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_Passphrase_ToggleInputs = {};
