/**
* | output |
* | --- |
* | "{Tickets}" |
*
* @param {Search_Section_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_section_tickets: ((inputs: Search_Section_TicketsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Section_TicketsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Section_TicketsInputs = {
    Tickets: NonNullable<unknown>;
};
