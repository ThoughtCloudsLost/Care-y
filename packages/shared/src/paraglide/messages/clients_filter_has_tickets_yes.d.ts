/**
* | output |
* | --- |
* | "With {tickets}" |
*
* @param {Clients_Filter_Has_Tickets_YesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const clients_filter_has_tickets_yes: ((inputs: Clients_Filter_Has_Tickets_YesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Clients_Filter_Has_Tickets_YesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Clients_Filter_Has_Tickets_YesInputs = {
    tickets: NonNullable<unknown>;
};
