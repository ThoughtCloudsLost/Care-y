/**
* | output |
* | --- |
* | "{Queue}" |
*
* @param {Ticket_Bulk_QueueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_bulk_queue: ((inputs: Ticket_Bulk_QueueInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Bulk_QueueInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Bulk_QueueInputs = {
    Queue: NonNullable<unknown>;
};
