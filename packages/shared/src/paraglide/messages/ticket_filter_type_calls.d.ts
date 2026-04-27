/**
* | output |
* | --- |
* | "Phone Calls" |
*
* @param {Ticket_Filter_Type_CallsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_calls: ((inputs?: Ticket_Filter_Type_CallsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Filter_Type_CallsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Filter_Type_CallsInputs = {};
