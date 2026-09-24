/**
* | output |
* | --- |
* | "Continuation Link" |
*
* @param {Ticket_Tier_ContinuationInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_continuation: ((inputs?: Ticket_Tier_ContinuationInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_ContinuationInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_ContinuationInputs = {};
