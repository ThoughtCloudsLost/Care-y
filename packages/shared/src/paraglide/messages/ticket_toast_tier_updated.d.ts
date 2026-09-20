/**
* | output |
* | --- |
* | "Communication tier updated" |
*
* @param {Ticket_Toast_Tier_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_tier_updated: ((inputs?: Ticket_Toast_Tier_UpdatedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Toast_Tier_UpdatedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Toast_Tier_UpdatedInputs = {};
