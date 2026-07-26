/**
* | output |
* | --- |
* | "Without {tickets}" |
*
* @param {Clients_Filter_Has_Tickets_NoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_filter_has_tickets_no: ((inputs: Clients_Filter_Has_Tickets_NoInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Clients_Filter_Has_Tickets_NoInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Clients_Filter_Has_Tickets_NoInputs = {
    tickets: NonNullable<unknown>;
};
