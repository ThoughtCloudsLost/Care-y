/**
* | output |
* | --- |
* | "{Queue}" |
*
* @param {Ticket_Bulk_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_bulk_queue: ((inputs: Ticket_Bulk_QueueInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Bulk_QueueInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Bulk_QueueInputs = {
    Queue: NonNullable<unknown>;
};
