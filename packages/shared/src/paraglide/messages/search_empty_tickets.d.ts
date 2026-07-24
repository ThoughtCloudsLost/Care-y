/**
* | output |
* | --- |
* | "No {tickets} match \"{query}\"." |
*
* @param {Search_Empty_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_empty_tickets: ((inputs: Search_Empty_TicketsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Empty_TicketsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Empty_TicketsInputs = {
    tickets: NonNullable<unknown>;
    query: NonNullable<unknown>;
};
