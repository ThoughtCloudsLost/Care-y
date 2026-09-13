/**
* | output |
* | --- |
* | "Reset this account? The {client}'s message history will become permanently unreadable. You will need to create a new Secure Link and offer the upgrade again." |
*
* @param {Ticket_Tier_Account_Reset_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_account_reset_confirm: ((inputs: Ticket_Tier_Account_Reset_ConfirmInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_Account_Reset_ConfirmInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_Account_Reset_ConfirmInputs = {
    client: NonNullable<unknown>;
};
