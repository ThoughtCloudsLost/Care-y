/**
* | output |
* | --- |
* | "another {queue}" |
*
* @param {Ticket_System_Queue_FallbackInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_system_queue_fallback: ((inputs: Ticket_System_Queue_FallbackInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_System_Queue_FallbackInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_System_Queue_FallbackInputs = {
    queue: NonNullable<unknown>;
};
