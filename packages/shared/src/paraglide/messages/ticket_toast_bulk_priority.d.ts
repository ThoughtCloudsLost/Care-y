/**
* | output |
* | --- |
* | "Priority updated on {count} {tickets}" |
*
* @param {Ticket_Toast_Bulk_PriorityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_bulk_priority: ((inputs: Ticket_Toast_Bulk_PriorityInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Toast_Bulk_PriorityInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Toast_Bulk_PriorityInputs = {
    count: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
};
