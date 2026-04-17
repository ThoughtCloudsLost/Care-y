/**
* | output |
* | --- |
* | "Queue has tickets. Choose a queue to reassign them to." |
*
* @param {Error_Queue_Has_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_queue_has_tickets: ((inputs?: Error_Queue_Has_TicketsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Queue_Has_TicketsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Queue_Has_TicketsInputs = {};
