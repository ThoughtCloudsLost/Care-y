/**
* | output |
* | --- |
* | "New Ticket" |
*
* @param {Create_New_TicketInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const create_new_ticket: ((inputs?: Create_New_TicketInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Create_New_TicketInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Create_New_TicketInputs = {};
