/**
* | output |
* | --- |
* | "Priority" |
*
* @param {Ticket_New_Field_PriorityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_priority: ((inputs?: Ticket_New_Field_PriorityInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_New_Field_PriorityInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_New_Field_PriorityInputs = {};
