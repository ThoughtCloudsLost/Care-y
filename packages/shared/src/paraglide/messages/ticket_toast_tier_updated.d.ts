/**
* | output |
* | --- |
* | "Communication tier updated" |
*
* @param {Ticket_Toast_Tier_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_tier_updated: ((inputs?: Ticket_Toast_Tier_UpdatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Toast_Tier_UpdatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Toast_Tier_UpdatedInputs = {};
