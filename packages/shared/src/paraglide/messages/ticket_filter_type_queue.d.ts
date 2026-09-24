/**
* | output |
* | --- |
* | "{Queue} Changes" |
*
* @param {Ticket_Filter_Type_QueueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_queue: ((inputs: Ticket_Filter_Type_QueueInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Filter_Type_QueueInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Filter_Type_QueueInputs = {
    Queue: NonNullable<unknown>;
    queue: NonNullable<unknown>;
};
