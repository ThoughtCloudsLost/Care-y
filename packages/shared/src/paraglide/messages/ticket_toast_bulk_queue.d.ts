/**
* | output |
* | --- |
* | "Queue updated on {count} {tickets}" |
*
* @param {Ticket_Toast_Bulk_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_bulk_queue: ((inputs: Ticket_Toast_Bulk_QueueInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Toast_Bulk_QueueInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Toast_Bulk_QueueInputs = {
    count: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
};
