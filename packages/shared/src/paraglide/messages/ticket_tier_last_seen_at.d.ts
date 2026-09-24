/**
* | output |
* | --- |
* | "Last opened {time}" |
*
* @param {Ticket_Tier_Last_Seen_AtInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_last_seen_at: ((inputs: Ticket_Tier_Last_Seen_AtInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_Last_Seen_AtInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_Last_Seen_AtInputs = {
    time: NonNullable<unknown>;
};
