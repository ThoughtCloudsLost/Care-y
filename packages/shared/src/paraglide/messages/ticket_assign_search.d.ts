/**
* | output |
* | --- |
* | "Search {volunteers}..." |
*
* @param {Ticket_Assign_SearchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_assign_search: ((inputs: Ticket_Assign_SearchInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Assign_SearchInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Assign_SearchInputs = {
    volunteers: NonNullable<unknown>;
};
