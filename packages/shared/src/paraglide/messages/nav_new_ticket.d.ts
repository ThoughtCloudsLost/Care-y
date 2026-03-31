/**
* | output |
* | --- |
* | "New Ticket" |
*
* @param {Nav_New_TicketInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const nav_new_ticket: ((inputs?: Nav_New_TicketInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Nav_New_TicketInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Nav_New_TicketInputs = {};
