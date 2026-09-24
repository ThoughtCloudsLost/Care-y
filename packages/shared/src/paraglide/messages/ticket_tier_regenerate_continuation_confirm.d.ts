/**
* | output |
* | --- |
* | "Regenerating will replace the continuation link with a new volunteer-issued Secure Link. The caller's original link will stop working." |
*
* @param {Ticket_Tier_Regenerate_Continuation_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_regenerate_continuation_confirm: ((inputs?: Ticket_Tier_Regenerate_Continuation_ConfirmInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_Regenerate_Continuation_ConfirmInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_Regenerate_Continuation_ConfirmInputs = {};
