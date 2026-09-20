/**
* | output |
* | --- |
* | "My {Tickets}" |
*
* @param {Dashboard_Section_My_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_section_my_tickets: ((inputs: Dashboard_Section_My_TicketsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Section_My_TicketsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Section_My_TicketsInputs = {
    Tickets: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
};
