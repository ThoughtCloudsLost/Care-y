/**
* | output |
* | --- |
* | "Clear filters" |
*
* @param {Ticket_Clear_FiltersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_clear_filters: ((inputs?: Ticket_Clear_FiltersInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Clear_FiltersInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Clear_FiltersInputs = {};
