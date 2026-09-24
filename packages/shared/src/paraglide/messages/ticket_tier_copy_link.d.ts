/**
* | output |
* | --- |
* | "Copy link" |
*
* @param {Ticket_Tier_Copy_LinkInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_copy_link: ((inputs?: Ticket_Tier_Copy_LinkInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_Copy_LinkInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_Copy_LinkInputs = {};
