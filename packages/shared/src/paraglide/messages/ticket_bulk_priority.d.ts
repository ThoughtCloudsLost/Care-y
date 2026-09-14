/**
* | output |
* | --- |
* | "Priority" |
*
* @param {Ticket_Bulk_PriorityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_bulk_priority: ((inputs?: Ticket_Bulk_PriorityInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Bulk_PriorityInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Bulk_PriorityInputs = {};
