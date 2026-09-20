/**
* | output |
* | --- |
* | "{Queue}" |
*
* @param {Ticket_New_Field_QueueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_queue: ((inputs: Ticket_New_Field_QueueInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_New_Field_QueueInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_New_Field_QueueInputs = {
    Queue: NonNullable<unknown>;
};
