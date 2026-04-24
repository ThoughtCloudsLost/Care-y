/**
* | output |
* | --- |
* | "Type" |
*
* @param {Ticket_Filter_TypeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type: ((inputs?: Ticket_Filter_TypeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Filter_TypeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Filter_TypeInputs = {};
