/**
* | output |
* | --- |
* | "Created by the caller at intake" |
*
* @param {Ticket_Tier_Continuation_ProvenanceInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_continuation_provenance: ((inputs?: Ticket_Tier_Continuation_ProvenanceInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_Continuation_ProvenanceInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_Continuation_ProvenanceInputs = {};
