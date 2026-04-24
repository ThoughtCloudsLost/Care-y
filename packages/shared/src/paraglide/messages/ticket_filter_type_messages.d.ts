/**
* | output |
* | --- |
* | "Messages" |
*
* @param {Ticket_Filter_Type_MessagesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_messages: ((inputs?: Ticket_Filter_Type_MessagesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Filter_Type_MessagesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Filter_Type_MessagesInputs = {};
