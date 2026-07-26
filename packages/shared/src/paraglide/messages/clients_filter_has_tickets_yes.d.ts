/**
* | output |
* | --- |
* | "With {tickets}" |
*
* @param {Clients_Filter_Has_Tickets_YesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_filter_has_tickets_yes: ((inputs: Clients_Filter_Has_Tickets_YesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Clients_Filter_Has_Tickets_YesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Clients_Filter_Has_Tickets_YesInputs = {
    tickets: NonNullable<unknown>;
};
