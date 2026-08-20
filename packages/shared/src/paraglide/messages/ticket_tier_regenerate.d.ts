/**
* | output |
* | --- |
* | "Generate new link" |
*
* @param {Ticket_Tier_RegenerateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_regenerate: ((inputs?: Ticket_Tier_RegenerateInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_RegenerateInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_RegenerateInputs = {};
