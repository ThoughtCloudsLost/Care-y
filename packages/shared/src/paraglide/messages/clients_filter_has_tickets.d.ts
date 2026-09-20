/**
* | output |
* | --- |
* | "Has {tickets}" |
*
* @param {Clients_Filter_Has_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const clients_filter_has_tickets: ((inputs: Clients_Filter_Has_TicketsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Clients_Filter_Has_TicketsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Clients_Filter_Has_TicketsInputs = {
    tickets: NonNullable<unknown>;
};
