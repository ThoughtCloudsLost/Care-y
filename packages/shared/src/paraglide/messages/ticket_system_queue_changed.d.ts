/**
* | output |
* | --- |
* | "Moved to {queueName}" |
*
* @param {Ticket_System_Queue_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_system_queue_changed: ((inputs: Ticket_System_Queue_ChangedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_System_Queue_ChangedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_System_Queue_ChangedInputs = {
    queueName: NonNullable<unknown>;
};
