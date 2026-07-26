/**
* | output |
* | --- |
* | "Has {tickets}" |
*
* @param {Clients_Filter_Has_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_filter_has_tickets: ((inputs: Clients_Filter_Has_TicketsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Clients_Filter_Has_TicketsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Clients_Filter_Has_TicketsInputs = {
    tickets: NonNullable<unknown>;
};
