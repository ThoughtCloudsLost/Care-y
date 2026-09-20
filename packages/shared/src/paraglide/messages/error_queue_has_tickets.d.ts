/**
* | output |
* | --- |
* | "{Queue} has {tickets}. Choose a {queue} to reassign them to." |
*
* @param {Error_Queue_Has_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_queue_has_tickets: ((inputs: Error_Queue_Has_TicketsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Queue_Has_TicketsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Queue_Has_TicketsInputs = {
    Queue: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
    queue: NonNullable<unknown>;
};
