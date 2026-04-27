/**
* | output |
* | --- |
* | "Clear filters" |
*
* @param {Ticket_Clear_FiltersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_clear_filters: ((inputs?: Ticket_Clear_FiltersInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Clear_FiltersInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Clear_FiltersInputs = {};
