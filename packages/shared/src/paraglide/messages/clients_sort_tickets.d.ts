/**
* | output |
* | --- |
* | "Ticket count" |
*
* @param {Clients_Sort_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_sort_tickets: ((inputs?: Clients_Sort_TicketsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Clients_Sort_TicketsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Clients_Sort_TicketsInputs = {};
