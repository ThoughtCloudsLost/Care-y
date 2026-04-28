/**
* | output |
* | --- |
* | "Select a queue" |
*
* @param {Ticket_New_Error_Queue_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_error_queue_required: ((inputs?: Ticket_New_Error_Queue_RequiredInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_New_Error_Queue_RequiredInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_New_Error_Queue_RequiredInputs = {};
