/**
* | output |
* | --- |
* | "Revoke this link? The {client} will no longer be able to read or send messages through the portal. You can generate a new link afterward." |
*
* @param {Ticket_Tier_Revoke_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_revoke_confirm: ((inputs: Ticket_Tier_Revoke_ConfirmInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_Revoke_ConfirmInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_Revoke_ConfirmInputs = {
    client: NonNullable<unknown>;
};
